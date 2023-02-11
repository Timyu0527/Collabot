import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, CommandInteractionOptionResolver, TextInputBuilder, TextInputStyle, ModalBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'

export const AlarmSlashCommand: SlashCommand = {
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
        const opts = interaction.options as CommandInteractionOptionResolver;
        const subcommand: string = opts.getSubcommand();
        const modal = new ModalBuilder()
            .setTitle('設定時間');
        const time = new TextInputBuilder()
            .setCustomId('time')
            .setStyle(TextInputStyle.Short);
        const message = new TextInputBuilder()
            .setCustomId('mes')
            .setLabel("提醒訊息")
            .setStyle(TextInputStyle.Paragraph)
        switch (subcommand) {
            case 'countdown':
                modal.setCustomId('alarm.countdown')
                time.setLabel("設定倒數時間 格式為HH:MM:SS ex: 1:10:0(1小時10分鐘)")
                break
            case 'notify':
                modal.setCustomId('alarm.notify')
                time.setLabel("設定提醒時間 格式為YYYY:MM:DD:HH:MM:SS")
                break
        }
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(time));
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(message));
        await interaction.showModal(modal);
    }
}

