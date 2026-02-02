import { createAgent, anthropic, createNetwork, openai } from '@inngest/agent-kit';

import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";

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
    console.log("----event----", event);
    const {
      messageId,
      conversationId,
      projectId,
      message,
    } = event.data as MessageEvent;

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    console.log("----internalKey----", internalKey, conversationId);

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
    // let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;
    // const contextMessages = recentMessage.filter((msg) =>
    //   msg._id !== messageId && msg.content.trim() !== ""
    // );

    // if (contextMessages.length > 0) {
    //   const historyText = contextMessages
    //     .map(msg => `${msg.role.toUpperCase()}:${msg.content}`)
    //     .join("\n\n");

    //   systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
    // }

    // Generate conversation title if it's still the default
    // const shouldGenerateTitle =
    //   conversation.title === DEFAULT_CONVERSATION_TITLE;

    // if (shouldGenerateTitle) {

    //   // 1. 定义 Qwen 模型实例
    //   const qwenModel = openai({
    //     model: "qwen-flash", // 或者是 qwen-plus, qwen-turbo
    //     apiKey: process.env.DASHSCOPE_API_KEY,
    //     baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    //     defaultParameters: { temperature: 0, max_completion_tokens: 50 },
    //   });
    //   const titleAgent = createAgent({
    //     name: "title-generator",
    //     system: TITLE_GENERATOR_SYSTEM_PROMPT,
    //     model: qwenModel,
    //   });

    //   const { output } = await titleAgent.run(message, { step });
    //   const textMessage = output.find(
    //     (m) => m.type === "text" && m.role === "assistant"
    //   );

    //   console.log('----output----', output);

    //   if (textMessage?.type === "text") {
    //     const title =
    //       typeof textMessage.content === "string"
    //         ? textMessage.content.trim()
    //         : textMessage.content
    //           .map((c) => c.text)
    //           .join("")
    //           .trim();

    //     console.log('----title----', title);

    //     if (title) {
    //       await step.run("update-conversation-title", async () => {
    //         await convex.mutation(api.system.updateConversationTitle, {
    //           internalKey,
    //           conversationId,
    //           title,
    //         });
    //       });
    //     }
    //   }
    // }

    await step.run("update-assistant-message", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: "AI processed this message (TODO)"
      })
    });
  }
);
