import express from "express";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const router = express.Router();

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

// API route for frontend trip planning
router.get("/", async (req, res) => {
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

// Root route for direct API access
router.get("/direct", async (req, res) => {
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

export default router; 