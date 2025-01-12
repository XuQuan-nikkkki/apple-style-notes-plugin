import { create } from "zustand";
import { TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";

export type FileTreeStore = {
	folders: TFolder[];
	getFilesCountInFolder: (folder: TFolder) => number;
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set) => ({
		folders: plugin.app.vault.getAllFolders() || [],

		getFilesCountInFolder: (folder: TFolder): number => {
			const getFilesCount = (folder: TFolder): number => {
				return folder.children.reduce((total, child) => {
					if (isFile(child)) {
						return total + 1;
					}
					if (isFolder(child)) {
						return total + getFilesCount(child as TFolder);
					}
					return total;
				}, 0);
			};
			return getFilesCount(folder);
		},
	}));
