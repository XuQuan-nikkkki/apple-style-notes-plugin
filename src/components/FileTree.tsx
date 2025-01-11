import AppleStyleNotesPlugin from "src/main";

type Props = {
	plugin: AppleStyleNotesPlugin;
};
const FileTree = ({ plugin }: Props) => {
	return (
		<div className="asn-plugin-container">
			<div className="asn-folder-pane">folder pane</div>
			<div className="asn-pane-divider" />
      <div className="asn-files-pane">
				files pane
			</div>
		</div>
	);
};

export default FileTree;
