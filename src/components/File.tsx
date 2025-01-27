import { Menu, TFile } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { FileTreeStore } from "src/store";
import AppleStyleNotesPlugin from "src/main";
import { moveCursorToEnd, selectText } from "src/utils";
import { FolderListModal } from "./FolderListModal";

type Props = {
	useFileTreeStore: UseBoundStore<StoreApi<FileTreeStore>>;
	file: TFile;
	plugin: AppleStyleNotesPlugin;
	deleteFile: () => void;
};
const File = ({ file, useFileTreeStore, plugin, deleteFile }: Props) => {
	const {
		focusedFile,
		readFile,
		selectFile,
		createFile,
		duplicateFile,
		folders,
	} = useFileTreeStore(
		useShallow((store: FileTreeStore) => ({
			focusedFile: store.focusedFile,
			readFile: store.readFile,
			selectFile: store.selectFile,
			createFile: store.createFile,
			duplicateFile: store.duplicateFile,
			folders: store.folders,
		}))
	);

	const fileNameRef = useRef<HTMLDivElement>(null);
	const [contentPreview, setContentPreview] = useState<string>("");
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(file.basename);

	const loadContent = async () => {
		const content = await readFile(file);
		const cleanContent = content
			.replace(/^---\n[\s\S]*?\n---\n/, "")
			.trim();
		setContentPreview(cleanContent);
	};

	const onSaveNewName = async () => {
		try {
			const newPath = file.path.replace(file.basename, name);
			await plugin.app.vault.rename(file, newPath);
			setIsEditing(false);
		} catch (error) {
			console.error("保存失败：", error);
			alert("内容保存失败，请重试！");
		}
	};

	const onClickOutside = (event: MouseEvent) => {
		if (
			fileNameRef?.current &&
			!fileNameRef.current.contains(event.target)
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
			fileNameRef?.current?.blur();
		} else if (event.key === "Escape") {
			event.preventDefault();
			setIsEditing(false);
			setName(file.basename);
			fileNameRef.current?.blur();
		}
	};

	useEffect(() => {
		loadContent();
	}, []);

	useEffect(() => {
		document.addEventListener("mousedown", onClickOutside);
		return () => {
			document.removeEventListener("mousedown", onClickOutside);
		};
	}, [isEditing, name]);

	const selectFileNameText = () => {
		const element = fileNameRef.current;
		if (element) {
			selectText(element);
		}
	};

	const onMoveCursorToEnd = () => {
		const element = fileNameRef.current;
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
			item.setTitle("Open in new tab");
			item.onClick(() => {
				selectFile(file);
			});
		});
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("New note");
			item.onClick(() => {
				const folder = file.parent || plugin.app.vault.getRoot();
				createFile(folder);
			});
		});
		menu.addItem((item) => {
			item.setTitle("Duplicate");
			item.onClick(() => {
				duplicateFile(file);
			});
		});
		menu.addItem((item) => {
			item.setTitle("Move file to...");
			item.onClick(() => {
				const modal = new FolderListModal(plugin, folders, file);
				modal.open();
			});
		});
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("Rename");
			item.onClick(() => {
				setIsEditing(true);
				setName(file.basename);
				setTimeout(() => {
					selectFileNameText();
				}, 100);
			});
		});
		menu.addItem((item) => {
			item.setTitle("Delete");
			item.onClick(async () => {
				deleteFile();
				await plugin.app.vault.delete(file, true);
			});
		});
		plugin.app.workspace.trigger("file-context-menu", menu);
		menu.showAtPosition({ x: e.clientX, y: e.clientY });
	};

	const isFocused = focusedFile?.path === file.path;
	const className = "asn-file" + (isFocused ? " asn-focused-file" : "");
	const fileNameClassName =
		"asn-file-name" + (isEditing ? " asn-file-name-edit-mode" : "");
	return (
		<div
			className={className}
			onClick={() => selectFile(file)}
			onContextMenu={onShowContextMenu}
		>
			<div
				className={fileNameClassName}
				ref={fileNameRef}
				contentEditable={isEditing}
				onKeyDown={onKeyDown}
				onInput={onInputNewName}
			>
				{name}
			</div>
			<div className="asn-file-details">
				<span className="asn-file-created-time">
					{new Date(file.stat.ctime).toLocaleString().split(" ")[0]}
				</span>
				<span className="asn-file-content-preview">
					{contentPreview}
				</span>
			</div>
		</div>
	);
};

export default File;
