import { TFolder } from "obsidian";
import { ArrowRightIcon } from "src/assets/icons/ArrowRightIcon";
import { FolderIcon } from "src/assets/icons/FolderIcon";

type Props = {
	folder: TFolder;
	filesCount: number;
	hasFolderChildren: boolean;
};
const Folder = ({ folder, filesCount, hasFolderChildren }: Props) => {
	console.log(folder);
	return (
		<div className="asn-folder">
			<div className="asn-folder-pane-left-sectionn">
				<span className="asn-folder-toggle-icon-section">
					{hasFolderChildren && <ArrowRightIcon />}
				</span>
				<FolderIcon />
				{folder.name}
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
