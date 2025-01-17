import { TFolder } from "obsidian";
import { ArrowDownIcon } from "src/assets/icons/ArrowDownIcon";
import { ArrowRightIcon } from "src/assets/icons/ArrowRightIcon";
import { FolderIcon } from "src/assets/icons/FolderIcon";

type Props = {
	folder: TFolder;
	filesCount: number;
	hasFolderChildren: boolean;
	isFocused: boolean;
	isExpanded: boolean;
	onSelectFolder: () => void;
	onToggleExpandState: () => void;
};
const Folder = ({
	folder,
	filesCount,
	hasFolderChildren,
	isFocused,
	isExpanded,
	onSelectFolder,
	onToggleExpandState,
}: Props) => {
	const folderClassName = `asn-folder ${
		isFocused ? "asn-focused-folder" : ""
	}`;
	return (
		<div className={folderClassName} onClick={onSelectFolder}>
			<div className="asn-folder-pane-left-sectionn">
				<span
					className="asn-folder-arrow-icon-wrapper"
					onClick={(e) => {
						e.stopPropagation()
						onToggleExpandState();
					}}
				>
					{hasFolderChildren &&
						(isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
				</span>
				<FolderIcon />
				<div className="asn-folder-name">{folder.name}</div>
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
