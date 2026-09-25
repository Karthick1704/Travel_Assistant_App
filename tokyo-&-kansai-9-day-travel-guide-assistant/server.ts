import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini client creation
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Travel Guide Assistant Endpoint
  app.post("/api/guide-assistant", async (req, res) => {
    try {
      const { message, activeDay, userLocation } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const tripContext = `
You are the dedicated Tokyo & Kansai personal travel guide and explorer assistant for a traveler embarking on an exact 9-day trip to Japan:
- Traveler: Leaving from MAA (Chennai) via HKG (Hong Kong) to NRT (Tokyo Narita) on CX 632 and CX 520.
- Returning from KIX (Osaka Kansai) to MAA via HKG on CX 503 and CX 651.
- Day 1 (Sep 29): Flight to Tokyo, check-in Sotetsu Fresa Inn Hamamatsucho, relaxing evening around Hamamatsucho/Tokyo Tower.
- Day 2 (Sep 30): Tokyo DisneySea full day passport.
- Day 3 (Oct 1): Tokyo leisure day (cheap anime/electronics in Akihabara & Nakano Broadway, local food in Ameyoko/Tsukiji) + 18:00 TeamLab Borderless at MORI Building DIGITAL ART MUSEUM Azabudai Hills.
- Day 4 (Oct 2): Mt Fuji 5th Station, Lake Kawaguchiko, Hakone Ropeway, Owakudani sulfur valley (black eggs), Enoshima coastal trip.
- Day 5 (Oct 3): 10:00 AM Shinkansen to Osaka (2h 30m, right window for Mt Fuji view), check-in, leisure afternoon, 20-min Dotonbori Pirates cruise in evening.
- Day 6 (Oct 4): Osaka/Kyoto bus tour: Nara Park (deer bowing/feeding etiquette), Fushimi Inari Taisha (thousands of torii gates), Arashiyama Bamboo Grove & Togetsukyo bridge.
- Day 7 (Oct 5): Leisure day in Kansai (free of will - suggestions: Osaka Castle, Kuromon Ichiba, Umeda Sky, Shinsekai, Kobe).
- Day 8 (Oct 6): Amanohashidate & Ine Bay Funaya boathouse tour (sightseeing boat, Kasamatsu park chairlift/ropeway).
- Day 9 (Oct 7): Taxi/transit to KIX airport, return flights CX 503 to HKG then CX 651 to MAA.

Active Day context: ${activeDay ? `User is viewing Day ${activeDay}` : "General trip query"}
${userLocation ? `User approximate coordinates: Lat ${userLocation.lat}, Lng ${userLocation.lng}` : ""}

Provide concise, friendly, practical, and highly accurate travel advice.
Include:
1. Exact transit lines (e.g. JR Yamanote Line, Keisei Skyliner, Tokaido Shinkansen Nozomi, Osaka Midosuji line)
2. Japanese language hacks (phrase in Japanese Kanji/Kana + Romaji + English translation) where appropriate
3. Cultural etiquette reminders (train manners, bowing, coin trays, trash disposal, deer safety)
4. Google reviewer insider tips (best photo spots, timing, shortcuts)
`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${tripContext}\n\nTraveler Question: ${message}` }],
          },
        ],
        config: {
          systemInstruction:
            "You are an expert Japan local concierge and travel companion. Answer with warm hospitality (omotenashi), extreme clarity, bullet points for steps/directions, and practical tips.",
        },
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Guide error:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate travel assistance response",
        fallback:
          "I'm here to assist your 9-day Japan adventure! You can check your step-by-step route guide, packing checklist, and Japanese language hacks in the tabs above.",
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Japan Travel Guide server running on port ${PORT}`);
  });
}

startServer();
