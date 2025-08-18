import express from "express";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const router = express.Router();

// Fallback function for when OpenAI is unavailable
function generateFallbackImageAnalysis(imageSource) {
  const fallbackResponses = [
    "This appears to be a travel-related image. While I can't provide detailed AI analysis right now due to service limitations, here are some general travel tips:\n\n" +
    "• Consider the lighting and composition for photography\n" +
    "• Research the location's cultural significance\n" +
    "• Check local weather and best visiting times\n" +
    "• Look into nearby attractions and activities\n" +
    "• Consider local customs and etiquette\n\n" +
    "For detailed analysis, please try again later when the AI service is available.",

    "I can see this is an image you'd like me to analyze. Currently, the AI analysis service is experiencing high demand.\n\n" +
    "In the meantime, here are some travel planning tips:\n\n" +
    "• Use the Travel Planner tab to get AI-generated itineraries\n" +
    "• Research destinations through travel websites\n" +
    "• Check local tourism boards for information\n" +
    "• Consider seasonal factors for your visit\n" +
    "• Look into local transportation options\n\n" +
    "Please try the image analysis again in a few minutes.",

    "This image shows what appears to be a travel destination or landmark. The AI analysis service is temporarily unavailable.\n\n" +
    "Here are some alternative ways to get travel information:\n\n" +
    "• Switch to the Travel Planner tab for destination itineraries\n" +
    "• Use online travel guides and resources\n" +
    "• Check social media for recent visitor experiences\n" +
    "• Research local events and festivals\n" +
    "• Look into accommodation options in the area\n\n" +
    "The AI service should be back online shortly."
  ];
  
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

// Image analysis route
router.post("/", async (req, res) => {
  try {
    const { imageUrl, imageBase64 } = req.body;
    
    if (!imageUrl && !imageBase64) {
      return res.status(400).send("Image URL or base64 image is required");
    }

    // Validate base64 image size (max 10MB)
    if (imageBase64) {
      const sizeInBytes = Math.ceil((imageBase64.length * 3) / 4);
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 10) {
        return res.status(400).send("Image file is too large. Please use an image smaller than 10MB or compress it.");
      }
    }

    let imageInput;
    if (imageBase64) {
      // Use base64 image if provided
      imageInput = {
        type: 'image',
        image: imageBase64
      };
    } else {
      // Use URL if provided
      imageInput = {
        type: 'image',
        image: imageUrl
      };
    }

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in detail. If it appears to be a travel destination, landmark, or tourist attraction, provide additional context about the location, its significance, and any travel tips.' },
              imageInput,
            ],
          },
        ],
      });

      console.dir(result?.steps?.[0]?.content?.[0]?.text, { depth: null });

      res.send("Image Analysis: " + result?.steps?.[0]?.content?.[0]?.text || "No analysis generated");
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Check if it's a quota/quota exceeded error
      if (openaiError.message && openaiError.message.includes('quota')) {
        // Provide fallback response
        const fallbackResponse = generateFallbackImageAnalysis(imageUrl || 'uploaded image');
        res.send("Image Analysis (Fallback Mode): " + fallbackResponse);
      } else {
        res.status(500).send("AI service temporarily unavailable. Please try again later.");
      }
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).send("Something went wrong analyzing the image");
  }
});

export default router; 