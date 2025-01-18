import { TFile } from "obsidian";
import { useEffect, useState } from "react";

type Props = {
	file: TFile;
	isFocused: boolean;
	onSelectFile: () => void;
	onReadFile: (file: TFile) => Promise<string>;
};
const File = ({ file, isFocused, onSelectFile, onReadFile }: Props) => {
	const [contentPreview, setContentPreview] = useState<string>("");

	const loadContent = async () => {
		const content = await onReadFile(file);
		const cleanContent = content
			.replace(/^---\n[\s\S]*?\n---\n/, "")
			.trim();
		setContentPreview(cleanContent);
	};

	useEffect(() => {
		loadContent();
	}, []);

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
