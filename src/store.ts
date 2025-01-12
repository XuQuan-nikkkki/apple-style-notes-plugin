import { create } from "zustand";
import { TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";

export type FileTreeStore = {
	folders: TFolder[];
	getTopLevelFolders: () => TFolder[];
	getFilesCountInFolder: (folder: TFolder) => number;
	hasFolderChildren: (folder: TFolder) => boolean;
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set, get) => ({
		folders: plugin.app.vault.getAllFolders() || [],

		getTopLevelFolders: () => {
			const folders = (get() as FileTreeStore).folders;
			return folders.filter((folder) => folder.parent?.parent === null);
		},
		hasFolderChildren: (folder: TFolder): boolean => {
			return folder.children.some((child) => isFolder(child));
		},
		getFilesCountInFolder: (folder: TFolder): number => {
			const getFilesCount = (folder: TFolder): number => {
				if (!folder || !folder.children) return 0;
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
