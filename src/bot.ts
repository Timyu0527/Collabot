import { Client, Collection, Events, ModalSubmitInteraction } from 'discord.js'
import { createBoard } from './service/board'
import { createBoardModal } from './modal/board'
import { SlashCommand } from './types/command'

export function setBotListener(client: Client, commandList: Array<SlashCommand>) {
    const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

    client.once(Events.ClientReady, () => {
        console.log('Bot Ready!')
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit()) return;
        interaction = interaction as ModalSubmitInteraction;
        await interaction.reply('Your submission was received successfully!');
        await createBoard(interaction)
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

    client.on(Events.InteractionCreate, async (interaction) => {

        if (interaction.isButton() && interaction.customId == "food.order.accept") {
            let userId=interaction.user.id;
            console.log("clicked");
                if (interaction.channel==null) return;
                await interaction.channel.send(':middle_finger:');
        } else if (interaction.isButton() && interaction.customId == "food.order.result"){
            let userId=interaction.user.id;
            console.log("clicked");
                if (interaction.channel==null) return;
                await interaction.channel.send(':middle_finger:');
        }
    })
}

