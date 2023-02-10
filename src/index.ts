import { Client, GatewayIntentBits } from 'discord.js'
import { PingSlashCommand } from './commands/ping'
import { FoodSlashCommand } from './commands/food'
import { deploySlashCommands } from './deploy'
import { setBotListener } from './bot'
import { SlashCommand } from './types/command'
import { FirebaseApp, initializeApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore/lite'
import { appConfig, firebaseConfig } from './config'
import { BoardSlashCommand } from './commands/board'

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

// Register commands
const commandList: Array<SlashCommand> = [
    PingSlashCommand, 
    BoardSlashCommand,
    FoodSlashCommand
]

// Read .env file (if exist)
// DiscordJS API Client: https://discord.js.org/#/docs/discord.js/main/class/Client
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

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
