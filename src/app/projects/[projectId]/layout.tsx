import { ProjectIdLayout } from "@/features/projects/components/project-id-layout";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>
}) {

  const safeParseOpenAIJson = (str: string) => {
    const trimmed = str.replace(/^["']|["']$/g, "");
    console.log(trimmed);
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      try {
        const withQuotes = trimmed.replace(/`([\s\S]*?)`/g, (_, content) => JSON.stringify(content));
        console.log(withQuotes);
        return JSON.parse(withQuotes);
      } catch (e2) {
        throw new Error(`Failed to parse JSON with backticks:${e2}`);
      }
    }
  };
  try {
    const argument = "{\"parentId\":\"jd78qefy04cfc8qegmas0d4grh80ejxj\",\"files\":[{\"name\":\"index.html\",\"content\":\"<!DOCTYPE html>\\n<html lang=\\\"en\\\">\\n  <head>\\n    <meta charset=\\\"UTF-8\\\" />\\n    <link rel=\\\"icon\\\" href=\\\"%PUBLIC_URL%/favicon.ico\\\" />\\n    <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\" />\\n    <title>Vite App</title>\\n  </head>\\n  <body>\\n    <div id=\\\"app\\\"></div>\\n    <script type=\\\"module\\\" src=\\\"/src/main.ts\\\"></script>\\n  </body>\\n</html>\"}]";
    safeParseOpenAIJson(argument);
  } catch (e) {
    console.log(e);
  }
  const { projectId } = await params;
  return <ProjectIdLayout
    projectId={projectId as Id<"projects">}
  >
    {children}
  </ProjectIdLayout>;
}