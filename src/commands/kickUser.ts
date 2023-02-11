import { SlashCommandBuilder, CommandInteraction, TextChannel, User } from 'discord.js'
import { SlashCommand } from '../types/command'

export const KickSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('remove')
        .addUserOption(option =>
            option
                .setName('使用者名稱')
                .setDescription('即將踢出的使用者')
                .setRequired(true)
        )
        .setDescription('將使用者踢出目前所在的頻道!'),
    async execute(interaction: CommandInteraction) {
        const channel = interaction.channel as TextChannel
        if (!channel) {
            await interaction.reply("無法獲取當前文字頻道")
        } else {
            let user = interaction.options.getUser('使用者名稱') as User
            try {
                channel.permissionOverwrites.edit(user, {
                    SendMessages: false,
                    ViewChannel: false
                })
                    .then(channel => console.log(channel.permissionOverwrites.cache.get(user.id)))
                    .catch(console.error)
                await interaction.reply(`已將 ${user} 踢出頻道`)
            } catch (error) {
                console.log(error)
                await interaction.reply("發生了一個錯誤，無法踢出用戶")
            }
        }
    }
}
