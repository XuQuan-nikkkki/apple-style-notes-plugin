import { Fragment, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";
import { TFolder } from "obsidian";

import AppleStyleNotesPlugin from "src/main";
import { FileTreeStore } from "src/store";
import Folder from "./Folder";
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
		hasFolderChildren,
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
			hasFolderChildren: store.hasFolderChildren,
			getTopLevelFolders: store.getTopLevelFolders,
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

	const renderFolders = (folders: TFolder[]) => {
		const sortedFolders = sortFolders(folders, folderSortRule);
		return sortedFolders.map((folder) => (
			<div key={folder.name}>
				<Folder
					folder={folder}
					useFileTreeStore={useFileTreeStore}
					plugin={plugin}
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
					folder={rootFolder}
					useFileTreeStore={useFileTreeStore}
					plugin={plugin}
					isRoot
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
