import { AddFolderIcon, ExpandIcon, SortIcon } from "src/assets/icons";

type AddFolderProps = {
	onCreateFolder: () => void;
};
const AddFolder = ({ onCreateFolder }: AddFolderProps) => {
	return (
		<div className="asn-actions-icon-wrapper" onClick={onCreateFolder}>
			<AddFolderIcon />
		</div>
	);
};

const SortFolders = () => {
	return (
		<div className="asn-actions-icon-wrapper">
			<SortIcon />
		</div>
	);
};

const ToggleFolders = () => {
	return (
		<div className="asn-actions-icon-wrapper">
			<ExpandIcon />
		</div>
	);
};

type Props = AddFolderProps;
const FolderActions = ({ onCreateFolder }: Props) => {
	return (
		<div className="asn-actions asn-folder-actions">
			<AddFolder onCreateFolder={onCreateFolder} />
			<SortFolders />
			<ToggleFolders />
		</div>
	);
};

export default FolderActions;
