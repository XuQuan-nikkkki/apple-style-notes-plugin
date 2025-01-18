import { ArrowDownIcon } from "src/assets/icons/ArrowDownIcon";
import { ArrowRightIcon } from "src/assets/icons/ArrowRightIcon";
import { FolderIcon } from "src/assets/icons/FolderIcon";

type Props = {
	folderName: string;
	filesCount: number;
	hasFolderChildren: boolean;
	isFocused: boolean;
	isExpanded: boolean;
	isRoot: boolean;
	onSelectFolder: () => void;
	onToggleExpandState: () => void;
};
const Folder = ({
	folderName,
	filesCount,
	hasFolderChildren,
	isFocused,
	isExpanded,
	isRoot,
	onSelectFolder,
	onToggleExpandState,
}: Props) => {
	const folderClassNames = ["asn-folder"];
	if (isFocused) {
		folderClassNames.push("asn-focused-folder");
	}
	if (isRoot) {
		folderClassNames.push("asn-root-folder");
	}
	return (
		<div className={folderClassNames.join(" ")} onClick={onSelectFolder}>
			<div className="asn-folder-pane-left-sectionn">
				<span
					className="asn-folder-arrow-icon-wrapper"
					onClick={(e) => {
						e.stopPropagation();
						onToggleExpandState();
					}}
				>
					{hasFolderChildren &&
						!isRoot &&
						(isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
				</span>
				<FolderIcon />
				<div className="asn-folder-name">{folderName}</div>
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
