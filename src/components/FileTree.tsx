import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore, FileTreeStore } from "src/store";
import Folder from "./Folder";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);
	const {
		getFilesCountInFolder,
		hasFolderChildren,
		getTopLevelFolders,
	} = useFileTreeStore(
		useShallow((state: FileTreeStore) => ({
			getFilesCountInFolder: state.getFilesCountInFolder,
			hasFolderChildren: state.hasFolderChildren,
			getTopLevelFolders: state.getTopLevelFolders,
		}))
	);

  const topLevelFolders = getTopLevelFolders()
	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane">
				{topLevelFolders.map((folder) => (
					<Folder
						key={folder.name}
						folder={folder}
						filesCount={getFilesCountInFolder(folder)}
						hasFolderChildren={hasFolderChildren(folder)}
					/>
				))}
			</div>
			<div className="asn-pane-divider" />
			<div className="asn-files-pane">files pane</div>
		</div>
	);
};

export default FileTree;
