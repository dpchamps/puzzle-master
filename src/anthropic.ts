import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const createResponseStream = async (
  systemPrompt: string,
  prompt: string,
) => {
  return anthropic.messages.create({
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
    model: "claude-3-opus-20240229",
    stream: true,
  });
};
