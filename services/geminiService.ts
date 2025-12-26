
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWeeklyRecap = async (
  leagueName: string, 
  week: number, 
  summaryData: string,
  tradeDeadline: number,
  playoffStart: number
): Promise<string> => {
  try {
    const context = `The trade deadline was Week ${tradeDeadline}. The playoffs begin in Week ${playoffStart}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a sports journalist for NDNN (Northwest Dynasty News Network) writing a column titled 'The 49th Parallel Post' for the ${leagueName} league. 
      
      STRICT REQUIREMENT: Focus ONLY on the results of the actual head-to-head weekly matchups. Do NOT account for or mention 'all-play' records, 'true strength', or aggregate league-wide efficiency metrics in this section. This column is about who beat who on the gridiron this week.
      
      Write a punchy, 3-paragraph recap for Week ${week}. 
      Context: ${context}. 
      Highlight the high scorers, the heartbreakers (close losses), and the big upsets based on these head-to-head outcomes: ${summaryData}. 
      Ensure your commentary reflects the current state of the season (e.g., if the trade deadline has passed, don't mention trades as an option; if playoffs are close, mention the hunt for a seed).
      Use NFL terminology (e.g., 'red zone', 'gridiron', 'touchdown'). Keep it professional yet exciting, with a flair for dynasty league competition.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text || "Weekly recap coming soon...";
  } catch (error) {
    console.error("AI Recap Error:", error);
    return "The NDNN sports desk is currently unavailable, but the competition remains fierce!";
  }
};

export const generateMatchupRecaps = async (week: number, matchupData: any[]): Promise<{matchup_id: number, recap: string}[]> => {
  try {
    const prompt = `Act as an NDNN Game Analyst. For each of these Week ${week} fantasy football matchups, write a 1-2 sentence snappy, professional recap. 
    Focus strictly on the head-to-head outcome - was it a blowout? A last-second nailbiter? Did one star player carry the team to victory?
    
    Data: ${JSON.stringify(matchupData)}
    
    Return a JSON array of objects with fields: "matchup_id" (number) and "recap" (string).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              matchup_id: { type: Type.INTEGER },
              recap: { type: Type.STRING }
            },
            required: ["matchup_id", "recap"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Matchup Recaps Error:", error);
    return [];
  }
};

export const generatePlayerHighlights = async (week: number, performances: any[]): Promise<any[]> => {
  try {
    const prompt = `Act as an over-the-top NDNN 'SportsCenter' anchor. For each of these fantasy football player performances in Week ${week}, write a 1-sentence explosive highlight reel description. 
    Performances: ${JSON.stringify(performances)}.
    
    Return the descriptions as an array of objects matching the input but with an added 'highlight_text' field.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              player_id: { type: Type.STRING },
              player_name: { type: Type.STRING },
              points: { type: Type.NUMBER },
              owner_name: { type: Type.STRING },
              highlight_text: { type: Type.STRING }
            },
            required: ["player_id", "player_name", "points", "owner_name", "highlight_text"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Highlights Error:", error);
    return [];
  }
};
