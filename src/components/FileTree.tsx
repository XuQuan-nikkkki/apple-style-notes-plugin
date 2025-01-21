import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import { TFolder } from "obsidian";
import {
	ASN_FOCUSED_FOLDER_PATH_KEY,
	ASN_FOLDER_PANE_WIDTH_KEY,
} from "src/assets/constants";
import DraggableDivider from "./DraggableDivider";
import FolderActions from "./FolderActions";
import FileActions from "./FileActions";
import Files from "./Files";
import Folders from "./Folders";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);
	const { setFocusedFolder, findFolderByPath } = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			setFocusedFolder: store.setFocusedFolder,
			findFolderByPath: store.findFolderByPath,
		}))
	);

	const [folderPaneWidth, setFolderPaneWidth] = useState<number | undefined>(
		220
	);

	useEffect(() => {
		const lastFocusedFolderPath = localStorage.getItem(
			ASN_FOCUSED_FOLDER_PATH_KEY
		);

		if (lastFocusedFolderPath && lastFocusedFolderPath !== "/") {
			const folder = findFolderByPath(lastFocusedFolderPath);
			if (folder) {
				onSelectFolder(folder);
			}
		} else if (rootFolder) {
			onSelectFolder(rootFolder);
		}
	}, []);

	const onSelectFolder = (folder: TFolder): void => {
		setFocusedFolder(folder);
		localStorage.setItem(ASN_FOCUSED_FOLDER_PATH_KEY, folder.path);
	};

	const onChangeFolderPaneWidth = (width: number) => {
		setFolderPaneWidth(width);
		localStorage.setItem(ASN_FOLDER_PANE_WIDTH_KEY, String(width));
	};

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane" style={{ width: folderPaneWidth }}>
				<FolderActions useFileTreeStore={useFileTreeStore} />
				<Folders plugin={plugin} useFileTreeStore={useFileTreeStore} />
			</div>
			<DraggableDivider
				initialWidth={folderPaneWidth}
				onChangeWidth={onChangeFolderPaneWidth}
			/>
			<div className="asn-files-pane">
				<FileActions />
				<Files useFileTreeStore={useFileTreeStore} />
			</div>
		</div>
	);
};

export default FileTree;
