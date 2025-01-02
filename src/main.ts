import { Plugin } from "obsidian";

import { FileTreeView } from './FileTreeView'
import { SettingTab } from "./SettingTab";
import { AppleStyleNotesPluginSettings, DEFAULT_SETTINGS } from "./settings";

export default class AppleStyleNotesPlugin extends Plugin {
	settings: AppleStyleNotesPluginSettings;

	VIEW_TYPE = 'file-tree-view';
	VIEW_DISPLAY_TEXT = 'File Tree';

	async onload() {
		console.log("Apple Styled Notes Plugin onload");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
		
		this.registerView(this.VIEW_TYPE, (leaf) => 
			new FileTreeView(leaf, this)
		);
		
		await this.loadSettings();

		this.addCommand({
				id: 'open-file-tree-view',
				name: 'Open File Tree View',
				callback: async () => await this.openFileTreeLeaf(true),
		});

	}

	onunload() {

	}

	openFileTreeLeaf = async (showAfterAttach: boolean) => {
		const leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
		if (leafs.length == 0) {
				// Needs to be mounted
				const leaf = this.app.workspace.getLeftLeaf(false);
				await leaf?.setViewState({ type: this.VIEW_TYPE });
				if (showAfterAttach) this.app.workspace.revealLeaf(leaf);
		} else {
				// Already mounted - show if only selected showAfterAttach
				if (showAfterAttach) {
						leafs.forEach((leaf) => this.app.workspace.revealLeaf(leaf));
				}
		}
	};

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
