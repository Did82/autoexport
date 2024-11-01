import { readdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../libs/db";
import { getDiskUsage, getOldestDate } from "../libs/utils";
import { deleteDir } from "../libs/delete";

export const spaceControlService = async (target: string, limit: number) => {
	let { percentage } = await getDiskUsage(target);

	if (percentage <= limit) {
		console.log(
			`No need to delete any directory, disk usage on ${target} is ${percentage}%`,
		);
		return;
	}

	while (percentage > limit) {
		const dirs = await readdir(target);
		const oldestDate = getOldestDate(dirs);
		const oldestDir = path.join(target, oldestDate);
		const result = await deleteDir(oldestDir);
		({ percentage } = await getDiskUsage(target));
		const savedResult = await prisma.deleteLog.create({
			data: {
				deletedDir: result.deletedDir,
				totalTime: result.totalTime,
				percentageAfterDelete: percentage,
			},
		});
		console.log(savedResult);
	}

	return;
};
