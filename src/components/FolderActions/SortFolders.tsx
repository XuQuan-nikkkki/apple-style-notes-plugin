import { useEffect } from "react";
import { Menu } from "obsidian";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { AscendingSortIcon, DescendingSortIcon } from "src/assets/icons";
import { FileTreeStore, FolderSortRule } from "src/store";
import AppleStyleNotesPlugin from "src/main";

type FolderSortRuleItem = {
	text: string;
	rule: FolderSortRule;
};
type FolderSortRuleGroup = FolderSortRuleItem[];
const FolderSortByNameRules: FolderSortRuleGroup = [
	{ text: "Folder name(A to Z)", rule: "FolderNameAscending" },
	{ text: "Folder name(Z to A)", rule: "FolderNameDescending" },
];
const FolderSortByFilesCountRules: FolderSortRuleGroup = [
	{
		text: "Files count(small to large)",
		rule: "FilesCountAscending",
	},
	{
		text: "Files count(large to small)",
		rule: "FilesCountDescending",
	},
];

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
};
const SortFolders = ({ useFileTreeStore, plugin }: Props) => {
	const {
		folderSortRule,
		changeFolderSortRule,
		isFoldersInAscendingOrder,
		restoreFolderSortRule,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folderSortRule: store.folderSortRule,
			isFoldersInAscendingOrder: store.isFoldersInAscendingOrder,
			changeFolderSortRule: store.changeFolderSortRule,
			restoreFolderSortRule: store.restoreFolderSortRule,
		}))
	);

	useEffect(() => {
		restoreFolderSortRule();
	}, []);

	const onChangeSortRule = (e: React.MouseEvent<HTMLDivElement>) => {
		const menu = new Menu();
		const ruleGroups: FolderSortRuleGroup[] = [
			FolderSortByNameRules,
			FolderSortByFilesCountRules,
		];
		ruleGroups.forEach((rules) => {
			rules.forEach(({ text, rule }) => {
				menu.addItem((newItem) => {
					newItem
						.setTitle(text)
						.setChecked(rule === folderSortRule)
						.onClick(() => {
							changeFolderSortRule(rule);
						});
				});
			});
			menu.addSeparator();
		});
		plugin.app.workspace.trigger("sort-folders-menu", menu);
		menu.showAtPosition({ x: e.pageX, y: e.pageY });
		return false;
	};

	const icon = isFoldersInAscendingOrder() ? (
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

export default SortFolders;
