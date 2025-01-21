import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
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
import Folders from "./Folders";

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
		focusedFolder,
		setFocusedFolder,
		findFolderByPath,
		createFolder,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folders: store.folders,
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			focusedFolder: store.focusedFolder,
			setFocusedFolder: store.setFocusedFolder,
			findFolderByPath: store.findFolderByPath,
			createFolder: store.createFolder,
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

		if (lastFocusedFolderPath && lastFocusedFolderPath !== "/") {
			const folder = findFolderByPath(lastFocusedFolderPath);
			if (folder) {
				onSelectFolder(folder);
			}
		} else if (rootFolder) {
			onSelectFolder(rootFolder);
		}
	}, []);

	const onSelectFolder = (folder: TFolder): void => {
		setFocusedFolder(folder);
		localStorage.setItem(ASN_FOCUSED_FOLDER_PATH_KEY, folder.path);
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
				<Folders plugin={plugin} useFileTreeStore={useFileTreeStore} />
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
