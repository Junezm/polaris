import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { getItemPadding } from "./constants";
import { Id, Doc } from "../../../../../convex/_generated/dataModel";
import { useCreateFile, useCreateFolder, useDeleteFile, useFolderContents, useRenameFile } from "../../hooks/use-files";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { useEditor } from "@/features/editor/hooks/use-editor";


export const Tree = ({
  item,
  level,
  projectId,
}: {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === 'folder' && isOpen,
  })
  const handleRename = (newName: string) => {
    setIsRename(false);
    if (newName === item.name) {
      return;
    }
    renameFile({
      fileId: item._id,
      name: newName,
    })
  }

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  }

  const handleCreate = (name: string) => {
    if (creating === 'file') {
      createFile({
        projectId,
        parentId: item._id,
        name,
        content: '',
      });
    } else if (creating === 'folder') {
      createFolder({
        projectId,
        parentId: item._id,
        name,
      });
    }
    setCreating(null);
  };

  const { openFile, closeTab, activeTabId } = useEditor(projectId);

  if (item.type === "file") {
    const fileName = item.name;
    const isActive = activeTabId === item._id;
    if (isRename) {
      return (
        <RenameInput
          type="file"
          defaultValue={fileName}
          isOpen={isRename}
          level={level!}
          onSubmit={handleRename}
          onCancel={() => setIsRename(false)}
        />
      )
    }
    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={isActive}
        onClick={() => openFile(item._id, { pinned: false })}
        onDoubleClick={() => openFile(item._id, { pinned: true })}
        onRename={() => setIsRename(true)}
        onDelete={() => {
          closeTab(item._id);
          deleteFile({ fileId: item._id });
        }}
        onCreateFile={() => { }}
        onCreateFolder={() => { }}
      >
        <FileIcon fileName={fileName} className="size-4" autoAssign />
        <span className="truncate text-sm">{fileName}</span>
      </TreeItemWrapper>
    );
  }

  const folderName = item.name;
  const folderContentRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon className={cn(
          "size-4 shrink-0 text-muted-foreground",
          isOpen && "rotate-90"
        )} />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="truncate text-sm">{folderName}</span>
    </>
  )
  if (creating) {
    return (
      <>
        <button
          onClick={() => setIsOpen(value => !value)}
          className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
          style={{
            paddingLeft: getItemPadding(level!, false),
          }}
        >
          {folderContentRender}
        </button>
        {
          isOpen && (
            <>
              {folderContents === undefined && <LoadingRow level={level! + 1} />}
              <CreateInput
                type={creating}
                level={level! + 1}
                onSubmit={handleCreate}
                onCancel={() => setCreating(null)}
              />
              {folderContents?.map((subFile) => (
                <Tree
                  key={`${subFile._id}`}
                  item={subFile}
                  level={level! + 1}
                  projectId={projectId}
                ></Tree>
              ))}
            </>
          )
        }
      </>
    )
  }

  if (isRename) {
    return (
      <>
        <RenameInput
          type="folder"
          defaultValue={folderName}
          isOpen={isOpen}
          level={level!}
          onSubmit={handleRename}
          onCancel={() => setIsRename(false)}
        />
        {
          isOpen && (
            <>
              {folderContents === undefined && <LoadingRow level={level! + 1} />}
              {folderContents?.map((subFile) => (
                <Tree
                  key={`${subFile._id}`}
                  item={subFile}
                  level={level! + 1}
                  projectId={projectId}
                ></Tree>
              ))}
            </>
          )
        }
      </>
    )
  }
  return (
    <>
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={false}
        onClick={() => setIsOpen(value => !value)}
        onRename={() => setIsRename(true)}
        onDelete={() => {
          // todo: close tab
          deleteFile({ fileId: item._id });
        }}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderContentRender}
      </TreeItemWrapper>
      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level! + 1} />}
          {folderContents?.map((subFile) => (
            <Tree
              key={`${subFile._id}`}
              item={subFile}
              level={level! + 1}
              projectId={projectId}
            ></Tree>
          ))}
        </>
      )}
    </>
  );
};