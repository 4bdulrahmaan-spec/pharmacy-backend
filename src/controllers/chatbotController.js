import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client only if the key is present
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

// @desc    Handle chat messages with AI Pharmacist
// @route   POST /api/chat
// @access  Public
export const handleChat = async (req, res) => {
    try {
        if (!genAI) {
            return res.status(503).json({
                message: 'AI Service is currently unavailable. Please ask an administrator to set the GEMINI_API_KEY.'
            });
        }

        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Get the chosen model (gemini-2.5-flash is good for fast text responses)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `You are a helpful, empathetic, and knowledgeable virtual Pharmacist and Pet Care specialist working for "The Pharmacy & Pet Shop", an online platform that sells both human medicines and pet supplies.
        
Guidelines:
1. Always be polite and professional.
2. For human medical questions, provide general information but ALWAYS include a disclaimer that you are an AI and they should consult a real doctor for serious conditions or prescriptions.
3. For pet questions, you can suggest types of food, general care tips, and over-the-counter remedies, but advise them to see a vet for serious pet illnesses.
4. If they ask about buying something, confirm that our store sells a wide variety of medicines and pet products.
5. Keep your responses concise and easy to read (use bullet points if helpful).
6. Do not make up fake prices or inventory numbers.

Current User Message: ${message}`;

        // We use generateContent instead of startChat for simpler stateless integration, 
        // but we pass in the history context manually to keep it lightweight.

        let promptWithHistory = systemPrompt;

        if (history && history.length > 0) {
            promptWithHistory += `\n\n--- Conversation History ---\n`;
            history.forEach(msg => {
                promptWithHistory += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.text}\n`;
            });
            promptWithHistory += `\nUser's Latest Message: ${message}`;
        }

        const result = await model.generateContent(promptWithHistory);
        const response = await result.response;
        const text = response.text();

        res.json({ text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            message: 'I encountered an error processing your request. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
