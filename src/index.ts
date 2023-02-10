import { Client, GatewayIntentBits } from 'discord.js'
import { FoodSlashCommand } from './commands/food'
import { PoleSlashCommand } from './commands/pole'
import { deploySlashCommands } from './deploy'
import dotenv from 'dotenv'
import { AppConfig } from './types/config'
import { setBotListener } from './bot'
import { SlashCommand } from './types/command'
import { cleanEnv, str } from 'envalid'
import { ChannelSlashCommand } from './commands/createChannel'
import { AddSlashCommand } from './commands/addUser'
import { KickSlashCommand } from './commands/kickUser'
import { AlarmSlashCommand } from './commands/alarm'

// Register commands
import { FirebaseApp, initializeApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './config'
import { BoardSlashCommand } from './commands/board'

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)
export const db: Firestore = getFirestore(app)

// Register commands
const commandList: Array<SlashCommand> = [
  BoardSlashCommand,
  FoodSlashCommand,
  PoleSlashCommand,
  ChannelSlashCommand,
  AddSlashCommand,
  KickSlashCommand,
  AlarmSlashCommand
]

// Read .env file (if exist)
dotenv.config()

// Read environment variables
const env = cleanEnv(process.env, {
  DISCORD_CLIENT_ID: str(),
  DISCORD_BOT_TOKEN: str(),
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
}

// DiscordJS API Client: https://discord.js.org/#/docs/discord.js/main/class/Client
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages
  ]
})

// Deploy commands to a Discord chat server
deploySlashCommands(appConfig, commandList)
  .then((response) => console.log(`Deploy ${response.length} commands: ${response.map((c) => c.name)} successfully!`))
  .catch((reason) => console.log(`Failed to deploy commands: ${reason}`))

// Add event listener from discord
setBotListener(client, commandList)

// Logs the client in, establishing a WebSocket connection to Discord.
client
  .login(appConfig.token)
  .then(() => console.log(`Login successfully!`))
  .catch((reason) => console.log(`Failed to login: ${reason}`))
