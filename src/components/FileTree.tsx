import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFolder } from "obsidian";
import {
	ASN_EXPANDED_FOLDER_NAMES_KEY,
	ASN_FOCUSED_FOLDER_PATH_KEY,
	ASN_FOLDER_PANE_WIDTH_KEY,
} from "src/assets/constants";
import DraggableDivider from "./DraggableDivider";
import FolderActions from "./FolderActions";
import FileActions from "./FileActions";
import { isFolder } from "src/utils";
import Files from "./Files";

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
		folderSortRule,
		getTopLevelFolders,
		getFilesCountInFolder,
		hasFolderChildren,
		focusedFolder,
		setFocusedFolder,
		findFolderByPath,
		getFoldersByParent,
		createFolder,
		sortFolders,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folders: store.folders,
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			getFilesCountInFolder: store.getFilesCountInFolder,
			hasFolderChildren: store.hasFolderChildren,
			getTopLevelFolders: store.getTopLevelFolders,
			focusedFolder: store.focusedFolder,
			setFocusedFolder: store.setFocusedFolder,
			findFolderByPath: store.findFolderByPath,
			getFoldersByParent: store.getFoldersByParent,
			createFolder: store.createFolder,
			sortFolders: store.sortFolders,
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
		const sortedFolders = sortFolders(folders, folderSortRule);
		return sortedFolders.map((folder) => (
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
					sortRule={folderSortRule}
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
				<Files useFileTreeStore={useFileTreeStore} />
			</div>
		</div>
	);
};

export default FileTree;
