import dotenv from 'dotenv';
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    uri: process.env.MONGODB_URI
  },
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY,
    baseURL: 'https://api.minimax.io/v1'
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY
  },
  jwt: {
    secret: process.env.ACCESS_TOKEN_SECRET || 'fallback_default_visor_secret_key_change_in_prod',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '24h'
  }
};

/**
 * Validate that critical environment configuration keys are set
 */
export function validateConfig() {
  const missingKeys = [];

  if (!config.database.uri) {
    missingKeys.push('MONGODB_URI');
  }
  if (!config.minimax.apiKey) {
    missingKeys.push('MINIMAX_API_KEY');
  }
  if (!config.deepgram.apiKey) {
    missingKeys.push('DEEPGRAM_API_KEY');
  }

  if (missingKeys.length > 0) {
    console.warn(`[WARNING] Config verification failed. Missing environment keys: ${missingKeys.join(', ')}`);
    console.warn('Make sure to copy backend/.env.example to backend/.env and supply values.');
  } else {
    console.log('[SUCCESS] Config verification completed. All core API keys loaded.');
  }
}