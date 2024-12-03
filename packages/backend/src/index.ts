import { cron, Patterns } from '@elysiajs/cron';
import { Elysia } from 'elysia';
import { getDateNDaysAgo, getDiskUsage } from './libs/utils';
import { validateAndNormalizePath } from './libs/securityUtils';
import { copyDirService } from './services/copy.service';
import { prisma } from './libs/db';
import {
    deleteRedundantDirectories,
    spaceControlService,
} from './services/delete.service';
import { cleanupService } from './services/cleanup.service';
import { config } from './libs/config';

let validatedSrc: string;
let validatedDest: string;

const { src, dest, limit } = config;

try {
    validatedSrc = validateAndNormalizePath(src);
    validatedDest = validateAndNormalizePath(dest);
} catch (error) {
    console.error(
        `Configuration error: ${
            error instanceof Error ? error.message : 'Unknown error'
        }`
    );
    process.exit(1);
}

const app = new Elysia()
    .use(
        cron({
            name: 'everyHour',
            pattern: Patterns.everyHours(1),
            async run() {
                const todayDir = getDateNDaysAgo(0);
                await copyDirService(
                    `${validatedSrc}/${todayDir}`,
                    `${validatedDest}/${todayDir}`
                );
            },
        })
    )
    .use(
        cron({
            name: 'everyYesterday',
            pattern: Patterns.EVERY_DAY_AT_10PM,
            async run() {
                const yesterdayDir = getDateNDaysAgo(1);
                await copyDirService(
                    `${validatedSrc}/${yesterdayDir}`,
                    `${validatedDest}/${yesterdayDir}`
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
                await cleanupService();
            },
        })
    )
    .use(
        cron({
            name: 'deleteRedundantDirectories',
            pattern: Patterns.EVERY_DAY_AT_6AM,
            async run() {
                await deleteRedundantDirectories(validatedSrc);
            },
        })
    )
    .get('/', () => 'Hello Elysia')
    .get('/space', async () => {
        try {
            const srcDiskUsage = await getDiskUsage(validatedSrc);
            const targetDiskUsage = await getDiskUsage(validatedDest);
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
    .get('/config', () => {
        const srcToReturn = process.env.SRC_PATH;
        const trgToReturn = process.env.TRG_PATH;
        const configToReturn = {
            ...config,
            src: srcToReturn,
            dest: trgToReturn,
        };
        return configToReturn;
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
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
