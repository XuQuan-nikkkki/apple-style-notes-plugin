import { useMemo } from "react";
import { useShallow } from 'zustand/react/shallow'

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
  const { folders, getFilesCountInFolder } = useFileTreeStore(
    useShallow((state:FileTreeStore) => ({
			folders: state.folders,
			getFilesCountInFolder: state.getFilesCountInFolder,
		})),
  )

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane">
				{folders.map((folder) => (
					<Folder
						key={folder.name}
						folder={folder}
						filesCount={getFilesCountInFolder(folder)}
					/>
				))}
			</div>
			<div className="asn-pane-divider" />
			<div className="asn-files-pane">files pane</div>
		</div>
	);
};

export default FileTree;
