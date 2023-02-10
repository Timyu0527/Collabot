import { Client, Collection, Events } from 'discord.js'
import { createBoard, getBoard } from './service/board'
import { createBoardModal } from './modal/board'
import { getBoardSelectMenu } from './menu/board'
import { SlashCommand } from './types/command'

export function setBotListener(client: Client, commandList: Array<SlashCommand>) {
  const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

  client.once(Events.ClientReady, () => {
    console.log('Bot Ready!')
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return

    await createBoard(interaction)
    await interaction.reply('Your submission was received successfully!')
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isStringSelectMenu()) return

    const board = await getBoard(interaction)
    console.log(board.toString())
    // await interaction.reply(board.toString())
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return

    if (interaction.commandName == 'board') {
      const subcommand = interaction.options.getSubcommand()
      if (subcommand == 'create') {
        createBoardModal(interaction)
      }
      else if (subcommand == 'get') {
        getBoardSelectMenu(interaction)
      }
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    }
  })
}
