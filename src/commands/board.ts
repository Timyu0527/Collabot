import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { SlashCommand } from '../types/command';
import { getAllBoards, createBoard} from './utility';

export const BoardSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('board')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('list')
                .setDescription('List all boards.')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Create a board.')
        )
        .setDescription('board command.'),
    execute: async (interaction: CommandInteraction) => {
        const opts = interaction.options as CommandInteractionOptionResolver;
        const subcommand: string = opts.getSubcommand();
        if (subcommand == 'list') {
            await interaction.deferReply();

            const boards = await getAllBoards(interaction)

            if (boards) await interaction.editReply({ content: boards });
            else await interaction.editReply({ content: 'No boards found.' });
        }
    }
}