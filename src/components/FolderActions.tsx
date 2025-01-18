import { useState } from "react";
import { AddFolderIcon, ExpandIcon, SortIcon } from "src/assets/icons";
import CollapseIcon from "src/assets/icons/CollapseIcon";

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

type ToggleFoldersProps = {
	onExpandAllFolders: () => void;
	onCollapseAllFolders: () => void;
};
const ToggleFolders = ({
	onExpandAllFolders,
	onCollapseAllFolders,
}: ToggleFoldersProps) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const onToggleAllFolders = () => {
		if (isExpanded) {
			onCollapseAllFolders();
		} else {
			onExpandAllFolders();
		}
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="asn-actions-icon-wrapper" onClick={onToggleAllFolders}>
			{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
		</div>
	);
};

type Props = AddFolderProps & ToggleFoldersProps;
const FolderActions = ({
	onCreateFolder,
	onExpandAllFolders,
	onCollapseAllFolders,
}: Props) => {
	return (
		<div className="asn-actions asn-folder-actions">
			<AddFolder onCreateFolder={onCreateFolder} />
			<SortFolders />
			<ToggleFolders
				onExpandAllFolders={onExpandAllFolders}
				onCollapseAllFolders={onCollapseAllFolders}
			/>
		</div>
	);
};

export default FolderActions;
