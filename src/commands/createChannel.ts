import { SlashCommandBuilder, CommandInteraction, GuildCreateOptions, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, CommandInteractionOptionResolver, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuOptionBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { client } from '../index'

export const ChannelSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('create')
        .addStringOption(option =>
            option
                .setName('頻道名稱')
                .setDescription('即將創立的頻道名稱')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('公開選項')
                .setDescription("設定此頻道是否為公開")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('頻道標題')
                .setDescription('設置頻道內的小標題')
        )
        .setDescription('創建一個文字頻道!'),
    async execute(interaction: CommandInteraction) {
        const guild = await client.guilds.fetch(`${interaction.guild?.id}`)//client id
        const everyoneRole = guild.roles.everyone
        const opts = interaction.options as CommandInteractionOptionResolver;
        let make: GuildCreateOptions = { "name": `${opts.getString('頻道名稱')}}` }
        const channel = await guild.channels.create(make)
        if (opts.getString('頻道標題') != null) {
            channel.setTopic(`${opts.getString('頻道標題')}`)
        }
        if (opts.getBoolean('公開選項') == false) {
            try {
                channel.permissionOverwrites.set([
                    {
                        id: everyoneRole.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ])
            }
            catch (error) {
                await interaction.reply("發生了一個錯誤，無法添加頻道")
            }
        }
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('關閉此頻道')
                    .setStyle(ButtonStyle.Primary)
            )
        channel?.send({ components: [row] })
        // const modal = new ModalBuilder()
        //     .setCustomId('myModal')
        //     .setTitle('My Modal');

        // const fa = new TextInputBuilder()
        //     .setCustomId('favoriteColorInput')
        //     // The label is the prompt the user sees for this input
        //     .setLabel("What's your favorite color?")
        //     // Short means only a single line of text
        //     .setStyle(TextInputStyle.Short);

        // const tt = new StringSelectMenuBuilder()
        //     .addOptions()
        // const firstActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(fa)
        // // const cc = new ActionRowBuilder().addComponents(tt);

        // // Add inputs to the modal
        // modal.addComponents(firstActionRow);
        // await interaction.showModal(modal);
        await interaction.reply('創建成功')
    }
}