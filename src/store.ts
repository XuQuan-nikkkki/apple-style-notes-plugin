import { create } from "zustand";
import { TFile, TFolder } from "obsidian";

import AppleStyleNotesPlugin from "./main";
import { isFile, isFolder } from "./utils";
import {
	ASN_EXPANDED_FOLDER_PATHS_KEY,
	ASN_FILE_SORT_RULE_KEY,
	ASN_FOCUSED_FILE_PATH_KEY,
	ASN_FOCUSED_FOLDER_PATH_KEY,
	ASN_FOLDER_SORT_RULE_KEY,
} from "./assets/constants";

export type FolderSortRule =
	| "FolderNameAscending"
	| "FolderNameDescending"
	| "FilesCountAscending"
	| "FilesCountDescending";
export const DEFAULT_FOLDER_SORT_RULE: FolderSortRule = "FolderNameAscending";
export type FileSortRule =
	| "FileNameAscending"
	| "FileNameDescending"
	| "FileCreatedTimeAscending"
	| "FileCreatedTimeDescending"
	| "FileModifiedTimeAscending"
	| "FileModifiedTimeDescending";
const DEFAULT_FILE_SORT_RULE: FileSortRule = "FileNameAscending";

export type FileTreeStore = {
	folders: TFolder[];
	rootFolder: TFolder | null;
	focusedFolder: TFolder | null;
	focusedFile: TFile | null;
	folderSortRule: FolderSortRule;
	fileSortRule: FileSortRule;
	expandedFolderPaths: string[];

	// Folders related
	findFolderByPath: (name: string) => TFolder | undefined;
	getTopLevelFolders: () => TFolder[];
	getFilesCountInFolder: (folder: TFolder) => number;
	getFoldersByParent: (parentFolder: TFolder) => TFolder[];
	getDirectFilesInFolder: (folder: TFolder) => TFile[];
	hasFolderChildren: (folder: TFolder) => boolean;
	isFoldersInAscendingOrder: () => boolean;
	setFocusedFolder: (folder: TFolder) => void;
	_createFolder: (path: string) => Promise<TFolder>;
	createNewFolder: (parentFolder: TFolder) => Promise<TFolder | undefined>;
	setFocusedFolderAndSaveInLocalStorage: (folder: TFolder) => void;
	sortFolders: (folders: TFolder[], rule: FolderSortRule) => TFolder[];
	changeFolderSortRule: (rule: FolderSortRule) => void;
	restoreFolderSortRule: () => void;
	changeExpandedFolderPaths: (folderNames: string[]) => void;
	restoreExpandedFolderPaths: () => void;
	restoreLastFocusedFolder: () => void;

	// Files related
	findFileByPath: (path: string) => TFile | null;
	isFilesInAscendingOrder: () => boolean;
	setFocusedFile: (file: TFile) => void;
	openFile: (file: TFile) => void;
	selectFile: (file: TFile) => void;
	readFile: (file: TFile) => Promise<string>;
	createFile: (folder: TFolder) => Promise<TFile>;
	duplicateFile: (file: TFile) => Promise<TFile>;
	restoreLastFocusedFile: () => void;
	changeFileSortRule: (rule: FileSortRule) => void;
	restoreFileSortRule: () => void;
	sortFiles: (files: TFile[], rule: FileSortRule) => TFile[];
};

export const createFileTreeStore = (plugin: AppleStyleNotesPlugin) =>
	create((set, get: () => FileTreeStore) => ({
		folders: plugin.app.vault.getAllFolders() || [],
		rootFolder: plugin.app.vault.getRoot() || null,
		focusedFolder: null,
		focusedFile: null,
		folderSortRule: DEFAULT_FOLDER_SORT_RULE,
		fileSortRule: DEFAULT_FILE_SORT_RULE,
		expandedFolderPaths: [],

		// Folders related
		getTopLevelFolders: () => {
			return get().folders.filter(
				(folder) => folder.parent?.parent === null
			);
		},
		findFolderByPath: (path: string): TFolder | undefined => {
			return get().folders.find((folder) => folder.path == path);
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
		isFoldersInAscendingOrder: (): boolean => {
			const { folderSortRule } = get();
			return folderSortRule.contains("Ascending");
		},
		setFocusedFolder: (folder: TFolder) =>
			set({
				focusedFolder: folder,
			}),
		setFocusedFolderAndSaveInLocalStorage: (folder: TFolder) => {
			get().setFocusedFolder(folder);
			localStorage.setItem(ASN_FOCUSED_FOLDER_PATH_KEY, folder.path);
		},
		_createFolder: async (path: string): Promise<TFolder> => {
			const newFolder = await plugin.app.vault.createFolder(path);
			return newFolder;
		},
		createNewFolder: async (
			parentFolder: TFolder
		): Promise<TFolder | undefined> => {
			const { rootFolder, _createFolder } = get();
			if (!rootFolder) return;

			const newFolderName = "Untitled";
			const untitledFoldersCount = parentFolder.children.filter(
				(child) => isFolder(child) && child.name.contains(newFolderName)
			).length;
			const newFolderNameSuffix =
				untitledFoldersCount == 0 ? "" : ` ${untitledFoldersCount}`;
			const newFolder = await _createFolder(
				`${parentFolder.path}/${newFolderName}${newFolderNameSuffix}`
			);
			return newFolder;
		},
		sortFolders: (folders: TFolder[], rule: FolderSortRule): TFolder[] => {
			if (rule === "FolderNameAscending") {
				return folders.sort((a, b) => a.name.localeCompare(b.name));
			} else if (rule === "FolderNameDescending") {
				return folders.sort((a, b) => b.name.localeCompare(a.name));
			} else if (rule === "FilesCountAscending") {
				return folders.sort(
					(a, b) =>
						get().getFilesCountInFolder(a) -
						get().getFilesCountInFolder(b)
				);
			} else if (rule === "FilesCountDescending") {
				return folders.sort(
					(a, b) =>
						get().getFilesCountInFolder(b) -
						get().getFilesCountInFolder(a)
				);
			}
			return folders; // 如果没有匹配的规则，返回原始文件夹
		},
		changeFolderSortRule: (rule: FolderSortRule) => {
			set({
				folderSortRule: rule,
			});
			localStorage.setItem(ASN_FOLDER_SORT_RULE_KEY, rule);
		},
		restoreFolderSortRule: () => {
			const lastFolderSortRule = localStorage.getItem(
				ASN_FOLDER_SORT_RULE_KEY
			);
			if (lastFolderSortRule) {
				set({
					folderSortRule: lastFolderSortRule as FolderSortRule,
				});
			}
		},
		changeExpandedFolderPaths: (folderPaths: string[]) => {
			set({
				expandedFolderPaths: folderPaths,
			});
			localStorage.setItem(
				ASN_EXPANDED_FOLDER_PATHS_KEY,
				JSON.stringify(folderPaths)
			);
		},
		restoreExpandedFolderPaths: () => {
			const lastExpandedFolderPaths = localStorage.getItem(
				ASN_EXPANDED_FOLDER_PATHS_KEY
			);
			if (lastExpandedFolderPaths) {
				try {
					const folderPaths = JSON.parse(lastExpandedFolderPaths);
					set({
						expandedFolderPaths: folderPaths,
					});
				} catch (error) {
					console.error("Invalid Json format: ", error);
				}
			}
		},
		restoreLastFocusedFolder: () => {
			const lastFocusedFolderPath = localStorage.getItem(
				ASN_FOCUSED_FOLDER_PATH_KEY
			);
			const { rootFolder, setFocusedFolder, findFolderByPath } = get();
			if (lastFocusedFolderPath && lastFocusedFolderPath !== "/") {
				const folder = findFolderByPath(lastFocusedFolderPath);
				if (folder) {
					setFocusedFolder(folder);
				}
			} else if (rootFolder) {
				setFocusedFolder(rootFolder);
			}
		},

		// Files related
		findFileByPath: (path: string): TFile | null => {
			return plugin.app.vault.getFileByPath(path);
		},
		isFilesInAscendingOrder: (): boolean => {
			const { fileSortRule } = get();
			return fileSortRule.contains("Ascending");
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
		selectFile: (file: TFile): void => {
			const { setFocusedFile, openFile } = get();
			setFocusedFile(file);
			openFile(file);
			localStorage.setItem(ASN_FOCUSED_FILE_PATH_KEY, file.path);
		},
		readFile: async (file: TFile): Promise<string> => {
			return await plugin.app.vault.read(file);
		},
		createFile: async (folder: TFolder) => {
			const { vault } = plugin.app;
			const defaultFileName = "Untitled";
			const untitledFilesCount = folder.children.filter(
				(child) => isFile(child) && child.name.contains(defaultFileName)
			).length;
			const newFileNameSuffix =
				untitledFilesCount == 0 ? "" : untitledFilesCount;
			const newFileName = `${defaultFileName}${newFileNameSuffix}.md`;
			const newFile = await vault.create(
				`${folder.path}/${newFileName}`,
				""
			);
			get().selectFile(newFile);
			return newFile;
		},
		duplicateFile: async (file: TFile) => {
			const { vault } = plugin.app;
			const defaultFileName = file.basename;
			const folder = file.parent || plugin.app.vault.getRoot();
			const copiedFilesCount = folder.children.filter(
				(child) => isFile(child) && child.name.contains(defaultFileName)
			).length;
			const newFileNameSuffix =
				copiedFilesCount == 0 ? "" : copiedFilesCount;
			const newFileName = `${defaultFileName}${newFileNameSuffix}.md`;
			const newFile = await vault.copy(
				file,
				`${folder.path}/${newFileName}`
			);
			get().selectFile(newFile);
			return newFile;
		},
		restoreLastFocusedFile: () => {
			const lastFocusedFilePath = localStorage.getItem(
				ASN_FOCUSED_FILE_PATH_KEY
			);
			const { findFileByPath, selectFile } = get();
			if (lastFocusedFilePath) {
				const file = findFileByPath(lastFocusedFilePath);
				if (file) {
					selectFile(file);
				}
			}
		},
		sortFiles: (files: TFile[], rule: FileSortRule): TFile[] => {
			switch (rule) {
				case "FileNameAscending":
					return files.sort((a, b) => a.name.localeCompare(b.name));
				case "FileNameDescending":
					return files.sort((a, b) => b.name.localeCompare(a.name));
				case "FileCreatedTimeAscending":
					return files.sort((a, b) => a.stat.ctime - b.stat.ctime);
				case "FileCreatedTimeDescending":
					return files.sort((a, b) => b.stat.ctime - a.stat.ctime);
				case "FileModifiedTimeAscending":
					return files.sort((a, b) => a.stat.mtime - b.stat.mtime);
				case "FileModifiedTimeDescending":
					return files.sort((a, b) => b.stat.mtime - a.stat.mtime);
				default:
					return files;
			}
		},
		changeFileSortRule: (rule: FileSortRule) => {
			set({
				fileSortRule: rule,
			});
			localStorage.setItem(ASN_FILE_SORT_RULE_KEY, rule);
		},
		restoreFileSortRule: () => {
			const lastFileSortRule = localStorage.getItem(
				ASN_FILE_SORT_RULE_KEY
			);
			if (lastFileSortRule) {
				set({
					fileSortRule: lastFileSortRule as FileSortRule,
				});
			}
		},
	}));
