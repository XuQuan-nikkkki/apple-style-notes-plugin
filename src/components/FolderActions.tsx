import { Menu } from "obsidian";
import { useState } from "react";
import {
	AddFolderIcon,
	ExpandIcon,
	AscendingSortIcon,
	DescendingSortIcon,
} from "src/assets/icons";
import CollapseIcon from "src/assets/icons/CollapseIcon";
import { FolderSortRule } from "src/store";

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
		console.log("clicked")
		const menu = new Menu();
		menu.addItem((newItem) => {
			newItem.setTitle("Folder name(A to Z)");
			newItem.onClick(() => {
				console.log("folder name")
			})
		});
		menu.addItem((newItem) => {
			newItem.setTitle("Folder name(Z to A)");
			newItem.onClick(() => {
				console.log("folder name")
			})
		});
		menu.addSeparator();
		menu.addItem((newItem) => {
			newItem.setTitle("Files count(small to large)");
			newItem.onClick(() => {
				console.log("folder name")
			})
		});
		menu.addItem((newItem) => {
			newItem.setTitle("Files count(large to small)");
			newItem.onClick(() => {
				console.log("folder name")
			})
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

type Props = AddFolderProps & ToggleFoldersProps & SortFoldersProps;
const FolderActions = ({
	onCreateFolder,
	onExpandAllFolders,
	onCollapseAllFolders,
	sortRule,
}: Props) => {
	return (
		<div className="asn-actions asn-folder-actions">
			<AddFolder onCreateFolder={onCreateFolder} />
			<SortFolders sortRule={sortRule} />
			<ToggleFolders
				onExpandAllFolders={onExpandAllFolders}
				onCollapseAllFolders={onCollapseAllFolders}
			/>
		</div>
	);
};

export default FolderActions;
