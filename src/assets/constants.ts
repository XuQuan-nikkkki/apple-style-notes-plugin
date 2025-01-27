import { TAbstractFile } from "obsidian";

export const ASN_FOCUSED_FOLDER_PATH_KEY =
	"AppleStyleNotesPlugin-FocusedFolderPath";
export const ASN_EXPANDED_FOLDER_PATHS_KEY =
	"AppleStyleNotesPlugin-ExpandedFolderPaths";
export const ASN_FOCUSED_FILE_PATH_KEY =
	"AppleStyleNotesPlugin-FocusedFilePath";
export const ASN_FOLDER_SORT_RULE_KEY = "AppleStyleNotesPlugin-FolderSortRule";
export const ASN_FILE_SORT_RULE_KEY = "AppleStyleNotesPlugin-FileSortRule";

export const ASN_FOLDER_PANE_WIDTH_KEY =
	"AppleStyleNotesPlugin-FolderPaneWidth";

export const VaultChangeEventName = "ASN-VaultChangeEvent";
export type VaultChangeType = "create" | "modify" | "delete" | "rename";
export type VaultChangeEvent = CustomEvent<{
	file: TAbstractFile;
	changeType: VaultChangeType;
}>;
