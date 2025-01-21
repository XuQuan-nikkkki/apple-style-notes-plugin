import { Menu } from "obsidian";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { AscendingSortIcon, DescendingSortIcon } from "src/assets/icons";
import { FileTreeStore } from "src/store";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const SortFolders = ({ useFileTreeStore }: Props) => {
	const { folderSortRule } = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folderSortRule: store.folderSortRule,
		}))
	);

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

	const icon = folderSortRule.contains("Ascending") ? (
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
