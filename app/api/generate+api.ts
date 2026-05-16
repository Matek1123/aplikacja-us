import OpenAI from "openai";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    completion.choices[0]?.message?.content ||
    "Nie udało się wygenerować odpowiedzi.";

  return Response.json({ text });
}
