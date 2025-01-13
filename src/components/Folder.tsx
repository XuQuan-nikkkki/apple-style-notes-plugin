import { TFolder } from "obsidian";
import { ArrowDownIcon } from "src/assets/icons/ArrowDownIcon";
import { ArrowRightIcon } from "src/assets/icons/ArrowRightIcon";
import { FolderIcon } from "src/assets/icons/FolderIcon";

type Props = {
	folder: TFolder;
	filesCount: number;
	hasFolderChildren: boolean;
	isFocused: boolean;
	onSelectFolder: () => void;
};
const Folder = ({
	folder,
	filesCount,
	hasFolderChildren,
	isFocused,
	onSelectFolder,
}: Props) => {
	const folderClassName = `asn-folder ${
		isFocused ? "asn-focused-folder" : ""
	}`;
	return (
		<div className={folderClassName} onClick={onSelectFolder}>
			<div className="asn-folder-pane-left-sectionn">
				<span className="asn-folder-arrow-icon-wrapper ">
					{hasFolderChildren &&
						(isFocused ? <ArrowDownIcon /> : <ArrowRightIcon />)}
				</span>
				<FolderIcon />
				{folder.name}
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
