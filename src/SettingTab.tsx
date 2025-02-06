import { App, PluginSettingTab, Setting } from "obsidian";
import AppleStyleNotesPlugin from "./main";
import { expandFolderByClickingOnElement } from "./settings";
import { saveSettingsToLocalStorage } from "./utils";

export class SettingTab extends PluginSettingTab {
	plugin: AppleStyleNotesPlugin;

	constructor(app: App, plugin: AppleStyleNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async saveSettings() {
		await this.plugin.saveSettings();
		saveSettingsToLocalStorage(this.plugin.settings);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Expand Folder on Click")
			.setDesc(
				"Choose whether to expand a folder by clicking on the toggle icon (▶/▼) or the folder name."
			)
			.addDropdown((cb) => {
				cb.addOption("icon", "Toggle Icon");
				cb.addOption("folder", "Folder Name");
				cb.setValue(this.plugin.settings.expandFolderByClickingOn);
				cb.onChange(async (val: expandFolderByClickingOnElement) => {
					this.plugin.settings.expandFolderByClickingOn = val;
					await this.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Include Subfolder Files Count")
			.setDesc(
				"When enabled, the file count will include files inside subfolders. Otherwise, only direct child files are counted."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.includeSubfolderFilesCount);
				cb.onChange(async (val) => {
					this.plugin.settings.includeSubfolderFilesCount = val;
					await this.saveSettings();
					console.log(this.plugin.settings.includeSubfolderFilesCount)
				});
			});
	}
}
