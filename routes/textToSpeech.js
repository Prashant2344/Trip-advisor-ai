import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Fallback function for when TTS service is unavailable
function generateFallbackTTSResponse(text, voice) {
  const voiceDescriptions = {
    'alloy': 'a balanced, versatile voice',
    'echo': 'a warm, friendly voice',
    'fable': 'a clear, expressive voice',
    'onyx': 'a deep, authoritative voice',
    'nova': 'a bright, energetic voice',
    'shimmer': 'a soft, gentle voice'
  };

  const voiceDesc = voiceDescriptions[voice] || 'a natural voice';
  
  return {
    text: text,
    voice: voice,
    voiceDescription: voiceDesc,
    message: `This text would normally be converted to speech using ${voiceDesc}. Since the TTS service is currently unavailable, here's the text content for you to read.`,
    alternatives: [
      'Use a text-to-speech browser extension',
      'Copy the text to a TTS app on your device',
      'Try again later when the service is available'
    ]
  };
}

// Text-to-speech conversion route
router.post("/", async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).send("Text content is required");
    }

    // Validate voice parameter
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).send("Invalid voice. Choose from: alloy, echo, fable, onyx, nova, shimmer");
    }

    try {
      // Initialize OpenAI client
      const openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Use OpenAI's TTS API
      const mp3 = await openaiClient.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
      });

      // Convert the response to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Set appropriate headers for audio response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Content-Disposition': 'attachment; filename="speech.mp3"'
      });

      res.send(buffer);
    } catch (openaiError) {
      console.error("OpenAI TTS API error:", openaiError);
      
      // Check for quota/rate limit errors
      if (openaiError.message && (openaiError.message.includes('quota') || openaiError.message.includes('429'))) {
        // Provide fallback response with helpful information
        const fallbackResponse = generateFallbackTTSResponse(text, voice);
        res.status(200).json({
          error: "TTS service quota exceeded",
          message: "Using fallback text-to-speech",
          fallback: fallbackResponse,
          suggestion: "Please check your OpenAI billing plan or try again later"
        });
      } else {
        res.status(500).json({
          error: "TTS service temporarily unavailable",
          message: "Please try again later",
          suggestion: "Check your internet connection and OpenAI API status"
        });
      }
    }
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    res.status(500).send("Something went wrong with text-to-speech conversion");
  }
});

// Get available voices
router.get("/voices", (req, res) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'A balanced, versatile voice' },
    { id: 'echo', name: 'Echo', description: 'A warm, friendly voice' },
    { id: 'fable', name: 'Fable', description: 'A clear, expressive voice' },
    { id: 'onyx', name: 'Onyx', description: 'A deep, authoritative voice' },
    { id: 'nova', name: 'Nova', name: 'A bright, energetic voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'A soft, gentle voice' }
  ];
  
  res.json(voices);
});

export default router; 