import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFile, TFolder } from "obsidian";
import {
	ASN_EXPANDED_FOLDER_NAMES_KEY,
	ASN_FOCUSED_FILE_PATH_KEY,
	ASN_FOCUSED_FOLDER_NAME_KEY,
	ASN_FOLDER_PANE_WIDTH_KEY,
} from "src/assets/constants";
import File from "./File";
import DraggableDivider from "./DraggableDivider";
import EmptyFolderIcon from "src/assets/icons/EmptyFolderIcon";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);
	const {
		focusedFile,
		getFilesCountInFolder,
		hasFolderChildren,
		getTopLevelFolders,
		focusedFolder,
		setFocusedFolder,
		findFolderByName,
		findFileByPath,
		getFoldersByParent,
		getDirectFilesInFolder,
		setFocusedFile,
		openFile,
	} = useFileTreeStore(
		useShallow((state: FileTreeStore) => ({
			getFilesCountInFolder: state.getFilesCountInFolder,
			hasFolderChildren: state.hasFolderChildren,
			getTopLevelFolders: state.getTopLevelFolders,
			focusedFolder: state.focusedFolder,
			setFocusedFolder: state.setFocusedFolder,
			findFolderByName: state.findFolderByName,
			findFileByPath: state.findFileByPath,
			getFoldersByParent: state.getFoldersByParent,
			getDirectFilesInFolder: state.getDirectFilesInFolder,
			focusedFile: state.focusedFile,
			setFocusedFile: state.setFocusedFile,
			openFile: state.openFile,
		}))
	);

	const [expandedFolderNames, setExpandedFolderNames] = useState<string[]>(
		[]
	);
	const [folderPaneWidth, setFolderPaneWidth] = useState<number | undefined>(
		220
	);

	useEffect(() => {
		const lastFocusedFolderName = localStorage.getItem(
			ASN_FOCUSED_FOLDER_NAME_KEY
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
		if (lastFocusedFolderName) {
			const folder = findFolderByName(lastFocusedFolderName);
			if (folder) {
				onSelectFolder(folder);
			}
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
		localStorage.setItem(ASN_FOCUSED_FOLDER_NAME_KEY, folder.name);
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

	const onChangeFolderPaneWidth = (width: number) => {
		setFolderPaneWidth(width);
		localStorage.setItem(ASN_FOLDER_PANE_WIDTH_KEY, String(width));
	};

	const topLevelFolders = getTopLevelFolders();

	const renderFolders = (folders: TFolder[]) => {
		return folders.map((folder) => (
			<div key={folder.name}>
				<Folder
					folder={folder}
					filesCount={getFilesCountInFolder(folder)}
					hasFolderChildren={hasFolderChildren(folder)}
					isFocused={folder.name === focusedFolder?.name}
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
					/>
				))}
			</>
		);
	};

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane" style={{ width: folderPaneWidth }}>
				{renderFolders(topLevelFolders)}
			</div>
			<DraggableDivider
				initialWidth={folderPaneWidth}
				onChangeWidth={onChangeFolderPaneWidth}
			/>
			<div className="asn-files-pane">{renderFiles()}</div>
		</div>
	);
};

export default FileTree;
