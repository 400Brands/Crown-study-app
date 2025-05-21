// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const multer = require("multer");
const upload = multer();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Routes
app.get("/", (req, res) => {
  res.send("PDF Quiz Generator API is running");
});

// PDF Quiz Generator endpoint
app.post("/api/generate-quiz", upload.none(), async (req, res) => {
  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = authHeader.split(" ")[1];
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get request body
    const { pdfUrl, config } = req.body;
    if (!pdfUrl || !config) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Download PDF from provided URL
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      return res.status(400).json({ message: "Failed to download PDF" });
    }

    // Convert PDF to buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // Extract text from PDF using OpenAI
    const extractTextResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the text content from this PDF document.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${pdfBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    const extractedText = extractTextResponse.choices[0].message.content;
    if (!extractedText) {
      return res
        .status(400)
        .json({ message: "Failed to extract text from PDF" });
    }

    // Generate quiz questions based on extracted text
    const generateQuestionsPrompt = `
    You are a professional educator creating a quiz for students. Generate ${config.questionCount} high-quality 
    ${config.difficultyLevel} difficulty quiz questions based on the following text content.
    
    For each question:
    1. Create a clear, concise question
    2. Provide 4 answer options (A, B, C, D) with one correct answer
    3. Include a brief explanation of the correct answer
    
    The quiz should focus on key concepts and important details from the text.
    
    Text content:
    ${extractedText}
    
    Format your response as a valid JSON array of objects, each with:
    - id: a unique string identifier (q-1, q-2, etc.)
    - text: the question text
    - options: an array of objects with id (a, b, c, d), text (the option text), and isCorrect (boolean)
    - explanation: brief explanation of the correct answer
    
    Example: 
    [
      {
        "id": "q-1",
        "text": "What is the main concept described in paragraph 2?",
        "options": [
          { "id": "q-1-a", "text": "Option A", "isCorrect": false },
          { "id": "q-1-b", "text": "Option B", "isCorrect": true },
          { "id": "q-1-c", "text": "Option C", "isCorrect": false },
          { "id": "q-1-d", "text": "Option D", "isCorrect": false }
        ],
        "explanation": "Option B is correct because..."
      }
    ]
    
    Return only the JSON array and nothing else.
    `;

    const generateQuestionsResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that generates quiz questions based on educational content.",
        },
        {
          role: "user",
          content: generateQuestionsPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedQuestionsText =
      generateQuestionsResponse.choices[0].message.content;
    if (!generatedQuestionsText) {
      return res.status(500).json({ message: "Failed to generate questions" });
    }

    // Parse the generated questions
    const parsedResponse = JSON.parse(generatedQuestionsText);
    const questions = parsedResponse.questions || [];

    // Return the generated questions
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
