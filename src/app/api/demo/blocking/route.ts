import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const qwen = createOpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1/",
  apiKey: process.env.DASHSCOPE_API_KEY,
});

console.log(process.env.DASHSCOPE_API_KEY);

async function main() {
  const completion = await generateText({
    model: qwen.chat("qwen-plus"), //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    prompt: "Write a vegetarian lasagna recipe for 4 people.",
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
