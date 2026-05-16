export async function generateWithAI(prompt: string) {
  console.log("Wysyłam prompt do backendu:", prompt);

  const response = await fetch("http://127.0.0.1:3001/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  console.log("Status backendu:", response.status);

  const data = await response.json();

  console.log("Odpowiedź backendu:", data);

  if (!response.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data.text;
}
