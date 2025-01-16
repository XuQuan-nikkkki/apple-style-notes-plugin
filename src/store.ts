import { create } from "zustand";
import { TFile, TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";

export type FileTreeStore = {
	folders: TFolder[];
	focusedFolder: TFolder | null;
	focusedFile: TFile | null;
	findFolderByName: (name: string) => TFolder | undefined;
	getTopLevelFolders: () => TFolder[];
	getFilesCountInFolder: (folder: TFolder) => number;
	getFoldersByParent: (parentFolder: TFolder) => TFolder[];
	getDirectFilesInFolder: (folder: TFolder) => TFile[];
	hasFolderChildren: (folder: TFolder) => boolean;
	setFocusedFolder: (folder: TFolder) => void;
	setFocusedFile: (file: TFile) => void;
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set, get: () => FileTreeStore) => ({
		folders: plugin.app.vault.getAllFolders() || [],
		focusedFolder: null,
		focusedFile: null,

		findFolderByName: (name: string): TFolder | undefined => {
			return get().folders.find((folder) => folder.name == name);
		},
		getTopLevelFolders: () => {
			const folders = get().folders;
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
		getFoldersByParent: (parentFolder: TFolder): TFolder[] => {
			return parentFolder.children.filter((child) => isFolder(child));
		},
		getDirectFilesInFolder: (folder: TFolder): TFile[] => {
			return folder.children.filter((child) => isFile(child));
		},
		setFocusedFolder: (folder: TFolder) =>
			set({
				focusedFolder: folder,
			}),
		setFocusedFile: (file: TFile) =>
			set({
				focusedFile: file,
			}),
	}));
