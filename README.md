# 🌍 Travel Itinerary Planner

A beautiful React frontend with an Express.js backend that uses AI to generate personalized travel itineraries.

## Features

- ✨ Beautiful, modern UI with gradient backgrounds and smooth animations
- 🗺️ Interactive form for destination and length of stay input
- 🤖 AI-powered itinerary generation using OpenAI
- 📱 Responsive design that works on all devices
- ⚡ Fast development with Vite
- 🔄 Real-time loading states and error handling

## Project Structure

```
my-express-app/
├── index.js              # Express.js backend server
├── package.json          # Backend dependencies
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main app component
│   │   └── App.css       # Styling
│   └── package.json      # Frontend dependencies
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Backend Setup

1. Navigate to the root directory:
   ```bash
   cd my-express-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Enter your desired destination (e.g., "Tokyo, Japan")
3. Select the length of your stay
4. Click "Plan My Trip!" to generate your AI-powered itinerary
5. View your personalized travel plan with recommended activities

## API Endpoints

- `GET /?destination={destination}&length={days}` - Generate travel itinerary

## Technologies Used

### Backend
- Express.js
- AI SDK for OpenAI integration
- dotenv for environment variables

### Frontend
- React 18
- Vite for fast development
- Modern CSS with gradients and animations
- Responsive design

## Customization

You can easily customize the application by:

- Modifying the system prompt in `index.js` to change the AI's behavior
- Updating the CSS in `frontend/src/App.css` for different styling
- Adding more form fields in `TravelForm.jsx`
- Enhancing the response display in `ResponseDisplay.jsx`

## Troubleshooting

- **CORS issues**: The frontend is configured with a proxy to the backend
- **API errors**: Make sure your OpenAI API key is correctly set in the `.env` file
- **Port conflicts**: Ensure ports 3000 (backend) and 5173 (frontend) are available

## License

This project is open source and available under the MIT License. 