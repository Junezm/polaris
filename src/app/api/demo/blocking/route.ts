import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const openai = new OpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "qwen-plus", //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "今天成都天气怎么样？" },
    ],
  });
  console.log(JSON.stringify(completion));
  return completion;
}

export async function POST() {

  // const response = await generateText({
  //   model: google("gemini-2.5-flash"),
  //   prompt: "Hello, how are you?",
  //   experimental_telemetry: {
  //     isEnabled: true,
  //     recordInputs: true,
  //     recordOutputs: true,
  //   },
  // })

  const response = await main();

  return Response.json({ response });
}
