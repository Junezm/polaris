import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useProjectById } from "../../hooks/use-projects";
import { Button } from "@/components/ui/button";
import { useCreateFile, useCreateFolder, useFolderContents } from "../../hooks/use-files";
import { CreateInput } from "./create-input";
import { LoadingRow } from "./loading-row";
import { Tree } from "./tree";

export const FileExplorer = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const project = useProjectById(projectId);

  const rootFiles = useFolderContents({
    projectId,
    enabled: isOpen,
  })
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const handleCreate = (name: string) => {
    if (creating === 'file') {
      createFile({
        projectId,
        parentId: undefined,
        name,
        content: '',
      });
    } else if (creating === 'folder') {
      createFolder({
        projectId,
        parentId: undefined,
        name,
      });
    }
    setCreating(null);
  };

  return (
    <div className="h-full bg-sidebar">
      <ScrollArea>
        <div role="button" onClick={() => setIsOpen(!isOpen)} className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold">
          <ChevronRightIcon className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")} />
          <p className="text-xs uppercase line-clamp-1">
            {project?.name}
          </p>
          <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
            <Button
              variant="highlight"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating('file');
              }}
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>
            <Button
              variant="highlight"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating('folder');
              }}
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>
            <Button
              variant="highlight"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Reset collapse
                setCollapseKey((prev) => prev + 1);
                setIsOpen(false);
              }}
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        {isOpen && (
          <>
            {rootFiles === undefined && <LoadingRow level={0} />}
            {creating && (
              <CreateInput type={creating} level={0} onSubmit={handleCreate} onCancel={() => setCreating(null)}></CreateInput>
            )}
            {rootFiles?.map((file) => (
              <Tree
                key={`${file._id}-${collapseKey}`}
                item={file}
                level={0}
                projectId={projectId}
              ></Tree>
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
}