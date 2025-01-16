import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFolder } from "obsidian";
import {
	ASN_EXPANDED_FOLDER_NAMES_KEY,
	ASN_FOCUSED_FOLDER_NAME_KEY,
} from "src/assets/constants";
import File from "./File";

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
		getFoldersByParent,
		getDirectFilesInFolder,
		setFocusedFile,
	} = useFileTreeStore(
		useShallow((state: FileTreeStore) => ({
			getFilesCountInFolder: state.getFilesCountInFolder,
			hasFolderChildren: state.hasFolderChildren,
			getTopLevelFolders: state.getTopLevelFolders,
			focusedFolder: state.focusedFolder,
			setFocusedFolder: state.setFocusedFolder,
			findFolderByName: state.findFolderByName,
			getFoldersByParent: state.getFoldersByParent,
			getDirectFilesInFolder: state.getDirectFilesInFolder,
			focusedFile: state.focusedFile,
			setFocusedFile: state.setFocusedFile,
		}))
	);

	const [expandedFolderNames, setExpandedFolderNames] = useState<string[]>(
		[]
	);

	useEffect(() => {
		const lastFocusedFolderName = localStorage.getItem(
			ASN_FOCUSED_FOLDER_NAME_KEY
		);
		const lastExpandedFolderNames = localStorage.getItem(
			ASN_EXPANDED_FOLDER_NAMES_KEY
		);
		if (lastFocusedFolderName) {
			const folder = findFolderByName(lastFocusedFolderName);
			if (folder) {
				onSetFocusedFolder(folder);
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
	}, []);

	const onSetFocusedFolder = (folder: TFolder): void => {
		setFocusedFolder(folder);
		localStorage.setItem(ASN_FOCUSED_FOLDER_NAME_KEY, folder.name);
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
						onSetFocusedFolder(folder);
					}}
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
		return <div className="asn-none-files-tips">无文件</div>;
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
						onSelectFile={() => setFocusedFile(file)}
					/>
				))}
			</>
		);
	};

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane">
				{renderFolders(topLevelFolders)}
			</div>
			<div className="asn-pane-divider" />
			<div className="asn-files-pane">{renderFiles()}</div>
		</div>
	);
};

export default FileTree;
