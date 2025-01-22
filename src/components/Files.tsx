import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";

import { FileTreeStore } from "src/store";
import { EmptyFolderIcon } from "src/assets/icons";

import File from "./File";
import AppleStyleNotesPlugin from "src/main";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
};
const Files = ({ useFileTreeStore, plugin }: Props) => {
	const {
		focusedFolder,
		getDirectFilesInFolder,
		restoreLastFocusedFile,
		sortFiles,
		fileSortRule,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFolder: store.focusedFolder,
			getDirectFilesInFolder: store.getDirectFilesInFolder,
			restoreLastFocusedFile: store.restoreLastFocusedFile,
			sortFiles: store.sortFiles,
			fileSortRule: store.fileSortRule,
		}))
	);

	useEffect(() => {
		restoreLastFocusedFile();
	}, []);

	const renderNoneFilesTips = () => {
		return (
			<div className="asn-none-files-tips">
				<EmptyFolderIcon />
			</div>
		);
	};

	if (!focusedFolder) return renderNoneFilesTips();

	const files = getDirectFilesInFolder(focusedFolder);
	if (!files.length) return renderNoneFilesTips();

	const sortedFiles = sortFiles(files, fileSortRule);
	return (
		<>
			{sortedFiles.map((file) => (
				<File
					key={file.name}
					useFileTreeStore={useFileTreeStore}
					file={file}
					plugin={plugin}
				/>
			))}
		</>
	);
};

export default Files;
