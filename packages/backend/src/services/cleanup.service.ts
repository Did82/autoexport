import { prisma } from '../libs/db';

// const { cleanupDays } = config;
// const cleanupLt = new Date(Date.now() - cleanupDays * 24 * 60 * 60 * 1000);

export const cleanupService = async (cleanupDays: number) => {
    const cleanupLt = new Date(Date.now() - cleanupDays * 24 * 60 * 60 * 1000);

    try {
        await prisma.deleteLog.deleteMany({
            where: {
                createdAt: {
                    lt: cleanupLt,
                },
            },
        });
        await prisma.copyLog.deleteMany({
            where: {
                createdAt: {
                    lt: cleanupLt,
                },
            },
        });
        await prisma.errorLog.deleteMany({
            where: {
                createdAt: {
                    lt: cleanupLt,
                },
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error cleaning up database: ${error.message}`);
            await prisma.errorLog.create({
                data: {
                    errorMsg: error.message,
                    targetDir: 'cleanup',
                },
            });
        } else {
            console.error('Unknown error cleaning up database');
        }
    }
};
