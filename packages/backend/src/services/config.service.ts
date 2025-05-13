import { prisma } from '../libs/db';

interface Config {
    src: string;
    dest: string;
    limit: number;
    concurrency: number;
    cleanupDays: number;
}

export async function getConfig() {
    try {
        const config = await prisma.config.findUnique({ where: { id: 1 } });
        return config;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error getting config: ${error.message}`);
            await prisma.errorLog.create({
                data: {
                    errorMsg: error.message,
                    targetDir: 'config',
                },
            });
        } else {
            console.error('Unknown error getting config');
            await prisma.errorLog.create({
                data: {
                    errorMsg: 'Unknown error getting config',
                    targetDir: 'config',
                },
            });
        }
    }
}

export async function updateConfig(data: Config) {
    try {
        return prisma.config.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating config: ${error.message}`);
            await prisma.errorLog.create({
                data: {
                    errorMsg: error.message,
                    targetDir: 'config',
                },
            });
        } else {
            console.error('Unknown error updating config');
            await prisma.errorLog.create({
                data: {
                    errorMsg: 'Unknown error updating config',
                    targetDir: 'config',
                },
            });
        }
    }
}

export async function deleteConfig() {
    try {
        return prisma.config.delete({ where: { id: 1 } });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting config: ${error.message}`);
            await prisma.errorLog.create({
                data: {
                    errorMsg: error.message,
                    targetDir: 'config',
                },
            });
        } else {
            console.error('Unknown error deleting config');
            await prisma.errorLog.create({
                data: {
                    errorMsg: 'Unknown error deleting config',
                    targetDir: 'config',
                },
            });
        }
    }
}
