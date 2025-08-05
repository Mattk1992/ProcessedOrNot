import { AssemblyAI } from 'assemblyai';
import { storage } from '../storage';

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Get current speech settings from database
    const settings = await storage.getSpeechSettings();
    
    if (!settings.enabled) {
      throw new Error('Speech-to-Text service is disabled');
    }

    if (!settings.apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY is not configured');
    }

    // Initialize Assembly AI client with dynamic API key
    const client = new AssemblyAI({
      apiKey: settings.apiKey
    });

    // Upload audio file to Assembly AI
    const uploadUrl = await client.files.upload(audioBuffer);
    
    // Configure transcription parameters based on database settings
    const wordBoost = settings.wordBoost && settings.wordBoost.length > 0 ? settings.wordBoost : [
      // Default boost food-related terms for better accuracy
      'food', 'nutrition', 'ingredients', 'product', 'brand',
      'organic', 'protein', 'carbs', 'calories', 'vitamins',
      'dairy', 'gluten', 'sugar', 'sodium', 'fiber'
    ];
    
    const config = {
      audio: uploadUrl,
      language_code: settings.language || 'en',
      punctuate: settings.punctuation,
      format_text: settings.formatText,
      word_boost: wordBoost,
      boost_param: settings.enhancedAccuracy ? 'high' as const : 'default' as const
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

export async function isVoiceTranscriptionAvailable(): Promise<boolean> {
  try {
    const settings = await storage.getSpeechSettings();
    return settings.enabled && !!settings.apiKey;
  } catch (error) {
    console.error('Error checking voice transcription availability:', error);
    return false;
  }
}