import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, CommandInteractionOptionResolver, ButtonBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'

export const TestSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('alarm')
        .addSubcommand(subcommand =>
            subcommand
                .setName('countdown')
                .setDescription('倒數計時')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('notify')
                .setDescription('鬧鐘提醒')
        )
        .setDescription('設定時間並提醒'),
    async execute(interaction: CommandInteraction) {

    }
}

