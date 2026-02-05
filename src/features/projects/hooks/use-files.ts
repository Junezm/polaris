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
export const useFiles = (projectId: Id<"projects"> | null) => {
  return useQuery(api.files.getFiles, projectId ? { projectId } : "skip");
};

export const useCreateFile = () => useMutation(api.files.createFiles);
export const useCreateFolder = () => useMutation(api.files.createFolder);
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

export const useRenameFile = () => useMutation(api.files.renameFile);
export const useDeleteFile = () => useMutation(api.files.deleteFile);

export const useFile = (fileId: Id<'files'> | null) => useQuery(api.files.getFile, fileId ? { fileId } : "skip");
export const useFilePath = (fileId: Id<'files'> | null) => useQuery(api.files.getFilePath, fileId ? { fileId } : "skip");

export const useUpdateFile = () => useMutation(api.files.updateFile);