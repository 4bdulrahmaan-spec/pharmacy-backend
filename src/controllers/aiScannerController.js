import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

// Convert multer memory buffer to Gemini-compatible InlineData object
function bufferToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
}

// @desc    Scan medicine box using Gemini Vision OCR
// @route   POST /api/scan
// @access  Private/Admin
export const scanMedicineBox = async (req, res) => {
    try {
        if (!genAI) {
            return res.status(503).json({
                message: 'AI Service is currently unavailable. Please ask an administrator to set the GEMINI_API_KEY.'
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded.' });
        }

        // We use flash for incredibly fast Vision OCR capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Examine this image of a medicine or pet product box/bottle. 
        Extract the Brand/Manufacturer Name and the Specific Product/Generic Name printed on it.
        
        Return ONLY a single valid JSON object exactly like this, with nothing else:
        {"name": "Extracted Product Name", "brand": "Extracted Brand Name"}
        
        If you cannot confidently find one of them, leave the string empty in the JSON. do not use formatting blocks.`;

        const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text().trim();

        // Strip out markdown JSON formatting if Gemini adds it despite our prompt
        if (text.startsWith("```json")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        } else if (text.startsWith("```")) {
            text = text.replace(/```/g, "").trim();
        }

        const parsedData = JSON.parse(text);

        res.status(200).json({
            name: parsedData.name || '',
            brand: parsedData.brand || ''
        });

    } catch (error) {
        console.error('AI Box Scan Error:', error);
        res.status(500).json({
            message: 'Failed to extract text from the image. Please ensure the box is clearly visible.',
            error: error.message
        });
    }
};
