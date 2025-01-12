import { TFolder } from "obsidian";
import { FolderIcon } from "src/assets/icons/FolderIcon";

type Props = {
	folder: TFolder;
	filesCount: number;
};
const Folder = ({ folder, filesCount }: Props) => {
	return (
		<div className="asn-folder">
			<div>
				<FolderIcon />
				{folder.name}
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
