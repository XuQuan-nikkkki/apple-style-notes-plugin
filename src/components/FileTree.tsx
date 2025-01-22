import { useMemo, useState } from "react";

import AppleStyleNotesPlugin from "src/main";
import { createFileTreeStore } from "src/store";
import { ASN_FOLDER_PANE_WIDTH_KEY } from "src/assets/constants";
import DraggableDivider from "./DraggableDivider";
import Files from "./Files";
import Folders from "./Folders";
import CreateFolder from "./FolderActions/CreateFolder";
import ToggleFolders from "./FolderActions/ToggleFolders";
import SortFolders from "./FolderActions/SortFolders";
import CreateFile from "./FileActions/CreateFile";
import SortFiles from "./FileActions/SortFiles";

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
				<div className="asn-actions asn-folder-actions">
					<CreateFolder useFileTreeStore={useFileTreeStore} />
					<SortFolders
						useFileTreeStore={useFileTreeStore}
						plugin={plugin}
					/>
					<ToggleFolders useFileTreeStore={useFileTreeStore} />
				</div>
				<Folders plugin={plugin} useFileTreeStore={useFileTreeStore} />
			</div>
			<DraggableDivider
				initialWidth={folderPaneWidth}
				onChangeWidth={onChangeFolderPaneWidth}
			/>
			<div className="asn-files-pane">
				<div className="asn-actions asn-file-actions">
					<CreateFile useFileTreeStore={useFileTreeStore} />
					<SortFiles
						useFileTreeStore={useFileTreeStore}
						plugin={plugin}
					/>
				</div>
				<Files useFileTreeStore={useFileTreeStore} plugin={plugin} />
			</div>
		</div>
	);
};

export default FileTree;
