import { createAgent, anthropic, createNetwork, openai } from '@inngest/agent-kit';

import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import {createListFilesTool} from "@/features/conversations/inngest/tools/list-files";
import {createReadFilesTool} from "@/features/conversations/inngest/tools/read-files";
import {createUpdateFileTool} from "@/features/conversations/inngest/tools/update-file";
import {createCreateFilesTool} from "@/features/conversations/inngest/tools/create-files";
import {createCreateFolderTool} from "@/features/conversations/inngest/tools/create-folder";
import {createRenameFileTool} from "@/features/conversations/inngest/tools/rename-file";
import {createDeleteFilesTool} from "@/features/conversations/inngest/tools/delete-files";
import {createScrapeUrlsTool} from "@/features/conversations/inngest/tools/scrape-urls";

interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

      // Update the message with error content
      if (internalKey) {
        await step.run("update-message-on-failure", async () => {
          await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content:
              "My apologies, I encountered an error while processing your request. Let me know if you need anything else!",
          });
        });
      }
    }
  },
  {
    event: "message/sent",
  },
  async ({ event, step }) => {
    const {
      messageId,
      conversationId,
      projectId,
      message,
    } = event.data as MessageEvent;

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError("POLARIS_CONVEX_INTERNAL_KEY is not configured");
    }

    await step.sleep("wait-for-db-sync", "5s");

    // get conversation
    const conversation = await step.run("get-conversation", async () => {
      return await convex.query(api.system.getConversationById, {
        internalKey,
        conversationId,
      });
    });

    if (!conversation) {
      throw new NonRetriableError("Conversation not found");
    }
    // get messages
    const recentMessage = await step.run("get-recent-message", async () => {
      return await convex.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      });
    });

    // build prompt
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;
    const contextMessages = recentMessage.filter((msg) =>
      msg._id !== messageId && msg.content.trim() !== ""
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map(msg => `${msg.role.toUpperCase()}:${msg.content}`)
        .join("\n\n");

      systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
    }

    // Generate conversation title if it's still the default
    const shouldGenerateTitle =
      conversation.title === DEFAULT_CONVERSATION_TITLE;
    // 1. 定义 Qwen 模型实例
    const qwenModel = openai({
      model: "qwen-plus", // 或者是 qwen-plus, qwen-turbo
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultParameters: { temperature: 0, max_completion_tokens: 50 },
    });
    // 生成title
    if (shouldGenerateTitle) {
      const titleAgent = createAgent({
        name: "title-generator",
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model: qwenModel,
      });

      const { output } = await titleAgent.run(message, { step });
      const textMessage = output.find(
        (m) => m.type === "text" && m.role === "assistant"
      );

      if (textMessage?.type === "text") {
        const title =
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
              .map((c) => c.text)
              .join("")
              .trim();

        if (title) {
          await step.run("update-conversation-title", async () => {
            await convex.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            });
          });
        }
      }
    }

    const codingAgent = createAgent({
      name: "polaris",
      description: "An expert AI coding assistant",
      system: systemPrompt,
      model: qwenModel,
      tools: [
        createListFilesTool({ internalKey, projectId }),
        createReadFilesTool({ internalKey }),
        createUpdateFileTool({ internalKey }),
        createCreateFilesTool({ projectId, internalKey }),
        createCreateFolderTool({ projectId, internalKey }),
        createRenameFileTool({ internalKey }),
        createDeleteFilesTool({ internalKey }),
        createScrapeUrlsTool(),
      ]
    });

    const network = createNetwork({
      name: "polaris-network",
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1);
        const hasTextResponse = lastResult?.output.some(
          m => m.type === "text" && m.role === "assistant"
        );
        const hasToolCalls = lastResult?.output.some(
          m => m.type === "tool_call"
        );
        if (hasTextResponse && !hasToolCalls) {
          return undefined;
        }
        return codingAgent;
      }
    })
    // run agent
    const result = await network.run(message);

    const lastResult = result.state.results.at(-1);
    const textMessage = lastResult?.output.find(
      m => m.type === "text" && m.role === "assistant"
    );

    let assistantResponse = "I processed your request. Let me know if you need anything else!";

    if (textMessage?.type === "text") {
      assistantResponse =
        typeof textMessage.content === "string"
          ? textMessage.content
          : textMessage.content.map((m) => m.text).join("");
    }

    await step.run("update-assistant-message", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: assistantResponse
      })
    });

    return { success: true, messageId, conversationId };
  }
);
