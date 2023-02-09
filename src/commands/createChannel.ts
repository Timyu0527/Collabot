import { SlashCommandBuilder, CommandInteraction, GuildCreateOptions, PermissionFlagsBits, PartialRoleData } from 'discord.js'
import { SlashCommand } from '../types/command'
import { client, appConfig } from '../index'

export const ChannelSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('create').setDescription('創建一個文字頻道!')
        .addStringOption(option => option.setName('頻道名稱').setDescription('即將創立的頻道名稱').setRequired(true))
        .addBooleanOption(option => option.setName('公開選項').setDescription("設定此頻道是否為公開").setRequired(true))
        .addStringOption(option => option.setName('頻道標題').setDescription('設置頻道內的小標題')),
    async execute(interaction: CommandInteraction) {
        const guild = await client.guilds.fetch(`${appConfig.guildId}`);//client id
        const everyoneRole = guild.roles.everyone;
        let m: GuildCreateOptions = { "name": `${interaction.options.getString('頻道名稱')}}` }
        const channel = await guild.channels.create(m);
        channel.setTopic(`${interaction.options.getString('頻道標題')}`);
        if (interaction.options.getBoolean('公開選項') == false) {
            try {
                channel.permissionOverwrites.set([
                    {
                        id: everyoneRole.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ]);
            }
            catch (error) {
                await interaction.reply("發生了一個錯誤，無法添加頻道");
            }
        }
        await interaction.reply('創建成功')
    }
}
