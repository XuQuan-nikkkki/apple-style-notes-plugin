import { Fragment, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";

import AppleStyleNotesPlugin from "src/main";
import { FileTreeStore } from "src/store";
import Folder from "./Folder";
import { TFolder } from "obsidian";
import {
	ASN_EXPANDED_FOLDER_NAMES_KEY,
	ASN_FOCUSED_FOLDER_PATH_KEY,
} from "src/assets/constants";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
};
const Folders = ({ useFileTreeStore, plugin }: Props) => {
	const {
		rootFolder,
		folderSortRule,
		getTopLevelFolders,
		getFilesCountInFolder,
		hasFolderChildren,
		focusedFolder,
		findFolderByPath,
		getFoldersByParent,
		sortFolders,
		setFocusedFolder,
		expandedFolderNames,
		changeExpandedFolderNames,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			getFilesCountInFolder: store.getFilesCountInFolder,
			hasFolderChildren: store.hasFolderChildren,
			getTopLevelFolders: store.getTopLevelFolders,
			focusedFolder: store.focusedFolder,
			findFolderByPath: store.findFolderByPath,
			getFoldersByParent: store.getFoldersByParent,
			sortFolders: store.sortFolders,
			setFocusedFolder: store.setFocusedFolderAndSaveInLocalStorage,
			expandedFolderNames: store.expandedFolderNames,
			changeExpandedFolderNames: store.changeExpandedFolderNames,
		}))
	);

	useEffect(() => {
		const lastFocusedFolderPath = localStorage.getItem(
			ASN_FOCUSED_FOLDER_PATH_KEY
		);
		const lastExpandedFolderNames = localStorage.getItem(
			ASN_EXPANDED_FOLDER_NAMES_KEY
		);

		if (lastFocusedFolderPath && lastFocusedFolderPath !== "/") {
			const folder = findFolderByPath(lastFocusedFolderPath);
			if (folder) {
				setFocusedFolder(folder);
			}
		} else if (rootFolder) {
			setFocusedFolder(rootFolder);
		}
		if (lastExpandedFolderNames) {
			try {
				const folderNames = JSON.parse(lastExpandedFolderNames);
				changeExpandedFolderNames(folderNames);
			} catch (error) {
				console.error("Invalid Json format: ", error);
			}
		}
	}, []);

	const onToggleExpandState = (folder: TFolder): void => {
		if (hasFolderChildren(folder)) {
			const folderNames = expandedFolderNames.includes(folder.name)
				? expandedFolderNames.filter((name) => name !== folder.name)
				: [...expandedFolderNames, folder.name];
			changeExpandedFolderNames(folderNames);
			localStorage.setItem(
				ASN_EXPANDED_FOLDER_NAMES_KEY,
				JSON.stringify(folderNames)
			);
		}
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
						setFocusedFolder(folder);
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
						setFocusedFolder(rootFolder);
					}}
				/>
			</div>
		);
	};

	const topLevelFolders = getTopLevelFolders();
	return (
		<Fragment>
			{renderRootFolder()}
			{renderFolders(topLevelFolders)}
		</Fragment>
	);
};

export default Folders;
