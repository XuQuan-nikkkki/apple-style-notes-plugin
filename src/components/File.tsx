import { TFile } from "obsidian";
import { useEffect, useState } from "react";
import { ASN_FOCUSED_FILE_PATH_KEY } from "src/assets/constants";
import { FileTreeStore } from "src/store";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";


type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	file: TFile;
};
const File = ({ file, useFileTreeStore }: Props) => {
	const {
		focusedFile,
		readFile,
		openFile,
		setFocusedFile,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFile: store.focusedFile,
			readFile: store.readFile,
			openFile: store.openFile,
			setFocusedFile: store.setFocusedFile,
		}))
	);

	const [contentPreview, setContentPreview] = useState<string>("");

	const loadContent = async () => {
		const content = await readFile(file);
		const cleanContent = content
			.replace(/^---\n[\s\S]*?\n---\n/, "")
			.trim();
		setContentPreview(cleanContent);
	};

	useEffect(() => {
		loadContent();
	}, []);

	const onSelectFile = (): void => {
		setFocusedFile(file);
		openFile(file);
		localStorage.setItem(ASN_FOCUSED_FILE_PATH_KEY, file.path);
	};

	const isFocused = focusedFile?.path === file.path;
	const className = "asn-file" + (isFocused ? " asn-focused-file" : "");
	return (
		<div className={className} onClick={onSelectFile}>
			<div className="asn-file-name">{file.basename}</div>
			<div className="asn-file-details">
				<span className="asn-file-created-time">
					{new Date(file.stat.ctime).toLocaleString().split(" ")[0]}
				</span>
				<span className="asn-file-content-preview">
					{contentPreview}
				</span>
			</div>
		</div>
	);
};

export default File;
