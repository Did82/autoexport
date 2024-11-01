type DiskUsage = {
    free: number;
    used: number;
    total: number;
    percentage: number;
    oldestFolder: string;
    newestFolder: string;
};

type SpaceData = {
    srcDiskUsage: DiskUsage;
    targetDiskUsage: DiskUsage;
};

type CopyLog = {
    id: string;
    createdAt: string;
    copiedDir: string;
    filesCopied: number;
    totalTime: number;
    bytesCopied: string;
};

type DeleteLog = {
    id: string;
    createdAt: string;
    deletedDir: string;
    totalTime: number;
    percentageAfterDelete: number;
};

type Config = {
    src: string;
    dest: string;
    limit: number;
    concurrency: number;
    cleanupDays: number;
};

type ConfigWithPath = {
    path: string;
    limit: number;
};

type ErrorLog = {
    id: string;
    createdAt: string;
    errorMsg: string;
    targetDir: string;
};

export type {
    DiskUsage,
    SpaceData,
    CopyLog,
    DeleteLog,
    Config,
    ConfigWithPath,
    ErrorLog,
};
