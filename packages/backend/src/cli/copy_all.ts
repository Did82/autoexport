import { readdir } from "node:fs/promises";
import config from "../../config.json";
import ora from "ora";
import { copyFiles } from "../libs/copy";
import { humanizeTime } from "../libs/utils";
import { validateAndNormalizePath } from "../libs/securityUtils";

// Валидация и нормализация путей из конфигурации
const validatedSrc = validateAndNormalizePath(config.src);
const validatedDest = validateAndNormalizePath(config.dest);

// Получение значения concurrency из конфигурации
const concurrency = config.concurrency || 3;
// Используем 3 как значение по умолчанию, если не задано в конфиге

// Глобальные переменные для отслеживания состояния и прогресса
let startTime: number;
let isCancelled = false;
let copiedFolders = 0;
let totalFolders = 0;

/**
 * Устанавливает обработчики сигналов для корректного завершения процесса
 */
function setupSignalHandlers() {
	const handleSignal = (signal: string) => {
		if (!isCancelled) {
			isCancelled = true;
			const totalTime = Date.now() - startTime;
			console.log(`\nProcess ${signal}.`);
			console.log(`Copied ${copiedFolders} out of ${totalFolders} folders.`);
			console.log(`Total execution time: ${humanizeTime(totalTime)}`);
			process.exit(0);
		}
	};

	process.on("SIGINT", () => handleSignal("interrupted"));
	process.on("SIGTERM", () => handleSignal("terminated"));
}

/**
 * Копирует отдельную папку
 * @param folder - Имя папки для копирования
 * @param index - Индекс текущей папки
 * @param total - Общее количество папок
 * @returns {Promise<boolean>} - Успешность копирования
 */
async function copyFolder(
	folder: string,
	index: number,
	total: number,
): Promise<boolean> {
	if (isCancelled) return false;

	const spinner = ora().start();
	spinner.text = `[${index + 1}/${total}] Copying [${folder}] folder`;
	try {
		const result = await copyFiles({
			src: `${validatedSrc}/${folder}`,
			dest: `${validatedDest}/${folder}`,
		});
		spinner.succeed(
			`[${index + 1}/${total}] Copied [${folder}] folder in ${humanizeTime(result.totalTime)}`,
		);
		return true;
	} catch (error: unknown) {
		if (error instanceof Error) {
			spinner.fail(`Failed to copy [${folder}] folder: ${error.message}`);
		} else {
			spinner.fail(`Failed to copy [${folder}] folder: Unknown error`);
		}
		return false;
	}
}

/**
 * Обрабатывает очередь папок с ограниченным параллелизмом
 * @param folders - Массив имен папок для копирования
 * @param concurrency - Максимальное количество одновременных операций
 */
async function processFoldersWithQueue(
	folders: string[],
	concurrency: number,
): Promise<void> {
	const queue = [...folders];
	const inProgress = new Set<string>();
	const total = folders.length;

	async function processNext(): Promise<void> {
		if (queue.length === 0 || isCancelled) return;

		const folder = queue.shift();
		if (!folder) return;

		const index = folders.indexOf(folder);
		inProgress.add(folder);

		try {
			const success = await copyFolder(folder, index, total);
			if (success) {
				copiedFolders++;
			}
		} finally {
			inProgress.delete(folder);
			await processNext();
		}
	}

	// Запускаем несколько "рабочих" процессов для параллельной обработки
	const workers = Array(Math.min(concurrency, folders.length))
		.fill(null)
		.map(() => processNext());

	await Promise.all(workers);
}

/**
 * Основная функция выполнения скрипта
 */
async function main() {
	setupSignalHandlers();
	startTime = Date.now();

	try {
		// Получаем список папок для копирования
		const folders = await readdir(validatedSrc, { withFileTypes: true }).then(
			(files) =>
				files.filter((file) => file.isDirectory()).map((file) => file.name),
		);
		folders.sort();
		totalFolders = folders.length;

		console.log(`Found ${totalFolders} folders to copy`);
		console.log(`Copying folders from ${validatedSrc} to ${validatedDest}`);

		await processFoldersWithQueue(folders, concurrency);

		if (!isCancelled) {
			const totalTime = Date.now() - startTime;
			console.log(`Copied ${copiedFolders} out of ${totalFolders} folders.`);
			console.log(`All folders processed in ${humanizeTime(totalTime)}`);
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`An error occurred: ${error.message}`);
		} else {
			console.error("An unknown error occurred");
		}
	}
}

// Запуск основной функции
main();
