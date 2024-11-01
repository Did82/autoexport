import path from 'node:path';
import fs from 'node:fs';

export function validateAndNormalizePath(inputPath: string): string {
    // Нормализуем путь
    const normalizedPath = path.normalize(inputPath);

    // Проверяем, что путь абсолютный
    if (!path.isAbsolute(normalizedPath)) {
        throw new Error('Path must be absolute');
    }

    // Проверяем существование директории
    if (!fs.existsSync(normalizedPath)) {
        throw new Error(`Path does not exist: ${normalizedPath}`);
    }

    // Проверяем, что это директория, а не файл
    if (!fs.statSync(normalizedPath).isDirectory()) {
        throw new Error(`Path is not a directory: ${normalizedPath}`);
    }

    return normalizedPath;
}
