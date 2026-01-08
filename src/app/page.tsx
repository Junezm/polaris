"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);
  console.log(projects);
  return <div className="text-red-400">
    <Button onClick={() => createProject({ name: "test", ownerId: "1" })}>createProject</Button>
    {projects?.map((project) => (
      <div key={project._id}>{project.name}--{`${project.ownerId}`}</div>
    ))}
  </div>;
}