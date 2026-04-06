import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data: any = await response.json();
    console.log(JSON.stringify(data.models.map((m: any) => m.name), null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
