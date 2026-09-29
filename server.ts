import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Agronomist Deep-Dive explanation endpoint
app.post('/api/crop/explain', async (req, res) => {
  try {
    const { crop, confidence, input, runnerUp, language } = req.body;
    const isTamil = language === 'ta';

    if (!crop || !input) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are a Chief Agricultural Scientist and Agronomist specializing in Indian tropical agriculture and Tamil Nadu soils.
A farmer tested their soil and meteorological conditions with the following parameters:
- Nitrogen (N): ${input.nitrogen} kg/ha
- Phosphorus (P): ${input.phosphorus} kg/ha
- Potassium (K): ${input.potassium} kg/ha
- Ambient Temperature: ${input.temperature} °C
- Relative Humidity: ${input.humidity} %
- Soil pH: ${input.ph}
- Rainfall: ${input.rainfall} mm

The Gaussian Naive Bayes Machine Learning model selected **${crop}** with a confidence score of **${confidence}%** over the runner-up **${runnerUp || 'None'}**.

Please provide a concise, practical, highly actionable agronomic report structured into 4 sections:
1. **Soil & Climate Synergy**: Why this specific soil nutrient and rainfall envelope uniquely suits ${crop}, and why it outranked ${runnerUp || 'alternatives'}.
2. **Fertilizer & Soil Nutrition Plan**: Practical dosing recommendations (e.g. FYM, Neem Cake, Urea, DAP, MOP, or micronutrients like Zinc/Boron) given the current N: ${input.nitrogen}, P: ${input.phosphorus}, K: ${input.potassium} and pH: ${input.ph}.
3. **Irrigation & Water Schedule**: Specific water management instructions for this crop under ${input.rainfall}mm rainfall.
4. **Farmer Yield Pro-Tip**: One high-impact seasonal advice for maximum harvest.

${isTamil ? 'Write your entire response in clear, encouraging, natural Tamil (தமிழ்) with proper agricultural terminology understood by Tamil farmers.' : 'Write in clear, professional English.'} Keep formatting clean with bullet points and bold titles.`;

      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const adviceText = response.text || '';
        return res.json({
          source: 'gemini-3.8-flash',
          explanation: adviceText,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local agronomist heuristics:', geminiError?.message);
      }
    }

    // High quality deterministic agronomy heuristics fallback
    const fallbackEnglish = `### 1. Soil & Climate Synergy
- **Nutrient Match**: ${crop} thrives under your measured N-P-K envelope (${input.nitrogen}-${input.phosphorus}-${input.potassium} kg/ha). The soil pH of ${input.ph} provides optimal nutrient availability without mineral toxicity.
- **Microclimate Fit**: Temperature at ${input.temperature}°C with ${input.humidity}% humidity and ${input.rainfall}mm rainfall provides ideal physiological conditions for ${crop}.
${runnerUp ? `- **Runner-up Context**: Compared to ${runnerUp}, ${crop} has significantly higher tolerance to your specific rainfall (${input.rainfall}mm) and soil moisture regime.` : ''}

### 2. Fertilizer & Soil Nutrition Plan
- Apply 10 to 12 tonnes/hectare of well-decomposed Farmyard Manure (FYM) or Vermicompost during field preparation.
- ${input.ph < 6.0 ? 'Apply agricultural lime (1.5 t/ha) to ameliorate moderate soil acidity.' : input.ph > 7.5 ? 'Apply gypsum (1.0 t/ha) to buffer alkaline pH.' : 'Soil pH is well-balanced.'}
- Basal application of Phosphobacteria and Azospirillum bio-fertilizers (2 kg/ha each) to enhance root bio-availability.

### 3. Irrigation & Water Management
- Monitor critical growth stages. With ${input.rainfall}mm rainfall, implement drip irrigation or ridge-and-furrow water saving methods to prevent water stagnation.

### 4. Farmer Harvest Advice
- Ensure timely weed control within the first 30 days after sowing. Rotate with pulse crops in subsequent seasons to naturally replenish soil nitrogen.`;

    const fallbackTamil = `### 1. மண் மற்றும் வானிலை பொருத்தம்
- **சத்துக்களின் பொருத்தம்**: உங்கள் நிலத்தின் தழை-மணி-சாம்பல் சத்து அளவு (${input.nitrogen}-${input.phosphorus}-${input.potassium} கிலோ/ஹெக்) ${crop} பயிரின் தேவையை முழுமையாக பூர்த்தி செய்கிறது. மண்ணின் pH ${input.ph} சத்துக்கள் வேர்களுக்கு எளிதில் கிடைக்க உகந்தது.
- **வானிலை பொருத்தம்**: ${input.temperature}°C வெப்பநிலை, ${input.humidity}% ஈரப்பதம் மற்றும் ${input.rainfall} மி.மீ மழைப்பொழிவு ${crop} பயிரின் துரித வளர்ச்சிக்கு உறுதுணையாக உள்ளது.
${runnerUp ? `- **ஒப்பீடு**: ${runnerUp} பயிரை விட ${crop} உங்கள் பகுதியின் மழைப்பொழிவுக்கு (${input.rainfall} மி.மீ) அதிக விளைச்சலைத் தரும்.` : ''}

### 2. உர பரிந்துரை மற்றும் மண் மேலாண்மை
- நிலத்தை உழும் போது ஏக்கருக்கு 4-5 டன் மக்கிய தொழு உரம் அல்லது மண்புழு உரம் இட்டு நிலத்தை தயார்படுத்தவும்.
- அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா தலா 2 கிலோ/ஏக்கர் இடுவது வேர் வளர்ச்சியை விரைவுபடுத்தும்.
- ${input.ph < 6.0 ? 'மண்ணின் அமிலத்தன்மையை குறைக்க ஹெக்டேருக்கு 1.5 டன் டாலமைட் சுண்ணாம்பு இடவும்.' : 'மண் காரத்தன்மை சமச்சீராக உள்ளது.'}

### 3. நீர்ப்பாசன மேலாண்மை
- ${input.rainfall} மி.மீ மழை நிலவுவதால், நீர் தேங்காமல் வடிகால் அமைப்பது வேர் அழுகல் நோயைத் தடுக்கும். சொட்டு நீர் பாசனம் நீர் பயன்பாட்டு திறனை 40% அதிகரிக்கும்.

### 4. அதிக மகசூலுக்கான ரகசியம்
- விதைத்த 25-30 நாட்களில் முதல் களையெடுப்பை கட்டாயம் முடிக்கவும். அடுத்த பருவத்தில் பயறு வகை பயிர்களை பயிரிடுவது மண் வளத்தை மேலும் பெருக்கும்.`;

    return res.json({
      source: 'expert-agronomy-engine',
      explanation: isTamil ? fallbackTamil : fallbackEnglish,
    });
  } catch (error: any) {
    console.error('Error generating crop explanation:', error);
    res.status(500).json({ error: 'Internal server error generating explanation' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Crop Advisor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
