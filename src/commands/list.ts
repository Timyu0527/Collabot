import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, SlashCommandSubcommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { getAllBoards } from '../service/board'

export const ListSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list')
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('get')
                .setDescription('List all board IDs and names.')
        )
        .setDescription('list command.'),
    execute: async (interaction: CommandInteraction) => {
        const opts = interaction.options as CommandInteractionOptionResolver
        const subcommand: string = opts.getSubcommand()
        if (subcommand == 'get') {
            const boards = await getAllBoards(interaction)


            if (boards){
                let boardsStr = new String('```\n')

                for (let i = 0; i < boards.length; ++i){
                    boardsStr += `${i + 1}. ${boards[i].name} (${boards[i].id})\n`
                }
                boardsStr += '```'
                await interaction.reply({ content: boardsStr.toString()})
            }
            else await interaction.reply({ content: 'No boards found.' })
        }
    }
}