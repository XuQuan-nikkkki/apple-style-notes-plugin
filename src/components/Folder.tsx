import { Menu, TFolder } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { ArrowDownIcon, ArrowRightIcon, FolderIcon } from "src/assets/icons";
import AppleStyleNotesPlugin from "src/main";
import { FileTreeStore } from "src/store";
import { moveCursorToEnd, selectText } from "src/utils";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	plugin: AppleStyleNotesPlugin;
	folder: TFolder;
	isRoot?: boolean;
};
const Folder = ({
	folder,
	useFileTreeStore,
	plugin,
	isRoot = false,
}: Props) => {
	const {
		getFilesCountInFolder,
		hasFolderChildren,
		focusedFolder,
		setFocusedFolder,
		expandedFolderPaths,
		changeExpandedFolderPaths,
		createNewFolder,
		createFile,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			getFilesCountInFolder: store.getFilesCountInFolder,
			hasFolderChildren: store.hasFolderChildren,
			focusedFolder: store.focusedFolder,
			setFocusedFolder: store.setFocusedFolderAndSaveInLocalStorage,
			expandedFolderPaths: store.expandedFolderPaths,
			changeExpandedFolderPaths: store.changeExpandedFolderPaths,
			createNewFolder: store.createNewFolder,
			createFile: store.createFile,
		}))
	);

	const folderName = isRoot ? plugin.app.vault.getName() : folder.name;
	const folderNameRef = useRef<HTMLDivElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(folderName);

	const isFolderExpanded = expandedFolderPaths.includes(folder.path);

	const onToggleExpandState = (): void => {
		if (isRoot) return;
		if (hasFolderChildren(folder)) {
			const folderPaths = isFolderExpanded
				? expandedFolderPaths.filter((path) => path !== folder.path)
				: [...expandedFolderPaths, folder.path];
			changeExpandedFolderPaths(folderPaths);
		}
	};

	const onSaveNewName = async () => {
		try {
			const newPath = folder.path.replace(folder.name, name);
			await plugin.app.vault.rename(folder, newPath);
			setIsEditing(false);
		} catch (error) {
			console.error("保存失败：", error);
			alert("内容保存失败，请重试！");
		}
	};

	const onClickOutside = (event: MouseEvent) => {
		if (
			folderNameRef?.current &&
			!folderNameRef.current.contains(event.target)
		) {
			if (isEditing) {
				onSaveNewName();
			}
		}
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === "Enter") {
			event.preventDefault();
			onSaveNewName();
			folderNameRef?.current?.blur();
		} else if (event.key === "Escape") {
			event.preventDefault();
			setIsEditing(false);
			setName(folderName);
			folderNameRef.current?.blur();
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", onClickOutside);
		return () => {
			document.removeEventListener("mousedown", onClickOutside);
		};
	}, [isEditing, name]);

	const selectFolderNameText = () => {
		const element = folderNameRef.current;
		if (element) {
			selectText(element);
		}
	};

	const onMoveCursorToEnd = () => {
		const element = folderNameRef.current;
		if (element) {
			moveCursorToEnd(element);
		}
	};

	const onInputNewName = (e: React.FormEvent<HTMLDivElement>) => {
		const target = e.target as HTMLDivElement;
		setName(target.textContent || "");
		onMoveCursorToEnd();
	};

	const onShowContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const menu = new Menu();
		menu.addItem((item) => {
			item.setTitle("New note");
			item.onClick(() => {
				createFile(folder);
			});
		});
		menu.addItem((item) => {
			item.setTitle("New folder");
			item.onClick(() => {
				createNewFolder(folder);
				if (!isFolderExpanded) {
					onToggleExpandState();
				}
			});
		});
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("Rename folder");
			item.onClick(() => {
				setIsEditing(true);
				setName(folderName);
				setTimeout(() => {
					selectFolderNameText();
				}, 50);
			});
		});
		menu.addItem((item) => {
			item.setTitle("Delete");
			item.onClick(() => {
				plugin.app.vault.delete(folder, true);
			});
		});
		plugin.app.workspace.trigger("folder-context-menu", menu);
		menu.showAtPosition({ x: e.clientX, y: e.clientY });
	};

	const filesCount = getFilesCountInFolder(folder);
	const isFocused = folder.path == focusedFolder?.path;
	const isExpanded = isRoot || expandedFolderPaths.includes(folder.path);

	const folderClassNames = ["asn-folder"];
	if (isFocused) {
		folderClassNames.push("asn-focused-folder");
	}
	if (isRoot) {
		folderClassNames.push("asn-root-folder");
	}

	const folderNameClassName =
		"asn-folder-name" + (isEditing ? " asn-folder-name-edit-mode" : "");
	return (
		<div
			className={folderClassNames.join(" ")}
			onClick={() => setFocusedFolder(folder)}
			onContextMenu={onShowContextMenu}
		>
			<div className="asn-folder-pane-left-sectionn">
				<span
					className="asn-folder-arrow-icon-wrapper"
					onClick={(e) => {
						e.stopPropagation();
						onToggleExpandState();
					}}
				>
					{hasFolderChildren(folder) &&
						!isRoot &&
						(isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
				</span>
				<FolderIcon />
				<div
					ref={folderNameRef}
					className={folderNameClassName}
					contentEditable={isEditing}
					onKeyDown={onKeyDown}
					onInput={onInputNewName}
				>
					{name}
				</div>
			</div>
			<span className="asn-files-count">{filesCount}</span>
		</div>
	);
};

export default Folder;
