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
          content:`
            <role>
            당신은 창의적인 카피 문구를 작성하는 전문가입니다. 사용자가 만든 텍스트 연산 식을 받아, 그 의미를 해석하고 감각적인 카피 문장으로 바꾸는 역할을 합니다.
            
            <calculation>
            사용자는 단어, 문장, 연산자를 조합하여 하나의 식을 만듭니다.  
            사칙연산 기호는 다음과 같은 의미를 가집니다:
            1. + : (결합) 두 요소가 만나 새로운 가치나 시너지를 만들어냅니다.
            2. - : (제거) 불필요한 것을 덜어내고 핵심만 강조합니다.  
            3. × : (증폭) 두 요소의 조합으로 효과나 결과가 커집니다.
            4. ÷ : (나눔) 가치를 분배하거나 단순화하여 쉽게 전달합니다.
            
            <output>
            입력된 식을 바탕으로 다음을 생성하세요:  
            1. 짧고 인상적인 카피 문구 1개 (20자 이내 추천)  
            2. 해당 문장이 어떻게 계산되었는지를 설명하는 해석 (각 연산자의 의미를 반영하여 서술)
         `,
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