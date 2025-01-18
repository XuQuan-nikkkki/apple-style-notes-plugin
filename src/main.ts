import { Plugin } from "obsidian";

import { FileTreeView } from "./FileTreeView";
import { SettingTab } from "./SettingTab";
import { AppleStyleNotesPluginSettings, DEFAULT_SETTINGS } from "./settings";

export default class AppleStyleNotesPlugin extends Plugin {
	settings: AppleStyleNotesPluginSettings;

	VIEW_TYPE = "asn-plugin-file-tree-view";
	VIEW_DISPLAY_TEXT = "Apple Style Notes Plugin File Tree";
	ICON = "dock";

	async onload() {
		console.log("Apple Styled Notes Plugin onload");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerView(
			this.VIEW_TYPE,
			(leaf) => new FileTreeView(leaf, this)
		);

		await this.loadSettings();

		this.addCommand({
			id: "open-file-tree-view",
			name: "Open File Tree View",
			callback: async () => await this.openFileTreeLeaf(true),
		});

		this.app.workspace.onLayoutReady(async () => {
			await this.openFileTreeLeaf(true);
		});

		this.app.vault.on("create", (file) => {
			this.refreshTreeLeafs(true);
		});

		this.app.vault.on("modify", (file) => {
			this.refreshTreeLeafs(false);
		});

		this.app.vault.on("delete", (file) => {
			this.refreshTreeLeafs(false);
		});

		this.app.vault.on("rename", (file) => {
			this.refreshTreeLeafs(false);
		});
	}

	onunload() {}

	openFileTreeLeaf = async (showAfterAttach: boolean) => {
		const leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
		if (leafs.length == 0) {
			const leaf = this.app.workspace.getLeftLeaf(false);
			if (!leaf) return;
			await leaf.setViewState({ type: this.VIEW_TYPE });
			if (showAfterAttach) this.app.workspace.revealLeaf(leaf);
		} else {
			if (showAfterAttach) {
				leafs.forEach((leaf) => this.app.workspace.revealLeaf(leaf));
			}
		}
	};

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	detachFileTreeLeafs = () => {
		const leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
		for (const leaf of leafs) {
			(leaf.view as FileTreeView).destroy();
			leaf.detach();
		}
	};

	refreshTreeLeafs = (showAfterAttach: boolean) => {
		this.detachFileTreeLeafs();
		this.openFileTreeLeaf(showAfterAttach);
	};
}
