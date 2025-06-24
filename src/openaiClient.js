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
  output_detailed: z.string(),
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
당신은 사용자가 만든 텍스트 연산 식을 받아, 그 의미를 해석하고 아래 연산자 구조에 따라 텍스트 결과를 도출하는 역할을 합니다.

<calculation>
사용자는 단어, 문장, 연산자를 조합하여 하나의 식을 만듭니다.  
각 연산자는 아래와 같은 의미를 갖습니다:

1. + : (결합) 서로 다른 요소를 연결하여 새로운 의미를 만듭니다.
2. - : (제거) 불필요한 것을 덜어내고 핵심만 강조합니다.  
3. × : (증폭) 두 요소의 조합으로 효과나 결과가 커집니다.  
4. ÷ : (나눔) 가치를 분배하거나 단순화하여 쉽게 전달합니다.  
5. √ : (본질) 어떤 개념이나 사물의 근원적 감각이나 정수를 추출합니다.  
6. ∑ : (축적) 반복된 감정이나 경험의 누적, 전체적인 흐름을 표현합니다.  
7. ∫ : (흐름) 시간과 감정의 연속성, 서사적인 감각을 강조합니다.  
8. ∂ : (변화) 순간적인 감정의 변화나 미묘한 차이를 표현합니다.

<output>
입력된 식을 바탕으로 다음을 생성하세요:  
text_output: 단어 혹은 문장 
outpue_detailed: [각 연산자의 의미를 바탕으로 해당 결과를 도출한 이유를 구체적으로 설명. 문단을 나누어서 제시해줘]
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
      output_detailed: response.output_parsed.output_detailed,
    };
  } catch (error) {
    console.error("OpenAI structured output error", error);
  }
};