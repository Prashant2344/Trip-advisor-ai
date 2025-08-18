import express from "express";
import 'dotenv/config';
import tripPlannerRoutes from './routes/tripPlanner.js';
import imageAnalysisRoutes from './routes/imageAnalysis.js';
import textToSpeechRoutes from './routes/textToSpeech.js';

const app = express();
const PORT = 3000;

// Increase payload size limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use the route files
app.use('/api/trip-planner', tripPlannerRoutes);
app.use('/api/image-analysis', imageAnalysisRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);

// Legacy routes for backward compatibility
app.get("/api", (req, res) => {
  // Forward the query parameters to the new endpoint
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  res.redirect(`/api/trip-planner${queryString ? '?' + queryString : ''}`);
});

app.post("/api/image", (req, res) => {
  // For POST requests, we need to handle the body data
  // Since we can't easily forward POST data, redirect to the new endpoint
  res.redirect('/api/image-analysis');
});

app.get("/", (req, res) => {
  // Forward the query parameters to the new endpoint
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  res.redirect(`/api/trip-planner/direct${queryString ? '?' + queryString : ''}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
