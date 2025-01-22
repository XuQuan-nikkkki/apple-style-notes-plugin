import { SuggestModal, TAbstractFile, TFile, TFolder } from "obsidian";
import AppleStyleNotesPlugin from "src/main";

export class FolderListModal extends SuggestModal<TFolder> {
	folders: TFolder[];
	item: TAbstractFile;

	constructor(
		plugin: AppleStyleNotesPlugin,
		folders: TFolder[],
		item: TAbstractFile
	) {
		super(plugin.app);
		this.folders = folders;
		this.item = item;
		this.setPlaceholder("Type a folder");
		this.setInstructions([
			{ command: "↑↓", purpose: "to navigate" },
			{ command: "↵", purpose: "to move" },
			{ command: "esc", purpose: "to dismiss" },
		]);
	}

	getSuggestions(query: string): TFolder[] {
		return this.folders.filter((folder) =>
			folder.path.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement) {
		el.createEl("div", { text: folder.path });
	}

	onChooseSuggestion(folder: TFolder, evt: MouseEvent | KeyboardEvent) {
		const newPath = folder.path + "/" + this.item.name;
		this.app.fileManager.renameFile(this.item, newPath);
	}
}
