import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFolder } from "obsidian";
import { ASN_FOCUSED_FOLDER_NAME } from "src/assets/constants";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);
	const {
		getFilesCountInFolder,
		hasFolderChildren,
		getTopLevelFolders,
		focusedFolder,
		setFocusedFolder,
		findFolderByName,
		getFoldersByParent,
	} = useFileTreeStore(
		useShallow((state: FileTreeStore) => ({
			getFilesCountInFolder: state.getFilesCountInFolder,
			hasFolderChildren: state.hasFolderChildren,
			getTopLevelFolders: state.getTopLevelFolders,
			focusedFolder: state.focusedFolder,
			setFocusedFolder: state.setFocusedFolder,
			findFolderByName: state.findFolderByName,
			getFoldersByParent: state.getFoldersByParent,
		}))
	);

	const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

	useEffect(() => {
		const lastFocusedFolderName = localStorage.getItem(
			ASN_FOCUSED_FOLDER_NAME
		);
		if (lastFocusedFolderName) {
			const folder = findFolderByName(lastFocusedFolderName);
			if (folder) {
				onSetFocusedFolder(folder);
			}
		}
	}, []);

	const onSetFocusedFolder = (folder: TFolder): void => {
		setFocusedFolder(folder);
		localStorage.setItem(ASN_FOCUSED_FOLDER_NAME, folder.name);
		if (hasFolderChildren(folder)) {
			setExpandedFolders((prev) =>
				prev.includes(folder.name)
					? prev.filter((name) => name !== folder.name)
					: [...prev, folder.name]
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
					isExpanded={expandedFolders.includes(folder.name)}
					onSelectFolder={() => {
						onSetFocusedFolder(folder);
					}}
				/>
				{expandedFolders.includes(folder.name) &&
					hasFolderChildren(folder) && (
						<div className="asn-sub-folders-section">
							{renderFolders(getFoldersByParent(folder))}
						</div>
					)}
			</div>
		));
	};

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane">
				{renderFolders(topLevelFolders)}
			</div>
			<div className="asn-pane-divider" />
			<div className="asn-files-pane">files pane</div>
		</div>
	);
};

export default FileTree;
