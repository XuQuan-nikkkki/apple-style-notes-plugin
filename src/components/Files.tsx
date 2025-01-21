import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";

import { FileTreeStore } from "src/store";
import { EmptyFolderIcon } from "src/assets/icons";

import File from "./File";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const Files = ({ useFileTreeStore }: Props) => {
	const { focusedFolder, getDirectFilesInFolder, restoreLastFocusedFile } =
		useFileTreeStore(
			useShallow((store: FileTreeStore) => ({
				focusedFolder: store.focusedFolder,
				getDirectFilesInFolder: store.getDirectFilesInFolder,
				restoreLastFocusedFile: store.restoreLastFocusedFile,
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
