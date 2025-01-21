import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { AddFolderIcon } from "src/assets/icons";
import { FileTreeStore } from "src/store";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
};
const CreateFolder = ({ useFileTreeStore }: Props) => {
	const { rootFolder, focusedFolder, createNewFolder } = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			rootFolder: store.rootFolder,
			focusedFolder: store.focusedFolder,
			createNewFolder: store.createNewFolder,
		}))
	);

	const onCreateFolder = async () => {
		if (!rootFolder) return;
		const parentFolder = focusedFolder ? focusedFolder : rootFolder;
		await createNewFolder(parentFolder);
	};

	return (
		<div className="asn-actions-icon-wrapper" onClick={onCreateFolder}>
			<AddFolderIcon />
		</div>
	);
};

export default CreateFolder;
