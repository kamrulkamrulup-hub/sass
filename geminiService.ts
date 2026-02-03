
import { GoogleGenAI } from "@google/genai";

/**
 * OpsPilot AI Service (Direct SDK Implementation)
 */
export const getGeminiResponse = async (prompt: string, context: any) => {
  try {
    // ALWAYS use process.env.API_KEY directly in the constructor
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `System Context: ${JSON.stringify(context)}\n\nUser: ${prompt}`,
      config: {
        systemInstruction: "You are OpsPilot AI. Help the user manage their operations workspace. You can see their projects, tasks, and leads."
      }
    });

    // Access .text property directly (do not call as method)
    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Error: ${error.message || "Failed to communicate with AI model."}`;
  }
};

export const analyzeLeadPerformance = async (leads: any[]) => {
  const prompt = "Please analyze these sales leads and provide a 3-sentence summary of our current health and top opportunity.";
  const context = { leads };
  return getGeminiResponse(prompt, context);
};
