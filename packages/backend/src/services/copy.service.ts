import { stat } from 'node:fs/promises';
import { copyFiles } from '../libs/copy';
import { prisma } from '../libs/db';

const copyDirService = async (src: string, dest: string) => {
    try {
        // Проверяем, существует ли src директория
        try {
            const stats = await stat(src);
            if (!stats.isDirectory()) {
                // Если это не директория, просто выходим
                return;
            }
        } catch (err) {
            // Если директория не существует, не считаем это ошибкой
            if ((err as any).code === 'ENOENT') {
                return;
            }
            throw err;
        }
        const copiedDir = dest.split('/').pop() || '';
        const result = await copyFiles({
            src,
            dest,
        });
        await prisma.copyLog.create({
            data: {
                copiedDir,
                filesCopied: result.filesCopied,
                bytesCopied: result.bytesCopied.toString(),
                totalTime: result.totalTime,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error in copy cron job: ${error.message}`);
            await prisma.errorLog.create({
                data: {
                    errorMsg: error.message,
                    targetDir: src,
                },
            });
        } else {
            console.error('Unknown error in copy cron job');
            await prisma.errorLog.create({
                data: {
                    errorMsg: 'Unknown error in copy cron job',
                    targetDir: src,
                },
            });
        }
    }
};

export { copyDirService };
