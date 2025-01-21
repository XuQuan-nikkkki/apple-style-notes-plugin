import { Menu } from "obsidian";
import { useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
	AddFolderIcon,
	ExpandIcon,
	AscendingSortIcon,
	DescendingSortIcon,
} from "src/assets/icons";
import CollapseIcon from "src/assets/icons/CollapseIcon";
import { FileTreeStore, FolderSortRule } from "src/store";

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
		createNewFolder,
		changeExpandedFolderNames,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folders: store.folders,
			rootFolder: store.rootFolder,
			folderSortRule: store.folderSortRule,
			focusedFolder: store.focusedFolder,
			createNewFolder: store.createNewFolder,
			changeExpandedFolderNames: store.changeExpandedFolderNames,
		}))
	);

	const onCreateFolder = async () => {
		if (!rootFolder) return;
		const parentFolder = focusedFolder ? focusedFolder : rootFolder;
		await createNewFolder(parentFolder);
	};

	const onToggleFoldersExpandState = (folderNames: string[]): void => {
		changeExpandedFolderNames(folderNames);
	};

	return (
		<div className="asn-actions asn-folder-actions">
			<div className="asn-actions-icon-wrapper" onClick={onCreateFolder}>
				<AddFolderIcon />
			</div>
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
