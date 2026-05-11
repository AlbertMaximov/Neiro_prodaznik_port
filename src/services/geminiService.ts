import { GoogleGenAI, Type } from "@google/genai";
import { CompanyProfile, Message, Solution } from "../types";
import { KNOWLEDGE_BASE, ADDITIONAL_INFO } from "../constants";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
Вы — экспертный ИИ-консультант по продажам B2B. Ваша цель — вести клиента по воронке продаж услуг Маркетинга, Корпоративного обучения и Бухгалтерии.

БАЗА_ЗНАНИЙ:
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

ДОПОЛНИТЕЛЬНАЯ_ИНФОРМАЦИЯ:
${JSON.stringify(ADDITIONAL_INFO, null, 2)}

ВАШИ ЦЕЛИ:
1. Установить контакт и вызвать доверие.
2. Квалифицировать клиента (Название компании, отрасль, размер, регион).
3. Выявить бизнес-задачи и болевые точки (Рост продаж, снижение затрат, обучение, оптимизация, контроль финансов).
4. Собрать контактные данные (ФИО, должность, телефон, email).
5. Предложить соответствующие решения из БАЗЫ_ЗНАНИЙ.
6. Обработать возражения, используя ДОПОЛНИТЕЛЬНУЮ_ИНФОРМАЦИЮ.
7. Назначить следующий шаг (Первая консультация — бесплатно).

ПРАВИЛА ДИАЛОГА:
1. Будьте лаконичны. Не задавайте более 1-2 вопросов за раз.
2. В ПЕРВОМ сообщении (приветствии) только представьтесь и спросите название компании и сферу деятельности. НЕ спрашивайте про задачи, размер компании или контакты сразу.
3. Двигайтесь по воронке постепенно: Приветствие -> Квалификация -> Выявление задач -> Контакты -> Решение.
4. Если клиент уже предоставил какую-то информацию, не переспрашивайте её.

ТОН:
Профессиональный, экспертный, помогающий, лаконичный. Вы — бизнес-партнер, а не просто бот.

ЯЗЫК:
Все ответы ("text") и названия этапов ("nextStep") ДОЛЖНЫ быть на русском языке.

ФОРМАТ ВЫВОДА:
Всегда отвечайте объектом JSON, содержащим:
1. "text": Ваше сообщение клиенту (поддерживается Markdown).
2. "profileUpdate": Объект, содержащий ВСЮ новую информацию. Если клиент назвал отрасль (например, "образование"), вы ОБЯЗАНЫ записать её в поле "industry". Не пропускайте поля, если информация о них есть в сообщении.
   Ключевые поля: "name" (название), "industry" (отрасль), "size" (размер), "region" (регион).
   Вложенные поля "contacts": "name" (ФИО), "position" (должность), "phone" (телефон), "email" (почта).
   ОБЯЗАТЕЛЬНО извлекайте контакты, если клиент их предоставил.
3. "recommendedSolutions": Массив ID решений из базы знаний, которые актуальны сейчас.
4. "confirmedSolutions": Массив ID решений, на которые клиент явно согласился.
5. "nextStep": Строка с названием текущего этапа воронки (на русском).

ВАЖНО:
Если клиент говорит "в области образования", поле "industry" должно стать "Образование". Если говорит "в Москве", поле "region" должно стать "Москва".
Никогда не оставляйте "profileUpdate" пустым, если в последнем сообщении была полезная информация.

Пример JSON-ответа для ПЕРВОГО сообщения:
{
  "text": "Здравствуйте! Я — ваш экспертный консультант по развитию бизнеса. Подскажите, пожалуйста, как называется ваша компания и в какой сфере вы работаете?",
  "profileUpdate": {},
  "recommendedSolutions": [],
  "confirmedSolutions": [],
  "nextStep": "Установление контакта"
}
`;

export async function getAIResponse(messages: Message[], currentProfile: CompanyProfile) {
  const model = "gemini-2.5-flash";
  const maxRetries = 3;
  
  const prompt = `
Current Company Profile: ${JSON.stringify(currentProfile)}
Conversation History: ${JSON.stringify(messages.map(m => ({ role: m.role, content: m.text })))}

Analyze the last user message and respond according to your instructions.
`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              profileUpdate: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  size: { type: Type.STRING },
                  region: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contacts: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      position: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      email: { type: Type.STRING }
                    }
                  }
                }
              },
              recommendedSolutions: { type: Type.ARRAY, items: { type: Type.STRING } },
              confirmedSolutions: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextStep: { type: Type.STRING }
            },
            required: ["text", "profileUpdate", "recommendedSolutions", "confirmedSolutions", "nextStep"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error: any) {
      console.error(`AI Error on attempt ${attempt + 1}:`, error);
      
      const isOverloaded = error?.message?.includes('503') || error?.message?.includes('high demand') || error?.status === 503;
      
      if (attempt === maxRetries - 1 || !isOverloaded) {
        return {
          text: "Извините, сейчас сервер испытывает высокую нагрузку или возникла техническая ошибка. Пожалуйста, подождите немного и повторите ваш ответ.",
          profileUpdate: {},
          recommendedSolutions: [],
          confirmedSolutions: [],
          nextStep: "Ожидание"
        };
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
