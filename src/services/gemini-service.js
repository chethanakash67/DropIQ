const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. Spelling correction will use fallback only.');
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Correct spelling mistakes in search query using Gemini AI
   * @param {string} searchQuery - The user's search query
   * @returns {Promise<{corrected: string, confidence: string, suggestions: string[]}>}
   */
  async correctSpelling(searchQuery) {
    if (!this.ai) {
      return {
        corrected: searchQuery,
        confidence: 'low',
        suggestions: [],
        error: 'Gemini API not configured'
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a spelling correction assistant for an e-commerce product search.

User's search query: "${searchQuery}"

Task: Analyze this search query and correct any spelling mistakes. The query is likely searching for electronic products like earbuds, headphones, smartphones, etc.

Common brands: Samsung, Sony, Apple, JBL, Boat, OnePlus, Realme, Noise, pTron, MI/Xiaomi
Common product types: earbuds, headphones, neckbands, wired earphones, bluetooth, wireless

Respond in this EXACT JSON format (no extra text):
{
  "corrected": "corrected search query here",
  "confidence": "high|medium|low",
  "hasMistakes": true|false,
  "suggestions": ["alternative1", "alternative2"]
}

Rules:
- If no spelling mistakes, return the original query in "corrected"
- confidence: "high" if certain, "medium" if somewhat sure, "low" if unsure
- hasMistakes: true only if spelling errors were found
- suggestions: up to 2 alternative interpretations (empty array if none)
- Keep it concise and focused on spelling correction only`,
      });

      const text = response.text;

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          corrected: parsed.corrected || searchQuery,
          confidence: parsed.confidence || 'low',
          hasMistakes: parsed.hasMistakes || false,
          suggestions: parsed.suggestions || []
        };
      }

      // Fallback if JSON parsing fails
      return {
        corrected: searchQuery,
        confidence: 'low',
        hasMistakes: false,
        suggestions: [],
        error: 'Failed to parse AI response'
      };

    } catch (error) {
      console.error('Gemini API error:', error.message);
      return {
        corrected: searchQuery,
        confidence: 'low',
        hasMistakes: false,
        suggestions: [],
        error: error.message
      };
    }
  }

  /**
   * Quick check if a query likely has spelling mistakes
   * @param {string} searchQuery 
   * @returns {boolean}
   */
  hasLikelyMistakes(searchQuery) {
    // Quick heuristic checks before calling API
    const commonMisspellings = [
      'erbuds', 'earbusd', 'erbods', 'eerbods',
      'headfones', 'hedphones', 'headfons', 'hedphons',
      'blutooth', 'bluetoth', 'blutoth', 'bluethoth',
      'wireles', 'wirelss', 'wirles', 'wirelees',
      'samsong', 'samung', 'sumsung', 'samsng',
      'soni', 'sonny', 'soney', 'soony',
      'aple', 'appl', 'appel', 'aplle',
      'neckbnad', 'neckbnd', 'nekband', 'neckbad'
    ];

    const lowerQuery = searchQuery.toLowerCase();
    return commonMisspellings.some(mistake => lowerQuery.includes(mistake));
  }
}

module.exports = new GeminiService();
