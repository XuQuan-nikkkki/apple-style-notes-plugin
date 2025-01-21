import { create } from "zustand";
import { TFile, TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";
import { ASN_FOCUSED_FOLDER_PATH_KEY } from "./assets/constants";

export type FolderSortRule =
	| "FolderNameAscending"
	| "FolderNameDescending"
	| "ItemNumbersAscending"
	| "ItemNumbersDescending";
export const DEFAULT_FOLDER_SORT_RULE: FolderSortRule = "FolderNameAscending";

export type FileTreeStore = {
	folders: TFolder[];
	rootFolder: TFolder | null;
	focusedFolder: TFolder | null;
	focusedFile: TFile | null;
	folderSortRule: FolderSortRule;
	expandedFolderNames: string[];
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
	sortFolders: (folders: TFolder[], rule: FolderSortRule) => TFolder[];
	setFocusedFolderAndSaveInLocalStorage: (folder: TFolder) => void;
	changeExpandedFolderNames: (folderNames: string[]) => void;
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set, get: () => FileTreeStore) => ({
		folders: plugin.app.vault.getAllFolders() || [],
		rootFolder: plugin.app.vault.getRoot() || null,
		focusedFolder: null,
		focusedFile: null,
		folderSortRule: DEFAULT_FOLDER_SORT_RULE,
		expandedFolderNames: [],

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
		setFocusedFolderAndSaveInLocalStorage: (folder: TFolder) => {
			get().setFocusedFolder(folder);
			localStorage.setItem(ASN_FOCUSED_FOLDER_PATH_KEY, folder.path);
		},
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
			return await plugin.app.vault.read(file);
		},
		sortFolders: (folders: TFolder[], rule: FolderSortRule): TFolder[] => {
			if (rule === "FolderNameAscending") {
				return folders.sort((a, b) => a.name.localeCompare(b.name));
			} else if (rule === "FolderNameDescending") {
				return folders.sort((a, b) => b.name.localeCompare(a.name));
			} else if (rule === "ItemNumbersAscending") {
				return folders.sort(
					(a, b) =>
						get().getFilesCountInFolder(a) -
						get().getFilesCountInFolder(b)
				);
			} else if (rule === "ItemNumbersDescending") {
				return folders.sort(
					(a, b) =>
						get().getFilesCountInFolder(b) -
						get().getFilesCountInFolder(a)
				);
			}
			return folders; // 如果没有匹配的规则，返回原始文件夹
		},
		changeExpandedFolderNames: (folderNames: string[]) => {
			set({
				expandedFolderNames: folderNames,
			});
		},
	}));
