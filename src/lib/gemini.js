import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackRouteRecommendation } from "./utils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "dummy_key";
const isRealSetup = API_KEY && !API_KEY.includes("dummy") && API_KEY !== "mock-key";
const genAI = isRealSetup ? new GoogleGenerativeAI(API_KEY) : null;

let lastCallTime = 0;
const RATE_LIMIT_MS = 30000;

function checkRateLimit() {
  const now = Date.now();
  if (now - lastCallTime < RATE_LIMIT_MS) {
    throw new Error("429 simulated rate limit: Skipping API call to prevent quota exhaustion");
  }
  lastCallTime = now;
}

export async function getRoutingRecommendation(gate, section, contextualCrowdData) {
  if (!isRealSetup) {
    const gateInfo = contextualCrowdData.selectedGate || {};
    return getFallbackRouteRecommendation(gate, section, gateInfo);
  }
  try {
    checkRateLimit();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an AI Smart Entry Assistant for a large sporting venue.
      The user wants to enter through ${gate} and go to ${section}.
      Current venue crowd data: ${JSON.stringify(contextualCrowdData)}
      
      Task:
      1. Analyze the crowd levels at ${gate}.
      2. If density is > 70%, suggest an alternate gate that is less crowded.
      3. Describe the fastest route.
      4. Estimate the walking time.
      Keep the response concise and helpful. Don't use markdown headers, just return a conversational paragraph or distinct short strings if you prefer.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error in routing:", error);
    return `Head straight to ${gate}. Expect some moderate queues. Follow the overhead signs to ${section}.`;
  }
}

export async function getVenueTip(stadiumState) {
  if (!isRealSetup) {
    const allQueues = Object.values(stadiumState.queues || {});
    const quickGate = allQueues.filter(q => q.type === 'gate').sort((a,b) => a.waitTime - b.waitTime)[0];
    return `Wait times are exceptionally low at ${quickGate ? quickGate.name.replace(' Entry', '') : 'Gate C'}, use it for quick entry!`;
  }
  try {
    checkRateLimit();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an AI venue assistant.
      Look at this live data: ${JSON.stringify(stadiumState)}
      Generate a single 1-sentence tip for fans. Examples:
      "Gate B food stall is 6 mins faster than Gate D right now."
      "Wait times are low at Gate C, use it for quick entry!"
      Do not hallucinate, use only the precise wait times in the data.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error in venueTip:", error);
    return "Tip: Gate B and Gate E currently have the shortest queues. Head there for faster entry.";
  }
}

export async function askConcierge(question, context) {
  try {
    if (!genAI) throw new Error("API not initialized");
    checkRateLimit();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are Fan AI Concierge for a sports venue.
      Current venue state: ${JSON.stringify(context)}
      User question: "${question}"
      Answer concisely and accurately based on the live venue state. 
      If the question is about restrooms, use the restroom data.
      Keep answers to 1-2 short sentences.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error in askConcierge:", error);
    const qLower = question.toLowerCase();
    const queues = context.queues || {};
    
    if (qLower.includes('restroom') || qLower.includes('toilet')) {
       const restroomShortest = Object.values(queues).filter(q => q.type === 'restroom').sort((a,b) => a.waitTime - b.waitTime)[0];
       return `${restroomShortest ? restroomShortest.name : 'The closest restroom'} currently shows a ${restroomShortest ? restroomShortest.waitTime : '12'} min wait — shortest option available. Head straight, taking the second corridor on your left.`;
    }
    
    if (qLower.includes('food') || qLower.includes('snack') || qLower.includes('eat')) {
       const foodShortest = Object.values(queues).filter(q => q.type === 'food').sort((a,b) => a.waitTime - b.waitTime)[0];
       return `Feeling hungry? ${foodShortest ? foodShortest.name : 'The food stall'} has the quickest service right now with only a ${foodShortest ? foodShortest.waitTime : '5'} minute queue. Have a great meal!`;
    }

    if (qLower.includes('gate') || qLower.includes('entry') || qLower.includes('enter')) {
       const gateShortest = Object.values(queues).filter(q => q.type === 'gate').sort((a,b) => a.waitTime - b.waitTime)[0];
       return `For the quickest entry, use ${gateShortest ? gateShortest.name : 'Gate C'} which only has a ${gateShortest ? gateShortest.waitTime : '2'} minute wait.`;
    }

    if (qLower.includes('park') || qLower.includes('parking')) {
       return "Parking Lots A and B are currently full. Please proceed to the East Overflow Lot, which is a 5-minute walk from Gate C.";
    }

    if (qLower.includes('emergency') || qLower.includes('help')) {
       return "If you have an emergency, please locate the nearest stadium staff member in a yellow vest or proceed directly to the First Aid station near Section 110.";
    }
    
    return "I'm your Fan AI Concierge! I see wait times are fluctuating across the venue right now, but overall flow is steady. What specific area can I help you find?";
  }
}

export async function getAlertAction(zoneData) {
  if (!isRealSetup) {
    return `Dispatch 2 additional stewards to ${zoneData.name} and temporarily reroute upcoming traffic to adjacent queue lines to alleviate the ${zoneData.density}% density load.`;
  }
  try {
    checkRateLimit();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an AI Staff Assistant.
      Zone ${zoneData.name} has exceeded 85% capacity (current density: ${zoneData.density}%).
      Provide a highly actionable 1-sentence suggestion for staff to manage this specific zone.
      Example: "Open Gate E overflow lane" or "Dispatch 2 additional stewards to North Stand."
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error in staffAlert:", error);
    return `Open overflow paths for ${zoneData.name}.`;
  }
}
