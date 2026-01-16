import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useProjects } from "../hooks/use-projects";
import { Doc } from "../../../../convex/_generated/dataModel";
import { FaGithub } from "react-icons/fa";
import { AlertCircleIcon, GlobeIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ProjectsCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getProjectIcon = (data: Doc<"projects">) => {
  if (data.importStatus === "completed") {
    return <FaGithub className="size-4 text-muted-foreground" />;
  } else if (data.importStatus === "failed") {
    return <AlertCircleIcon className="size-4 text-muted-foreground" />;
  } else if (data.importStatus === "importing") {
    return <Spinner className="size-4 text-muted-foreground animate-spin" />;
  } else {
    return <GlobeIcon className="size-4 text-muted-foreground" />;
  }
};

export const ProjectsCommandDialog = ({
  open,
  onOpenChange,
}: ProjectsCommandDialogProps) => {
  const router = useRouter();
  const projects = useProjects();

  const handleSelect = (projectId: string) => {
    console.log("handleSelect", projectId);
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search and navigate to your projects"
    >
      <CommandInput placeholder="Search projects..." />
      <CommandList>
        <CommandEmpty>No projects found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
            >
              <div
                className="flex justify-start gap-2 w-full cursor-pointer"
                onClick={() => handleSelect(project._id)}
              >
                {getProjectIcon(project)}
                <span>{project.name}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
