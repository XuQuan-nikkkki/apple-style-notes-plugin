import { Notice, SuggestModal, TFile, TFolder } from "obsidian";
import AppleStyleNotesPlugin from "src/main";

export class FolderListModal extends SuggestModal<TFolder> {
	folders: TFolder[];
	file: TFile;

	constructor(
		plugin: AppleStyleNotesPlugin,
		folders: TFolder[],
		file: TFile
	) {
		super(plugin.app);
		this.folders = folders;
		this.file = file;
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
		const newPath = folder.path + "/" + this.file.name;
		this.app.fileManager.renameFile(this.file, newPath);
	}
}
