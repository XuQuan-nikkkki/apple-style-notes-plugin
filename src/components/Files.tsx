import { TFile } from "obsidian";
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
		setFocusedFile,
		openFile,
		findFileByPath,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFolder: store.focusedFolder,
			getDirectFilesInFolder: store.getDirectFilesInFolder,
			setFocusedFile: store.setFocusedFile,
			openFile: store.openFile,
			findFileByPath: store.findFileByPath,
		}))
	);

	useEffect(() => {
		const lastFocusedFilePath = localStorage.getItem(
			ASN_FOCUSED_FILE_PATH_KEY
		);
		if (lastFocusedFilePath) {
			const file = findFileByPath(lastFocusedFilePath);
			if (file) {
				onSelectFile(file);
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

	const onSelectFile = (file: TFile): void => {
		setFocusedFile(file);
		openFile(file);
		localStorage.setItem(ASN_FOCUSED_FILE_PATH_KEY, file.path);
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
