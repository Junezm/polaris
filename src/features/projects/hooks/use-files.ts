import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { boolean } from "zod/v4";

// export const useCreateFile = ({
//   projectId,
//   parentId,
//   name,
//   content,
// }: {
//   projectId: Id<"projects">;
//   parentId: Id<"files"> | undefined;
//   name: string;
//   content: string;
// }) => {
//   const mutation = useMutation(api.files.createFiles);
//   return mutation({
//     projectId,
//     parentId,
//     name,
//     content,
//   });
// }

// export const useCreateFolder = ({
//   projectId,
//   parentId,
// }: {
//   projectId: Id<"projects">;
//   parentId: Id<"files"> | undefined;
// }) => {
//   const mutation = useMutation(api.files.createFolder);
//   return mutation({
//     projectId,
//     parentId,
//     name: 'New Folder',
//   });
// }
// Sort: folders first, then files, alphabetically within each group
const sortFiles = <T extends { type: "file" | "folder"; name: string }>(
  files: T[]
): T[] => {
  return [...files].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
};

export const useFiles = (projectId: Id<"projects"> | null) => {
  return useQuery(api.files.getFiles, projectId ? { projectId } : "skip");
};

export const useCreateFile = () => {
  return useMutation(api.files.createFiles).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- optimistic update callback runs on mutation, not render
        const now = Date.now();
        const newFile = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          content: args.content,
          type: "file" as const,
          updatedAt: now,
        };

        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFile])
        );
      }
    }
  );
};
export const useCreateFolder = () => {
  return useMutation(api.files.createFolder).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- optimistic update callback runs on mutation, not render
        const now = Date.now();
        const newFolder = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          type: "folder" as const,
          updatedAt: now,
        };

        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFolder])
        );
      }
    }
  );
};
export const useFolderContents = ({
  projectId,
  parentId,
  enabled,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
  enabled?: boolean;
}) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip"
  )
}

export const useRenameFile = ({
                                projectId,
                                parentId,
                              }: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
}) => {
  return useMutation(api.files.renameFile).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });

      if (existingFiles !== undefined) {
        const updatedFiles = existingFiles.map((file) =>
          file._id === args.fileId ? { ...file, name: args.name } : file
        );

        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          sortFiles(updatedFiles)
        );
      }
    }
  )
};

export const useDeleteFile = ({
                              projectId,
                              parentId,
                            }: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
}) => {
  return useMutation(api.files.deleteFile).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });

      if (existingFiles !== undefined) {
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          existingFiles.filter((file) => file._id !== args.fileId)
        );
      }
    }
  );
};
export const useFile = (fileId: Id<'files'> | null) => useQuery(api.files.getFile, fileId ? { fileId } : "skip");
export const useFilePath = (fileId: Id<'files'> | null) => useQuery(api.files.getFilePath, fileId ? { fileId } : "skip");

export const useUpdateFile = () => useMutation(api.files.updateFile);