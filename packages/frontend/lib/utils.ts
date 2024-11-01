import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatBytes(bytes: string | number) {
    const bytesInt = parseInt(bytes as string, 10);
    if (bytesInt === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytesInt) / Math.log(k));
    return parseFloat((bytesInt / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
};

export const humanizeTime = (timeInMs: number): string => {
    if (timeInMs < 1000) {
        return `${timeInMs} мс`;
    }

    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} д ${hours % 24}ч ${minutes % 60}м ${seconds % 60}с`;
    }

    if (hours > 0) {
        return `${hours} ч ${minutes % 60}м ${seconds % 60}с`;
    }

    if (minutes > 0) {
        return `${minutes} м ${seconds % 60}с`;
    }

    return `${seconds} с`;
};
