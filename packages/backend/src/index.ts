import { cron, Patterns } from '@elysiajs/cron';
import { Elysia, t } from 'elysia';
import { prisma } from './libs/db';
import { validateAndNormalizePath } from './libs/securityUtils';
import { getDateNDaysAgo, getDiskUsage } from './libs/utils';
import { cleanupService } from './services/cleanup.service';
import { getConfig, updateConfig } from './services/config.service';
import { copyDirService } from './services/copy.service';
import {
    deleteRedundantDirectories,
    spaceControlService,
} from './services/delete.service';

const config = await getConfig();

const app = new Elysia()
    .use(
        cron({
            name: 'everyHour',
            pattern: Patterns.everyHours(1),
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { src, dest } = config;
                const todayDir = getDateNDaysAgo(0);
                await copyDirService(
                    `${src}/${todayDir}`,
                    `${dest}/${todayDir}`
                );
            },
        })
    )
    .use(
        cron({
            name: 'everyYesterday',
            pattern: Patterns.EVERY_DAY_AT_10PM,
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { src, dest } = config;
                const yesterdayDir = getDateNDaysAgo(1);
                await copyDirService(
                    `${src}/${yesterdayDir}`,
                    `${dest}/${yesterdayDir}`
                );
            },
        })
    )
    .use(
        cron({
            name: 'srcSpaceControl',
            timezone: 'Europe/Moscow',
            pattern: Patterns.EVERY_DAY_AT_3AM,
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { src, limit } = config;
                try {
                    await spaceControlService(src, limit);
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(
                            `Error in srcSpaceControl cron job: ${error.message}`
                        );
                        await prisma.errorLog.create({
                            data: {
                                errorMsg: error.message,
                                targetDir: src,
                            },
                        });
                    } else {
                        console.error(
                            'Unknown error in srcSpaceControl cron job'
                        );
                        await prisma.errorLog.create({
                            data: {
                                errorMsg:
                                    'Unknown error in srcSpaceControl cron job',
                                targetDir: src,
                            },
                        });
                    }
                }
            },
        })
    )
    .use(
        cron({
            name: 'destSpaceControl',
            pattern: Patterns.EVERY_DAY_AT_4AM,
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { dest, limit } = config;
                try {
                    await spaceControlService(dest, limit);
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(
                            `Error in destSpaceControl cron job: ${error.message}`
                        );
                    } else {
                        console.error(
                            'Unknown error in destSpaceControl cron job'
                        );
                    }
                }
            },
        })
    )
    .use(
        cron({
            name: 'cleanup',
            pattern: Patterns.EVERY_DAY_AT_5AM,
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { cleanupDays } = config;
                await cleanupService(cleanupDays);
            },
        })
    )
    .use(
        cron({
            name: 'deleteRedundantDirectories',
            pattern: Patterns.EVERY_DAY_AT_6AM,
            async run() {
                if (!config) {
                    console.error('No config found');
                    return;
                }
                const { src } = config;
                await deleteRedundantDirectories(src);
            },
        })
    )
    .get('/', () => 'Hello Elysia')
    .get('/space', async () => {
        if (!config) {
            console.error('No config found');
            return;
        }
        const { src, dest } = config;
        try {
            const srcDiskUsage = await getDiskUsage(src);
            const targetDiskUsage = await getDiskUsage(dest);
            return { srcDiskUsage, targetDiskUsage };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error getting disk usage: ${error.message}`);
            } else {
                console.error('Unknown error getting disk usage');
            }
            return { error: 'Failed to get disk usage' };
        }
    })
    .get('/config', async () => {
        try {
            const confitToreturn = await getConfig();
            if (!confitToreturn) {
                console.error('No config found');
                return { error: 'No config found' };
            }
            return confitToreturn;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error getting config: ${error.message}`);
            }
            return { error: 'Failed to get config' };
        }
    })
    .get('/copy', async () => {
        try {
            return await prisma.copyLog.findMany();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error getting copy logs: ${error.message}`);
            } else {
                console.error('Unknown error getting copy logs');
            }
            return { error: 'Failed to get copy logs' };
        }
    })
    .get('/delete', async () => {
        try {
            return await prisma.deleteLog.findMany();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error getting delete logs: ${error.message}`);
            } else {
                console.error('Unknown error getting delete logs');
            }
            return { error: 'Failed to get delete logs' };
        }
    })
    .get('/errors', async () => {
        try {
            return await prisma.errorLog.findMany();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error getting error logs: ${error.message}`);
            } else {
                console.error('Unknown error getting error logs');
            }
            return { error: 'Failed to get error logs' };
        }
    })
    .post(
        '/config',
        async ({ body }) => {
            try {
                const validatedSrc = validateAndNormalizePath(body.src);
                const validatedDest = validateAndNormalizePath(body.dest);
                const validatedBody = {
                    ...body,
                    src: validatedSrc,
                    dest: validatedDest,
                };
                return await updateConfig(validatedBody);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error updating config: ${error.message}`);
                } else {
                    console.error('Unknown error updating config');
                }
                return { error: 'Failed to update config' };
            }
        },
        {
            body: t.Object({
                src: t.String(),
                dest: t.String(),
                limit: t.Number(),
                concurrency: t.Number(),
                cleanupDays: t.Number(),
            }),
        }
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
