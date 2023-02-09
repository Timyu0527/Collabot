import dotenv from 'dotenv'
import { AppConfig } from './types/config'
import { cleanEnv, str } from 'envalid'

dotenv.config()

// Read environment variables
export const env = cleanEnv(process.env, {
  DISCORD_BOT_TOKEN: str(),
  DISCORD_CLIENT_ID: str(),
  DISCORD_GUILD_ID: str(),
  TRELLO_API_KEY: str(),
  TRELLO_TOKEN: str()
})

// Construct the main config of this app
export const appConfig: AppConfig = {
  token: env.DISCORD_BOT_TOKEN,
  clientId: env.DISCORD_CLIENT_ID,
  guildId: env.DISCORD_GUILD_ID
}
