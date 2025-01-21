import { useEffect } from "react";
import { Menu } from "obsidian";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { AscendingSortIcon, DescendingSortIcon } from "src/assets/icons";
import { FileSortRule, FileTreeStore } from "src/store";
import AppleStyleNotesPlugin from "src/main";

type FileSortRuleItem = {
	text: string;
	rule: FileSortRule;
};
type FileSortRuleGroup = FileSortRuleItem[];
const FileSortByNameRules: FileSortRuleGroup = [
	{ text: "Folder name(A to Z)", rule: "FileNameAscending" },
	{ text: "Folder name(Z to A)", rule: "FileNameDescending" },
];
const FileSortByModifiedTimeRules: FileSortRuleGroup = [
	{
		text: "Modified time(new to old)",
		rule: "FileModifiedTimeDescending",
	},
	{
		text: "Modified time(old to new)",
		rule: "FileModifiedTimeAscending",
	},
];
const FileSortByCreatedTimeRules: FileSortRuleGroup = [
	{
		text: "Created time(new to old)",
		rule: "FileCreatedTimeDescending",
	},
	{
		text: "Created time(old to new)",
		rule: "FileCreatedTimeAscending",
	},
];

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
};
const SortFiles = ({ useFileTreeStore, plugin }: Props) => {
	const {
		fileSortRule,
		changeFileSortRule,
		isFilesInAscendingOrder,
		restoreFileSortRule,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			fileSortRule: store.fileSortRule,
			isFilesInAscendingOrder: store.isFilesInAscendingOrder,
			changeFileSortRule: store.changeFileSortRule,
			restoreFileSortRule: store.restoreFileSortRule,
		}))
	);

	useEffect(() => {
		restoreFileSortRule();
	}, []);

	const onChangeSortRule = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		const menu = new Menu();
		const ruleGroups: FileSortRuleGroup[] = [
			FileSortByNameRules,
			FileSortByModifiedTimeRules,
			FileSortByCreatedTimeRules,
		];
		ruleGroups.forEach((rules) => {
			rules.forEach(({ text, rule }) => {
				menu.addItem((newItem) => {
					newItem
						.setTitle(text)
						.setChecked(rule === fileSortRule)
						.onClick(() => {
							changeFileSortRule(rule);
						});
				});
			});
			menu.addSeparator();
		});
		plugin.app.workspace.trigger("sort-files-menu", menu);
		menu.showAtPosition({ x: e.pageX, y: e.pageY });
		return false;
	};

	const icon = isFilesInAscendingOrder() ? (
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

export default SortFiles;
