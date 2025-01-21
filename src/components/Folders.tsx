import { Fragment, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";
import { TFolder } from "obsidian";

import AppleStyleNotesPlugin from "src/main";
import { FileTreeStore } from "src/store";
import Folder from "./Folder";

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
		getFoldersByParent,
		sortFolders,
		expandedFolderNames,
		restoreExpandedFolderNames,
		restoreLastFocusedFolder,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			hasFolderChildren: store.hasFolderChildren,
			getTopLevelFolders: store.getTopLevelFolders,
			getFoldersByParent: store.getFoldersByParent,
			sortFolders: store.sortFolders,
			expandedFolderNames: store.expandedFolderNames,
			restoreExpandedFolderNames: store.restoreExpandedFolderNames,
			restoreLastFocusedFolder: store.restoreLastFocusedFolder,
		}))
	);

	useEffect(() => {
		restoreLastFocusedFolder();
		restoreExpandedFolderNames();
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
