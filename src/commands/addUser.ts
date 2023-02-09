import { SlashCommandBuilder, CommandInteraction, TextChannel, PermissionFlagsBits } from 'discord.js'
import { SlashCommand } from '../types/command'

export const AddSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('add').setDescription('將使用者加進目前所在的頻道!')
        .addUserOption(option => option.setName('使用者名稱').setDescription('即將加入的使用者').setRequired(true)),
    async execute(interaction: CommandInteraction) {
        const channel = interaction.channel as TextChannel
        if (!channel) {
            await interaction.reply("無法獲取當前文字頻道");
        }
        try {
            channel.permissionOverwrites.set([
                {
                    id: interaction.options.getUser('使用者名稱').id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ]);
            await interaction.reply(`已將 ${interaction.options.getUser('使用者名稱')} 添加到頻道`);
        } catch (error) {
            await interaction.reply("發生了一個錯誤，無法添加用戶到頻道");
        }
    }
}
