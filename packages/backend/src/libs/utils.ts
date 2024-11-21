import { $ } from 'bun';
import { readdir } from 'node:fs/promises';

const humanizeTime = (timeInMs: number): string => {
    if (timeInMs < 1000) {
        return `${timeInMs}ms`;
    }

    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }

    return `${seconds}s`;
};

// Helper function to format date
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// Function to get the date for 'n' days ago
const getDateNDaysAgo = (n: number) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return formatDate(date);
};

// Now you can get the date for today, yesterday, and the day before yesterday like this:
// const today = getDateNDaysAgo(0);
// const yesterday = getDateNDaysAgo(1);
// const dayBeforeYesterday = getDateNDaysAgo(2);
// const dayYearAgo = getDateNDaysAgo(366);

// Function to filter dates older than 'n' days
const filterOldDates = (dates: string[], n: number) => {
    return dates.filter((date) => date < getDateNDaysAgo(n));
};

// Function to filter dates older than one year ago
const filterOldDatesOneYearAgo = (dates: string[]) => {
    return filterOldDates(dates, 366);
};

const getOldestDate = (dates: string[]) => {
    return dates.reduce((oldest, current) => {
        return oldest < current ? oldest : current;
    }, dates[0] || '');
};

const getNewestDate = (dates: string[]) => {
    return dates.reduce((newest, current) => {
        return newest > current ? newest : current;
    }, dates[0] || '');
};

const getDiskUsage = async (folderPath: string) => {
    const stdout = await $`df -k ${folderPath}`.text();
    const lines = stdout.trim().split('\n');
    const info = lines[1].split(/\s+/);
    const free = Number.parseInt(info[3], 10) * 1024;
    const used = Number.parseInt(info[2], 10) * 1024;
    const total = Number.parseInt(info[1], 10) * 1024;
    const percentage = Math.floor((used / total) * 100);
    const folders = await readdir(folderPath);
    const oldestFolder = getOldestDate(folders);
    const newestFolder = getNewestDate(folders);

    return {
        free,
        used,
        total,
        percentage,
        oldestFolder,
        newestFolder,
    };
};

const getFilteredDirectories = async (folderPath: string) => {
    const dirs = await readdir(folderPath);
    return dirs.filter((dir) => !dir.match(/^\d{8}$/));
};

export {
    getDateNDaysAgo,
    filterOldDatesOneYearAgo,
    humanizeTime,
    getDiskUsage,
    getOldestDate,
    getFilteredDirectories,
};
