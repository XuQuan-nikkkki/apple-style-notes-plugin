import { Menu } from "obsidian";
import { useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { ASN_EXPANDED_FOLDER_NAMES_KEY } from "src/assets/constants";
import {
	AddFolderIcon,
	ExpandIcon,
	AscendingSortIcon,
	DescendingSortIcon,
} from "src/assets/icons";
import CollapseIcon from "src/assets/icons/CollapseIcon";
import { FileTreeStore, FolderSortRule } from "src/store";
import { isFolder } from "src/utils";

type AddFolderProps = {
	onCreateFolder: () => void;
};
const AddFolder = ({ onCreateFolder }: AddFolderProps) => {
	return (
		<div className="asn-actions-icon-wrapper" onClick={onCreateFolder}>
			<AddFolderIcon />
		</div>
	);
};

type SortFoldersProps = {
	sortRule: FolderSortRule;
};
const SortFolders = ({ sortRule }: SortFoldersProps) => {
	const onChangeSortRule = () => {
		console.log("clicked");
		const menu = new Menu();
		menu.addItem((newItem) => {
			newItem.setTitle("Folder name(A to Z)");
			newItem.onClick(() => {
				console.log("folder name");
			});
		});
		menu.addItem((newItem) => {
			newItem.setTitle("Folder name(Z to A)");
			newItem.onClick(() => {
				console.log("folder name");
			});
		});
		menu.addSeparator();
		menu.addItem((newItem) => {
			newItem.setTitle("Files count(small to large)");
			newItem.onClick(() => {
				console.log("folder name");
			});
		});
		menu.addItem((newItem) => {
			newItem.setTitle("Files count(large to small)");
			newItem.onClick(() => {
				console.log("folder name");
			});
		});
		// TODO: open menu
	};

	const icon = sortRule.contains("Ascending") ? (
		<AscendingSortIcon />
	) : (
		<DescendingSortIcon />
	);
	return (
		<div className="asn-actions-icon-wrapper" onClick={onChangeSortRule}>
			{icon}
		</div>
	);
};

type ToggleFoldersProps = {
	onExpandAllFolders: () => void;
	onCollapseAllFolders: () => void;
};
const ToggleFolders = ({
	onExpandAllFolders,
	onCollapseAllFolders,
}: ToggleFoldersProps) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const onToggleAllFolders = () => {
		if (isExpanded) {
			onCollapseAllFolders();
		} else {
			onExpandAllFolders();
		}
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="asn-actions-icon-wrapper" onClick={onToggleAllFolders}>
			{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
		</div>
	);
};

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const FolderActions = ({ useFileTreeStore }: Props) => {
	const {
		folders,
		rootFolder,
		folderSortRule,
		focusedFolder,
		createFolder,
		changeExpandedFolderNames,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folders: store.folders,
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			focusedFolder: store.focusedFolder,
			setFocusedFolder: store.setFocusedFolder,
			findFolderByPath: store.findFolderByPath,
			createFolder: store.createFolder,
			expandedFolderNames: store.expandedFolderNames,
			changeExpandedFolderNames: store.changeExpandedFolderNames,
		}))
	);

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

	const onToggleFoldersExpandState = (folderNames: string[]): void => {
		changeExpandedFolderNames(folderNames);
		localStorage.setItem(
			ASN_EXPANDED_FOLDER_NAMES_KEY,
			JSON.stringify(folderNames)
		);
	};

	return (
		<div className="asn-actions asn-folder-actions">
			<AddFolder onCreateFolder={onCreateFolder} />
			<SortFolders sortRule={folderSortRule} />
			<ToggleFolders
				onExpandAllFolders={() =>
					onToggleFoldersExpandState(folders.map((f) => f.name))
				}
				onCollapseAllFolders={() => onToggleFoldersExpandState([])}
			/>
		</div>
	);
};

export default FolderActions;
