import { generateText } from "@/lib/ai-provider";
import { inngest } from "./client";
// import { google } from "@ai-sdk/google";
// import { openai } from "@ai-sdk/openai";
import { firecrawl } from "@/lib/firecrawl";

const URL_REGEX = /https?:\/\/[^\s]+/gi;
// "What is 'middleware.js' in Next.js? Here are the docs: https://nextjs.org/docs/app/getting-started/proxy ".match(
//   URL_REGEX
// );
export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    console.log(event);
    const { prompt } = event.data as { prompt: string };
    console.log(prompt);
    console.log(prompt.match(URL_REGEX));
    const urls = (await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) || [];
    })) as string[];
    const scraptedContent = await step.run("scrape-url", async () => {
      const rets = await Promise.all(
        urls.map(async (url) => {
          const res = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });
          return res.markdown ?? null;
        })
      );

      return rets.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scraptedContent
      ? `content:\n${scraptedContent}\n\n Question: ${prompt}`
      : prompt;
    await step.sleep("wait-a-moment", "1s");
    await step.run("generate-text", async () => {
      return await generateText(finalPrompt as string);
    });
  }
);
