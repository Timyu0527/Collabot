import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption, EmbedBuilder, CommandInteractionOptionResolver, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedAuthorOptions } from 'discord.js'
import { SlashCommand } from '../types/command'
import { db } from '../index'
import { addRestaurant, } from '../service/food'
import { DocumentData, Firestore } from 'firebase/firestore'

export const FoodSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('food')
        .addSubcommandGroup((group) =>
            group
                .setName('restaurant')
                .setDescription('餐廳相關指令')
                .addSubcommand((command) =>
                    command
                        .setName('add')
                        .setDescription('新增餐廳')
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('name')
                                .setDescription('店家名稱')
                                .setRequired(true)
                        )
                        .addAttachmentOption((option) =>
                            option
                                .setName('image')
                                .setDescription('菜單圖片')
                                .setRequired(true)
                        )
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('phone')
                                .setDescription('店家電話')
                                .setRequired(false)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('info')
                        .setDescription('查詢餐廳資訊')
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('name')
                                .setDescription('店家名稱')
                                .setRequired(true)
                        )
                )
        )
        .addSubcommand((command) =>
            command
                .setName('order')
                .setDescription('開放點餐')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('name')
                        .setDescription('店家名稱')
                        .setRequired(true)
                )
        )
        .setDescription('吃東西相關指令'),
    execute: async (interaction: CommandInteraction) => {
        const opts = interaction.options as CommandInteractionOptionResolver;
        if (opts.getSubcommandGroup() === 'restaurant') {
            switch (opts.getSubcommand()) {
                case 'add':
                    const addName = opts.getString('name', true);
                    const addPhone = opts.getString('phone', false) ?? "無";
                    const addImage = opts.getAttachment('image', true);
                    let addImageUrl = '';
                    if (addImage != null) addImageUrl = addImage.url;
                    try {
                        let addCheckExist: DocumentData[] = await getRestaurant(db, addName, interaction.guildId ?? '', interaction.user.id);
                        if (addCheckExist.length != 0) {
                            let cannotAddEmbed = new EmbedBuilder()
                                .setTitle(`無法新增${addName}`)
                                .setDescription(`${addName}已存在`)
                                .setColor('#ff0000')
                                .setTimestamp()
                            await interaction.reply({ embeds: [cannotAddEmbed] })
                            return;
                        }
                        await addRestaurant(db, addName, addPhone, addImageUrl, interaction.guildId ?? '', interaction.user.id);
                    } catch (err) {
                        let errEmbed = new EmbedBuilder()
                            .setTitle('Something wrong')
                            .setDescription(':thinking:')
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [errEmbed] });
                        return;
                    }
                    let userInfo: EmbedAuthorOptions = {
                        name: interaction.user.username
                    };
                    if (interaction.user.avatar != null) {
                        userInfo.iconURL = interaction.user.displayAvatarURL({ size: 1024 });
                    }
                    const addEmbed = new EmbedBuilder()
                        .setTitle("已新增餐廳")
                        .setAuthor(userInfo)
                        .setDescription(`店家名稱: ${addName}\n店家電話: ${addPhone}`)
                        .setImage(addImageUrl)
                        .setColor('#00ff00')
                        .setTimestamp();
                    await interaction.reply({ embeds: [addEmbed] });
                    break;
                case 'info':
                    const infoName = opts.getString('name') ?? '';
                    let infoRes: DocumentData[];
                    try {
                        infoRes = await getRestaurant(db, infoName, interaction.guildId ?? '', interaction.user.id);
                    } catch (err) {
                        let errEmbed = new EmbedBuilder()
                            .setTitle('Something wrong')
                            .setDescription(':thinking:')
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [errEmbed] });
                        return;
                    }
                    if (infoRes.length < 1) {
                        let embed = new EmbedBuilder()
                            .setTitle("查無此餐廳")
                            .setDescription(`查詢 "${infoName}" 餐廳無結果。`)
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        let embeds: EmbedBuilder[] = [];
                        for (let i = 0; i < infoRes.length; ++i) {
                            let telInEmbed: string = "";
                            if (infoRes[i]['tel'] == '無') {
                                telInEmbed = infoRes[i]['tel'];
                            } else {
                                telInEmbed = `<tel://${infoRes[i]['tel']}>`;
                            }
                            let embed = new EmbedBuilder()
                                .setTitle(`搜尋餐廳 "${infoName}" 的結果`)
                                .setDescription(`店家名稱: ${infoRes[i]['name']}\n店家電話: ${telInEmbed}`)
                                .setImage(infoRes[i]['image'])
                                .setColor('#0000ff')
                                .setTimestamp()
                            embeds.push(embed)
                        }
                        await interaction.reply({ embeds: embeds })
                    }
                    break
                default:
                    await interaction.reply('default')
                    break
            }
        } else if (opts.getSubcommand() === 'order') {
            const orderName: string = opts.getString('name', true);
            let orderRes: DocumentData[];
            try {
                orderRes = await getRestaurant(db, orderName, interaction.guildId ?? '', interaction.user.id);
            } catch (err) {
                let errEmbed = new EmbedBuilder()
                    .setTitle('Something wrong')
                    .setDescription(':thinking:')
                    .setColor('#ff0000')
                    .setTimestamp();
                await interaction.reply({ embeds: [errEmbed] });
                return;
            }
            if (orderRes.length < 1) {
                let embed = new EmbedBuilder()
                    .setTitle(`查無此餐廳: ${orderName}`)
                    .setDescription('無法開放點餐')
                    .setColor('#ff0000')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                let embeds: EmbedBuilder[] = [];
                for (let i = 0; i < orderRes.length; ++i) {
                    let telInEmbed: string = "";
                    if (orderRes[i]['tel'] == '無') {
                        telInEmbed = orderRes[i]['tel'];
                    } else {
                        telInEmbed = `<tel://${orderRes[i]['tel']}>`;
                    }
                    let embed = new EmbedBuilder()
                        .setTitle(`開放點餐`)
                        .setImage(orderRes[i]['image'])
                        .setFields(
                            { name:'餐廳名稱', value: orderRes[i]['name'] },
                            {name:'電話',value:telInEmbed}
                        )
                        .setColor('#0000ff')
                        .setTimestamp();
                    embeds.push(embed);
                }
                let row = new ActionRowBuilder<ButtonBuilder>();

                let acceptBtn = new ButtonBuilder()
                    .setCustomId('food.order.accept')
                    .setLabel('我要點餐')
                    .setStyle(ButtonStyle.Primary);
                let resultBtn=new ButtonBuilder()
                    .setCustomId('food.order.result')
                    .setLabel('點餐結果')
                    .setStyle(ButtonStyle.Danger);
                row.addComponents(acceptBtn);
                row.addComponents(resultBtn);
                await interaction.reply({ components: [row], embeds: embeds, ephemeral: false });
            }
        }
    }
}

function getRestaurant(db: Firestore, infoName: string, arg2: string, id: string): DocumentData[] | PromiseLike<DocumentData[]> {
    throw new Error('Function not implemented.')
}
