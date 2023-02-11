import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, SlashCommandSubcommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { getAllBoards } from '../service/board'

export const BoardSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('board')
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('list')
                .setDescription('List all board IDs and names.')
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('create')
                .setDescription('Create a board.(maximun 10 boards).')
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('get')
                .setDescription('Get a specific board.')
        )
        .setDescription('board command.'),
    execute: async (interaction: CommandInteraction) => {
        const opts = interaction.options as CommandInteractionOptionResolver
        const subcommand: string = opts.getSubcommand()
        if (subcommand == 'list') {
            const boards = await getAllBoards()


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