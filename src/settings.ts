export type expandFolderByClickingOnElement = "icon" | "folder";

export interface AppleStyleNotesPluginSettings {
	expandFolderByClickingOn: expandFolderByClickingOnElement;
}

export const DEFAULT_SETTINGS: AppleStyleNotesPluginSettings = {
	expandFolderByClickingOn: "icon",
};
