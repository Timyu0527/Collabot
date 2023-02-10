import { Client, Collection, Events, ModalSubmitInteraction } from 'discord.js'
import { createBoardModal } from './modal/createBoard'
import { SlashCommand } from './types/command'

export function setBotListener(client: Client, commandList: Array<SlashCommand>) {
    const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

    client.once(Events.ClientReady, () => {
        console.log('Bot Ready!')
    })

  client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isModalSubmit()) return;
      const modalInteraction = interaction as ModalSubmitInteraction; 
      await modalInteraction.reply('Your submission was received successfully!');
      console.log(interaction);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

        const command = commands.get(interaction.commandName)

        if (!command) return

    if (interaction.commandName == 'board') {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand == 'create') {
        createBoardModal(interaction);
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
