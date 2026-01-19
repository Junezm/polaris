import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export const useProjectById = (projectId: Id<"projects">) => useQuery(api.projects.getById, { id: projectId });


export const useProjects = () => useQuery(api.projects.get);

export const useProjectsPartial = (limit: number) =>
  useQuery(api.projects.getPartial, { limit });

export const useCreateProjects = () => {
  const { userId } = useAuth();

  return useMutation(api.projects.create).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.projects.get);
      if (existing !== undefined) {
        const now = Date.now();
        const newProject = {
          _id: crypto.randomUUID() as Id<"projects">,
          ...args,
          _creationTime: now,
          name: args.name,
          ownerId: "anonymous",
          updatedAt: now,
        };
        localStore.setQuery(api.projects.get, {}, [...existing, newProject]);
      }
    }
  );
};

export const useRenameProject = () => {
  return useMutation(api.projects.rename).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.projects.getById, { id: args.id });
      if (existing !== undefined && existing !== null) {
        localStore.setQuery(
          api.projects.getById,
          { id: args.id },
          { ...existing, name: args.name, updatedAt: Date.now(), });
      }

      const existingProjects = localStore.getQuery(api.projects.get);
      if (existingProjects !== undefined) {
        localStore.setQuery(
          api.projects.get,
          {},
          existingProjects.map((project) => {
            if (project._id === args.id) {
              return {
                ...project,
                name: args.name,
                updatedAt: Date.now(),
              };
            }
            return project;
          })
        )
      }
    }
  );
};
