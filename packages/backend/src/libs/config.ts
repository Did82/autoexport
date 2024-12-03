// import config from '../../config.json';
const src = '/mnt/ftp';
const dest = '/mnt/smb';
// const src = process.env.SRC_PATH || '/mnt/ftp';
// const dest = process.env.TRG_PATH || '/mnt/smb';
// export const { src, dest, limit } = config;
export const config = {
    // src: '/Users/dima/test/src',
    // dest: '/Users/dima/test/trg',
    src,
    dest,
    limit: 78,
    concurrency: 1,
    cleanupDays: 90,
};
