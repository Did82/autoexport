import { difference } from "es-toolkit";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

interface CopyOptions {
  overwrite?: boolean;
}

interface CopyFiles {
  src: string;
  dest: string;
  options?: CopyOptions;
}

interface CopyResult {
  filesCopied: number;
  bytesCopied: number;
  totalTime: number;
}

const isDirectory = async (path: string): Promise<boolean> => {
  const stats = await stat(path);
  return stats.isDirectory();
};

async function copyFile(src: string, dest: string): Promise<number | null> {
  const fileContent = Bun.file(src);
  return Bun.write(dest, fileContent);
}

// const diffArray = (arr1: string[], arr2: string[]): string[] => {
// 	const set2 = new Set(arr2);
// 	return arr1.filter((item) => !set2.has(item));
// };

const diffFiles = async (src: string, dest: string): Promise<string[]> => {
  const srcFiles = await readdir(src, { recursive: true });
  const destFiles = await readdir(dest, { recursive: true });
  return difference(srcFiles, destFiles);
};

const copyFiles = async (files: CopyFiles): Promise<CopyResult> => {
  const start = Date.now();
  let filesCopied = 0;
  let bytesCopied = 0;
  await mkdir(files.dest, { recursive: true });

  const { src, dest, options } = files;

  const filesToCopy = await diffFiles(src, dest);

  if (filesToCopy.length === 0) {
    return {
      filesCopied,
      bytesCopied,
      totalTime: Date.now() - start,
    };
  }

  const copyPromises = filesToCopy.map(async (file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const isDir = await isDirectory(srcPath);
    let copied = 0;

    if (isDir) {
      await mkdir(destPath, { recursive: true });
      return copied;
    }

    copied = (await copyFile(srcPath, destPath)) || 0;
    return copied;
  });

  const copiedBytes = await Promise.all(copyPromises);
  filesCopied = copiedBytes.length;
  bytesCopied = copiedBytes.reduce((acc, curr) => acc + curr, 0);
  const end = Date.now();

  return {
    filesCopied,
    bytesCopied,
    totalTime: end - start,
  };
};

export { copyFiles };
