import { Id } from "../../../../convex/_generated/dataModel";
import { FileIcon } from "@react-symbols/icons/utils";
import { useFilePath } from "@/features/projects/hooks/use-files";
import { useEditor } from "../hooks/use-editor";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";


export const FileBreadcrumbs = ({
  projectId,
  fileId,
}: {
  projectId: Id<'projects'>;
  fileId: Id<'files'>;
}) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  if (filePath === undefined || !activeTabId) {
    return (
      <div className="p-2 bg-background pl-4 border-b">
        <Breadcrumb>
          <BreadcrumbList className="sm:gap-0.5 gap-0.5">
            <BreadcrumbItem className="text-sm">
              <BreadcrumbPage>&nbsp;</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }
  return (
    <div className="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList className="sm:gap-0.5 gap-0.5">
          <BreadcrumbItem className="text-sm">
            <BreadcrumbPage>&nbsp;</BreadcrumbPage>
          </BreadcrumbItem>
          {filePath.map((path, index) => {
            const isLast = index === filePath.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem key={index} className="text-sm">
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <FileIcon fileName={path.name} autoAssign className="size-4" />
                      {path.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#">
                      {path.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};