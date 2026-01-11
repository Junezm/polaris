import { generateText } from "ai";
import { google } from '@ai-sdk/google';

export async function POST() {
  const response = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "Hello, how are you?",
  });

  return Response.json({ response });
}