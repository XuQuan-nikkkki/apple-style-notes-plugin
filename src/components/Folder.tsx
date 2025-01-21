import { TFolder } from "obsidian";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { ArrowDownIcon, ArrowRightIcon, FolderIcon } from "src/assets/icons";
import AppleStyleNotesPlugin from "src/main";
import { FileTreeStore } from "src/store";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
	folder: TFolder;
	isRoot?: boolean;
};
const Folder = ({
	folder,
	useFileTreeStore,
	plugin,
	isRoot = false,
}: Props) => {
	const {
		getFilesCountInFolder,
		hasFolderChildren,
		focusedFolder,
		setFocusedFolder,
		expandedFolderPaths,
		changeExpandedFolderPaths,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			getFilesCountInFolder: store.getFilesCountInFolder,
			hasFolderChildren: store.hasFolderChildren,
			focusedFolder: store.focusedFolder,
			setFocusedFolder: store.setFocusedFolderAndSaveInLocalStorage,
			expandedFolderPaths: store.expandedFolderPaths,
			changeExpandedFolderPaths: store.changeExpandedFolderPaths,
		}))
	);

	const onToggleExpandState = (): void => {
		if (isRoot) return;
		if (hasFolderChildren(folder)) {
			const folderPaths = expandedFolderPaths.includes(folder.path)
				? expandedFolderPaths.filter((path) => path !== folder.path)
				: [...expandedFolderPaths, folder.path];
				changeExpandedFolderPaths(folderPaths);
		}
	};

	const folderName = isRoot ? plugin.app.vault.getName() : folder.name;
	const filesCount = getFilesCountInFolder(folder);
	const isFocused = folder.path == focusedFolder?.path;
	const isExpanded = isRoot || expandedFolderPaths.includes(folder.path);

	const folderClassNames = ["asn-folder"];
	if (isFocused) {
		folderClassNames.push("asn-focused-folder");
	}
	if (isRoot) {
		folderClassNames.push("asn-root-folder");
	}
	return (
		<div
			className={folderClassNames.join(" ")}
			onClick={() => setFocusedFolder(folder)}
		>
			<div className="asn-folder-pane-left-sectionn">
				<span
					className="asn-folder-arrow-icon-wrapper"
					onClick={(e) => {
						e.stopPropagation();
						onToggleExpandState();
					}}
				>
					{hasFolderChildren(folder) &&
						!isRoot &&
						(isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
				</span>
				<FolderIcon />
				<div className="asn-folder-name">{folderName}</div>
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
