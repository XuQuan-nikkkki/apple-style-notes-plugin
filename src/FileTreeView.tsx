import { Root, createRoot } from "react-dom/client";
import { ItemView, WorkspaceLeaf } from "obsidian";

import AppleStyleNotesPlugin from "./main";

export class FileTreeView extends ItemView {
	root: Root;
	plugin: AppleStyleNotesPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: AppleStyleNotesPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return this.plugin.VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.plugin.VIEW_DISPLAY_TEXT;
	}

	destroy() {
		this.root?.unmount();
	}

	async onOpen(): Promise<void> {
		this.destroy();
		this.constructFileTree(this.app.vault.getRoot().path, "");
	}

	constructFileTree(folderPath: string, vaultChange: string) {
		this.destroy();
		this.root = createRoot(this.contentEl);
		this.root.render(<div className="file-tree-plugin-view">File tree view</div>);
	}
}
