export type expandFolderByClickingOnElement = "icon" | "folder";

export interface AppleStyleNotesPluginSettings {
	expandFolderByClickingOn: expandFolderByClickingOnElement;
	includeSubfolderFilesCount: boolean;
}

export const DEFAULT_SETTINGS: AppleStyleNotesPluginSettings = {
	expandFolderByClickingOn: "icon",
	includeSubfolderFilesCount: false,
};
