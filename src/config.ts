import dotenv from 'dotenv'
import { AppConfig, FirebaseConfig } from './types/config'
import { cleanEnv, str } from 'envalid'

dotenv.config()

// Read environment variables
export const env = cleanEnv(process.env, {
    DISCORD_BOT_TOKEN: str(),
    DISCORD_CLIENT_ID: str(),
    DISCORD_GUILD_ID: str(),
    TRELLO_API_KEY: str(),
    TRELLO_TOKEN: str(),
    FIREBASE_API_KEY: str(),
    FIREBASE_AUTH_DOMAIN: str(),
    FIREBASE_PROJECT_ID: str(),
    FIREBASE_STORAGE_BUCKET: str(),
    FIREBASE_MESSAGING_SENDER_ID: str(),
    FIREBASE_APP_ID: str(),
    FIREBASE_MEASUREMENT_ID: str()
})

// Construct the main config of this app
export const appConfig: AppConfig = {
    token: env.DISCORD_BOT_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
    guildId: env.DISCORD_GUILD_ID
}

// Construct the config for Firebase
export const firebaseConfig: FirebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID
}
