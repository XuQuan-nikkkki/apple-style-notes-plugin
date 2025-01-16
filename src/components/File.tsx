import { TFile } from "obsidian";

type Props = {
	file: TFile;
	isFocused: boolean;
	onSelectFile: () => void;
};
const File = ({ file, isFocused, onSelectFile }: Props) => {
	const className = "asn-file" + (isFocused ? " asn-focused-file" : "");
	return (
		<div className={className} onClick={onSelectFile}>
			<div className="asn-file-name">{file.basename}</div>
			<div className="asn-file-details">
				<span className="asn-file-created-time">
					{new Date(file.stat.ctime).toLocaleString().split(" ")[0]}
				</span>
				<span className="asn-file-content-preview"></span>
			</div>
		</div>
	);
};

export default File;
