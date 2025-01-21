import { TFile } from "obsidian";
import { useEffect, useState } from "react";
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
		selectFile
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFile: store.focusedFile,
			readFile: store.readFile,
			selectFile: store.selectFile
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

	const isFocused = focusedFile?.path === file.path;
	const className = "asn-file" + (isFocused ? " asn-focused-file" : "");
	return (
		<div className={className} onClick={() => selectFile(file)}>
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
