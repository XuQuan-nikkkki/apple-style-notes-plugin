import { useMemo, useState } from "react";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore } from "src/store";
import { ASN_FOLDER_PANE_WIDTH_KEY } from "src/assets/constants";
import DraggableDivider from "./DraggableDivider";
import FolderActions from "./FolderActions";
import FileActions from "./FileActions";
import Files from "./Files";
import Folders from "./Folders";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	const useFileTreeStore = useMemo(
		() => createFileTreeStore(plugin),
		[plugin]
	);

	const [folderPaneWidth, setFolderPaneWidth] = useState<number | undefined>(
		220
	);

	const onChangeFolderPaneWidth = (width: number) => {
		setFolderPaneWidth(width);
		localStorage.setItem(ASN_FOLDER_PANE_WIDTH_KEY, String(width));
	};

	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane" style={{ width: folderPaneWidth }}>
				<FolderActions useFileTreeStore={useFileTreeStore} />
				<Folders plugin={plugin} useFileTreeStore={useFileTreeStore} />
			</div>
			<DraggableDivider
				initialWidth={folderPaneWidth}
				onChangeWidth={onChangeFolderPaneWidth}
			/>
			<div className="asn-files-pane">
				<FileActions />
				<Files useFileTreeStore={useFileTreeStore} />
			</div>
		</div>
	);
};

export default FileTree;
