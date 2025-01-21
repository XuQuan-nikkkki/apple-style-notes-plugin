import { useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { ExpandIcon,CollapseIcon } from "src/assets/icons";
import { FileTreeStore } from "src/store";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const ToggleFolders = ({ useFileTreeStore }: Props) => {
	const { folders, changeExpandedFolderNames } = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			folders: store.folders,
			changeExpandedFolderNames: store.changeExpandedFolderNames,
		}))
	);

	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const onToggleAllFolders = () => {
		if (isExpanded) {
			changeExpandedFolderNames([]);
		} else {
			changeExpandedFolderNames(folders.map((f) => f.name));
		}
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="asn-actions-icon-wrapper" onClick={onToggleAllFolders}>
			{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
		</div>
	);
};

export default ToggleFolders;
