import { create } from "zustand";
import { TFile, TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";

export type FileTreeStore = {
	folders: TFolder[];
	rootFolder: TFolder | null;
	focusedFolder: TFolder | null;
	focusedFile: TFile | null;
	findFolderByPath: (name: string) => TFolder | undefined;
	findFileByPath: (path: string) => TFile | null;
	getTopLevelFolders: () => TFolder[];
	getFilesCountInFolder: (folder: TFolder) => number;
	getFoldersByParent: (parentFolder: TFolder) => TFolder[];
	getDirectFilesInFolder: (folder: TFolder) => TFile[];
	hasFolderChildren: (folder: TFolder) => boolean;
	setFocusedFolder: (folder: TFolder) => void;
	setFocusedFile: (file: TFile) => void;
	openFile: (file: TFile) => void;
	createFolder: (path: string) => Promise<TFolder>;
	readFile: (file: TFile) => Promise<string>;
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set, get: () => FileTreeStore) => ({
		folders: plugin.app.vault.getAllFolders() || [],
		rootFolder: plugin.app.vault.getRoot() || null,
		focusedFolder: null,
		focusedFile: null,

		findFolderByPath: (path: string): TFolder | undefined => {
			return get().folders.find((folder) => folder.path == path);
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
		findFileByPath: (path: string): TFile | null => {
			return plugin.app.vault.getFileByPath(path);
		},
		setFocusedFolder: (folder: TFolder) =>
			set({
				focusedFolder: folder,
			}),
		setFocusedFile: (file: TFile) =>
			set({
				focusedFile: file,
			}),
		openFile: (file: TFile): void => {
			const abstractFile = plugin.app.vault.getAbstractFileByPath(
				file.path
			);
			const leaf = plugin.app.workspace.getLeaf();
			plugin.app.workspace.setActiveLeaf(leaf, { focus: true });
			leaf.openFile(abstractFile as TFile, { eState: { focus: true } });
		},
		createFolder: async (path: string): Promise<TFolder> => {
			return await plugin.app.vault.createFolder(path);
		},
		readFile: async (file: TFile): Promise<string> => {
			return await plugin.app.vault.read(file)
		},
	}));
