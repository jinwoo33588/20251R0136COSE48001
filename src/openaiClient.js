// src/utils/openaiClient.js
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

console.log("API KEY:", import.meta.env.VITE_OPENAI_API_KEY);

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

const TextCalcSchema = z.object({
  text_output: z.string(),
  outpue_detailed: z.string(),
});

export const getStructuredOutput = async (inputText) => {
  try {
    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content:
            "당신은 창의적인 텍스트 계산기입니다. 사용자가 입력한 단어들과 연산기호를 바탕으로 창의적이고 의미 있는 문장을 생성하세요. 연산자의 의미를 살려서 문장을 만들어야 합니다.",
        },
        {
          role: "user",
          content: inputText,
        },
      ],
      text: {
        format: zodTextFormat(TextCalcSchema, "text_calc"),
      },
    });

    return {
      text_output: response.output_parsed.text_output,
      outpue_detailed: response.output_parsed.outpue_detailed,
    };
  } catch (error) {
    console.error("OpenAI structured output error", error);
  }
};