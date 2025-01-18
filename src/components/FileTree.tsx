import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFile, TFolder } from "obsidian";
import {
	ASN_EXPANDED_FOLDER_NAMES_KEY,
	ASN_FOCUSED_FILE_PATH_KEY,
	ASN_FOCUSED_FOLDER_PATH_KEY,
	ASN_FOLDER_PANE_WIDTH_KEY,
} from "src/assets/constants";
import File from "./File";
import DraggableDivider from "./DraggableDivider";
import { EmptyFolderIcon } from "src/assets/icons";
import FolderActions from "./FolderActions";
import FileActions from "./FileActions";
import { isFolder } from "src/utils";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);
	const {
		folders,
		rootFolder,
		getTopLevelFolders,
		focusedFile,
		getFilesCountInFolder,
		hasFolderChildren,
		focusedFolder,
		setFocusedFolder,
		findFolderByPath,
		findFileByPath,
		getFoldersByParent,
		getDirectFilesInFolder,
		setFocusedFile,
		openFile,
		createFolder,
		readFile,
	} = useFileTreeStore(
		useShallow((state: FileTreeStore) => ({
			folders: state.folders,
			rootFolder: state.rootFolder,
			getFilesCountInFolder: state.getFilesCountInFolder,
			hasFolderChildren: state.hasFolderChildren,
			getTopLevelFolders: state.getTopLevelFolders,
			focusedFolder: state.focusedFolder,
			setFocusedFolder: state.setFocusedFolder,
			findFolderByPath: state.findFolderByPath,
			findFileByPath: state.findFileByPath,
			getFoldersByParent: state.getFoldersByParent,
			getDirectFilesInFolder: state.getDirectFilesInFolder,
			focusedFile: state.focusedFile,
			setFocusedFile: state.setFocusedFile,
			openFile: state.openFile,
			createFolder: state.createFolder,
			readFile: state.readFile,
		}))
	);

	const [expandedFolderNames, setExpandedFolderNames] = useState<string[]>(
		[]
	);
	const [folderPaneWidth, setFolderPaneWidth] = useState<number | undefined>(
		220
	);

	useEffect(() => {
		const lastFocusedFolderPath = localStorage.getItem(
			ASN_FOCUSED_FOLDER_PATH_KEY
		);
		const lastExpandedFolderNames = localStorage.getItem(
			ASN_EXPANDED_FOLDER_NAMES_KEY
		);
		const lastFocusedFilePath = localStorage.getItem(
			ASN_FOCUSED_FILE_PATH_KEY
		);
		const lastFolderPaneWidth = localStorage.getItem(
			ASN_FOLDER_PANE_WIDTH_KEY
		);

		if (lastFocusedFolderPath && lastFocusedFolderPath !== "/") {
			const folder = findFolderByPath(lastFocusedFolderPath);
			if (folder) {
				onSelectFolder(folder);
			}
		} else if (rootFolder) {
			onSelectFolder(rootFolder);
		}
		if (lastFocusedFilePath) {
			const file = findFileByPath(lastFocusedFilePath);
			if (file) {
				onSelectFile(file);
			}
		}
		if (lastExpandedFolderNames) {
			try {
				const folderNames = JSON.parse(lastExpandedFolderNames);
				setExpandedFolderNames(folderNames);
			} catch (error) {
				console.error("Invalid Json format: ", error);
			}
		}
		if (lastFolderPaneWidth) {
			try {
				const width = Number(lastFolderPaneWidth);
				onChangeFolderPaneWidth(width);
			} catch (error) {
				console.error("Invalid Number format: ", error);
			}
		}
	}, []);

	const onSelectFolder = (folder: TFolder): void => {
		setFocusedFolder(folder);
		localStorage.setItem(ASN_FOCUSED_FOLDER_PATH_KEY, folder.path);
	};

	const onToggleExpandState = (folder: TFolder): void => {
		if (hasFolderChildren(folder)) {
			const folderNames = expandedFolderNames.includes(folder.name)
				? expandedFolderNames.filter((name) => name !== folder.name)
				: [...expandedFolderNames, folder.name];
			setExpandedFolderNames(folderNames);
			localStorage.setItem(
				ASN_EXPANDED_FOLDER_NAMES_KEY,
				JSON.stringify(folderNames)
			);
		}
	};

	const onToggleFoldersExpandState = (folderNames: string[]): void => {
		setExpandedFolderNames(folderNames);
		localStorage.setItem(
			ASN_EXPANDED_FOLDER_NAMES_KEY,
			JSON.stringify(folderNames)
		);
	};

	const onChangeFolderPaneWidth = (width: number) => {
		setFolderPaneWidth(width);
		localStorage.setItem(ASN_FOLDER_PANE_WIDTH_KEY, String(width));
	};

	const renderFolders = (folders: TFolder[]) => {
		return folders.map((folder) => (
			<div key={folder.name}>
				<Folder
					folderName={folder.name}
					filesCount={getFilesCountInFolder(folder)}
					hasFolderChildren={hasFolderChildren(folder)}
					isFocused={folder.path === focusedFolder?.path}
					isExpanded={expandedFolderNames.includes(folder.name)}
					onSelectFolder={() => {
						onSelectFolder(folder);
					}}
					onToggleExpandState={() => onToggleExpandState(folder)}
				/>
				{expandedFolderNames.includes(folder.name) &&
					hasFolderChildren(folder) && (
						<div className="asn-sub-folders-section">
							{renderFolders(getFoldersByParent(folder))}
						</div>
					)}
			</div>
		));
	};

	const renderRootFolder = () => {
		if (!rootFolder) return null;

		return (
			<div>
				<Folder
					folderName={plugin.app.vault.getName()}
					filesCount={getFilesCountInFolder(rootFolder)}
					hasFolderChildren={hasFolderChildren(rootFolder)}
					isFocused={rootFolder.path === focusedFolder?.path}
					isExpanded
					isRoot
					onSelectFolder={() => {
						onSelectFolder(rootFolder);
					}}
				/>
			</div>
		);
	};

	const renderNoneFilesTips = () => {
		return (
			<div className="asn-none-files-tips">
				<EmptyFolderIcon />
			</div>
		);
	};

	const onSelectFile = (file: TFile): void => {
		setFocusedFile(file);
		openFile(file);
		localStorage.setItem(ASN_FOCUSED_FILE_PATH_KEY, file.path);
	};

	const renderFiles = () => {
		if (!focusedFolder) return renderNoneFilesTips();

		const files = getDirectFilesInFolder(focusedFolder);
		if (!files.length) return renderNoneFilesTips();

		return (
			<>
				{files.map((file) => (
					<File
						key={file.name}
						file={file}
						isFocused={focusedFile?.name === file.name}
						onSelectFile={() => onSelectFile(file)}
						onReadFile={readFile}
					/>
				))}
			</>
		);
	};

	const onCreateFolder = async () => {
		if (!rootFolder) return;
		const parentFolder = focusedFolder ? focusedFolder : rootFolder;
		const newFolderName = "Untitled";
		const untitledFoldersCount = parentFolder.children.filter(
			(child) => isFolder(child) && child.name.contains(newFolderName)
		).length;
		const newFolderNameSuffix =
			untitledFoldersCount == 0 ? "" : untitledFoldersCount;
		await createFolder(
			parentFolder.path + "/" + newFolderName + " " + newFolderNameSuffix
		);
	};

	const topLevelFolders = getTopLevelFolders();
	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane" style={{ width: folderPaneWidth }}>
				<FolderActions
					onCreateFolder={onCreateFolder}
					onExpandAllFolders={() =>
						onToggleFoldersExpandState(folders.map((f) => f.name))
					}
					onCollapseAllFolders={() => onToggleFoldersExpandState([])}
				/>
				{renderRootFolder()}
				{renderFolders(topLevelFolders)}
			</div>
			<DraggableDivider
				initialWidth={folderPaneWidth}
				onChangeWidth={onChangeFolderPaneWidth}
			/>
			<div className="asn-files-pane">
				<FileActions />
				{renderFiles()}
			</div>
		</div>
	);
};

export default FileTree;
