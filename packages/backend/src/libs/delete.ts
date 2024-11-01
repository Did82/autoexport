import { rm } from "node:fs/promises";

export interface DeleteResult {
	deletedDir: string;
	totalTime: number;
}

const deleteDir = async (target: string): Promise<DeleteResult> => {
	const start = Date.now();
	await rm(target, { recursive: true, force: true });
	const end = Date.now();

	return {
		deletedDir: target,
		totalTime: end - start,
	};
};

export { deleteDir };
