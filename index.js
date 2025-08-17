import express from "express";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import 'dotenv/config';

const app = express();
const PORT = 3000;

// Increase payload size limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API route for frontend
app.get("/api", async (req, res) => {
  try {
    const destination = req.query.destination || "Pokhara, Nepal";
    const lengthOfStay = req.query.length || "3";
    
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          `You help planning travel itineraries. ` +
          `Respond to the users' request with a list ` +
          `of the best stops to make in their destination.`,
        prompt:
          `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
          `Please suggest the best tourist activities for me to do.`,
      });

      console.dir(result?.steps?.[0]?.content?.[0]?.text, { depth: null });

      res.send("Generated text: " + result?.steps?.[0]?.content?.[0]?.text || "No text generated");
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Check if it's a quota/quota exceeded error
      if (openaiError.message && openaiError.message.includes('quota')) {
        // Provide fallback response
        const fallbackResponse = generateFallbackTravelItinerary(destination, lengthOfStay);
        res.send("Generated text (Fallback Mode): " + fallbackResponse);
      } else {
        res.status(500).send("AI service temporarily unavailable. Please try again later.");
      }
    }
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).send("Something went wrong");
  }
});

// Fallback function for travel itineraries
function generateFallbackTravelItinerary(destination, lengthOfStay) {
  const commonDestinations = {
    'tokyo': {
      name: 'Tokyo, Japan',
      tips: [
        'Visit Senso-ji Temple in Asakusa',
        'Explore Shibuya Crossing and shopping districts',
        'Take in views from Tokyo Skytree or Tokyo Tower',
        'Experience traditional culture in Meiji Shrine',
        'Try authentic sushi and ramen',
        'Visit Akihabara for electronics and anime culture'
      ]
    },
    'paris': {
      name: 'Paris, France',
      tips: [
        'Visit the iconic Eiffel Tower',
        'Explore the Louvre Museum',
        'Walk along the Champs-Élysées',
        'Visit Notre-Dame Cathedral',
        'Take a Seine River cruise',
        'Explore Montmartre and Sacré-Cœur'
      ]
    },
    'new york': {
      name: 'New York City, USA',
      tips: [
        'Visit Times Square and Broadway',
        'Explore Central Park',
        'See the Statue of Liberty',
        'Visit the Metropolitan Museum of Art',
        'Walk across the Brooklyn Bridge',
        'Experience the High Line park'
      ]
    },
    'bali': {
      name: 'Bali, Indonesia',
      tips: [
        'Visit ancient temples like Tanah Lot',
        'Explore rice terraces in Tegalalang',
        'Relax on beautiful beaches',
        'Experience traditional dance performances',
        'Visit the Sacred Monkey Forest',
        'Try local Balinese cuisine'
      ]
    },
    'pokhara': {
      name: 'Pokhara, Nepal',
      tips: [
        'Boat ride on Phewa Lake',
        'Visit Tal Barahi Temple',
        'Paragliding from Sarangkot',
        'Hike to World Peace Pagoda',
        'Explore Devi\'s Fall and caves',
        'Sunrise views of the Himalayas'
      ]
    }
  };

  // Check if we have specific tips for this destination
  const destinationKey = destination.toLowerCase().replace(/[^a-z]/g, '');
  let selectedDestination = commonDestinations[destinationKey];
  
  if (!selectedDestination) {
    // Generic fallback for unknown destinations
    selectedDestination = {
      name: destination,
      tips: [
        'Research local attractions and landmarks',
        'Check local weather and best visiting times',
        'Look into cultural sites and museums',
        'Find local restaurants and cuisine',
        'Research transportation options',
        'Check for local events and festivals'
      ]
    };
  }

  return `Here's a suggested ${lengthOfStay}-day itinerary for ${selectedDestination.name}:\n\n` +
         `While the AI service is temporarily unavailable, here are some recommended activities:\n\n` +
         selectedDestination.tips.map((tip, index) => `Day ${Math.floor(index / 2) + 1}: ${tip}`).join('\n') +
         `\n\nFor a more detailed AI-generated itinerary, please try again later when the service is available.`;
}

// Image analysis route
app.post("/api/image", async (req, res) => {
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

// Root route for direct API access
app.get("/", async (req, res) => {
  try {
    const destination = req.query.destination || "Pokhara, Nepal";
    const lengthOfStay = req.query.length || "3";
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        `You help planning travel itineraries. ` +
        `Respond to the users' request with a list ` +
        `of the best stops to make in their destination.`,
      prompt:
        `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
        `Please suggest the best tourist activities for me to do.`,
    });

    console.dir(result?.steps?.[0]?.content?.[0]?.text, { depth: null });

    res.send("Generated text: " + result?.steps?.[0]?.content?.[0]?.text || "No text generated");
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).send("Something went wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
