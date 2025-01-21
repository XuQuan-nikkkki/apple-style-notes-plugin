import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";

import { FileTreeStore } from "src/store";
import { EmptyFolderIcon } from "src/assets/icons";
import { ASN_FOCUSED_FILE_PATH_KEY } from "src/assets/constants";

import File from "./File";
import { useEffect } from "react";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const Files = ({ useFileTreeStore }: Props) => {
	const {
		focusedFolder,
		getDirectFilesInFolder,
		findFileByPath,
		selectFile,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFolder: store.focusedFolder,
			getDirectFilesInFolder: store.getDirectFilesInFolder,
			findFileByPath: store.findFileByPath,
			selectFile: store.selectFile,
		}))
	);

	useEffect(() => {
		const lastFocusedFilePath = localStorage.getItem(
			ASN_FOCUSED_FILE_PATH_KEY
		);
		if (lastFocusedFilePath) {
			const file = findFileByPath(lastFocusedFilePath);
			if (file) {
				selectFile(file);
			}
		}
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
	return (
		<>
			{files.map((file) => (
				<File
					key={file.name}
					useFileTreeStore={useFileTreeStore}
					file={file}
				/>
			))}
		</>
	);
};

export default Files;
