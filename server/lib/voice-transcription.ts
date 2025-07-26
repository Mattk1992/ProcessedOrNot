import { AssemblyAI } from 'assemblyai';

// Initialize Assembly AI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not configured');
    }

    // Upload audio file to Assembly AI
    const uploadUrl = await client.files.upload(audioBuffer);
    
    // Configure transcription parameters
    const config = {
      audio: uploadUrl,
      language_code: 'en',
      punctuate: true,
      format_text: true,
      word_boost: [
        // Boost food-related terms for better accuracy
        'food', 'nutrition', 'ingredients', 'product', 'brand',
        'organic', 'protein', 'carbs', 'calories', 'vitamins',
        'dairy', 'gluten', 'sugar', 'sodium', 'fiber'
      ],
      boost_param: 'high'
    };

    // Start transcription
    const transcript = await client.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      throw new Error(`Assembly AI transcription failed: ${transcript.error}`);
    }

    // Return the transcribed text
    return transcript.text || '';
    
  } catch (error) {
    console.error('Voice transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function isVoiceTranscriptionAvailable(): boolean {
  return !!process.env.ASSEMBLYAI_API_KEY;
}