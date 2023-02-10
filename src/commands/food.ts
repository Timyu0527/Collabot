import {
    SlashCommandBuilder,
    CommandInteraction,
    SlashCommandStringOption,
    SlashCommandNumberOption,
    EmbedBuilder,
    CommandInteractionOptionResolver,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedAuthorOptions,
    RestOrArray,
    APIEmbedField,
    EmbedField
} from 'discord.js'
import { SlashCommand } from '../types/command'
import { db } from '../index'
import { addRestaurant, checkOrderStarted, getRestaurant,orderAdd,startOrder,orderResult, getOrderInfo } from '../service/food'
import { DocumentData, Firestore } from 'firebase/firestore'
import { orderValue } from '../types/orderValue'

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
        .addSubcommandGroup((group) =>
            group
                .setName('order')
                .setDescription('點餐相關指令')
                .addSubcommand((command) =>
                    command
                        .setName('start')
                        .setDescription('開始點餐')
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('name')
                                .setDescription('店家名稱')
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('add')
                        .setDescription('點餐')
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('name')
                                .setDescription('餐點名稱')
                                .setRequired(true)
                                .setMaxLength(10)
                        )
                        .addNumberOption((option: SlashCommandNumberOption) =>
                            option
                                .setName('quantity')
                                .setDescription('餐點數量')
                                .setRequired(true)
                                .setMinValue(1)
                        )
                        .addStringOption((option: SlashCommandStringOption) =>
                            option
                                .setName('memo')
                                .setDescription('備註')
                                .setRequired(false)
                                .setMaxLength(20)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('result')
                        .setDescription('結束點餐，並顯示結果')
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
                        let addCheckExist: Array<DocumentData> = await getRestaurant(db, addName, interaction.guildId ?? '', interaction.user.id);
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
                        console.log(err)
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
        }
        else if(opts.getSubcommandGroup()==='order'){
            if (opts.getSubcommand() === 'start') {
                try{
                    let orderStarted=await checkOrderStarted(db, interaction.guildId ?? '', interaction.user.id);
                    if(orderStarted){
                        let embed = new EmbedBuilder()
                            .setTitle('已有點餐活動進行')
                            .setDescription('請先使用 \`/food order result\`結束訂單')
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }else{
                        const orderName: string = opts.getString('name', true);
                        let restaurantInfo=await startOrder(db, interaction.guildId ?? '', interaction.user.id, orderName);
                        if(restaurantInfo.length==0){
                            let embed = new EmbedBuilder()
                                .setTitle('無法開始點餐')
                                .setDescription(`無餐廳: "${orderName}"`)
                                .setColor('#ff0000')
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            return;
                        }
                        let embed = new EmbedBuilder()
                            .setTitle('已開始點餐')
                            .setFields([
                                {
                                    name: '店家名稱',
                                    value: restaurantInfo[0]['name']
                                },
                                {
                                    name: '店家電話',
                                    value: restaurantInfo[0]['tel']
                                }
                            ])
                            .setDescription(`請使用 \`/food order add [餐點名稱] [數量] [備註]\` 新增餐點`)
                            .setImage(restaurantInfo[0]['image'])
                            .setColor('#00ff00')
                            .setTimestamp();
                        await interaction.channel?.send({ content:'@everyone', embeds: [embed] });
                    }
                }catch(err){
                    let errEmbed = new EmbedBuilder()
                        .setTitle('Something wrong')
                        .setDescription(':thinking:')
                        .setColor('#ff0000')
                        .setTimestamp();
                    await interaction.reply({ embeds: [errEmbed] });
                    return;
                }



                
                // let orderRes: DocumentData[];
                // try {
                //     orderRes = await getRestaurant(db, orderName, interaction.guildId ?? '', interaction.user.id);
                // } catch (err) {
                //     let errEmbed = new EmbedBuilder()
                //         .setTitle('Something wrong')
                //         .setDescription(':thinking:')
                //         .setColor('#ff0000')
                //         .setTimestamp();
                //     await interaction.reply({ embeds: [errEmbed] });
                //     return;
                // }
                // if (orderRes.length < 1) {
                //     let embed = new EmbedBuilder()
                //         .setTitle(`查無此餐廳: ${orderName}`)
                //         .setDescription('無法開放點餐')
                //         .setColor('#ff0000')
                //         .setTimestamp();
                //     await interaction.reply({ embeds: [embed], ephemeral: true });
                // } else {
                //     let embeds: EmbedBuilder[] = [];
                //     for (let i = 0; i < orderRes.length; ++i) {
                //         let telInEmbed: string = "";
                //         if (orderRes[i]['tel'] == '無') {
                //             telInEmbed = orderRes[i]['tel'];
                //         } else {
                //             telInEmbed = `<tel://${orderRes[i]['tel']}>`;
                //         }
                //         let embed = new EmbedBuilder()
                //             .setTitle(`開放點餐`)
                //             .setImage(orderRes[i]['image'])
                //             .setFields(
                //                 { name: '餐廳名稱', value: orderRes[i]['name'] },
                //                 { name: '電話', value: telInEmbed }
                //             )
                //             .setColor('#0000ff')
                //             .setTimestamp();
                //         embeds.push(embed);
                //     }
                //     let row = new ActionRowBuilder<ButtonBuilder>();
                //     let resultBtn = new ButtonBuilder()
                //         .setCustomId('food.order.result')
                //         .setLabel('點餐結果')
                //         .setStyle(ButtonStyle.Danger);
                //     row.addComponents(resultBtn);
                //     await interaction.reply({ components: [row], embeds: embeds, ephemeral: false });
                // }
            }else if(opts.getSubcommand()==='add'){
                try{
                    const foodName: string = opts.getString('name', true);
                    const foodAmount: number = opts.getNumber('quantity', true);
                    const foodMemo: string = opts.getString('memo', false)??'';
                    let orderStarted = await checkOrderStarted(db, interaction.guildId ?? '', interaction.user.id);
                    if (!orderStarted) {
                        let embed = new EmbedBuilder()
                            .setTitle('尚未開始點餐')
                            .setDescription('請先使用 \`/food order start [餐廳名稱]\`開始點餐')
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }
                    await orderAdd(db, interaction.guildId ?? '', interaction.user.id, foodName, foodAmount, foodMemo);
                    let embed = new EmbedBuilder()
                        .setTitle('已新增到點餐清單')
                        .setDescription(`餐點名稱: ${foodName}\n餐點數量: ${foodAmount}\n備註: ${foodMemo}`)
                        .setColor('#00ff00')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }catch(err){
                    let errEmbed = new EmbedBuilder()
                        .setTitle('Something wrong')
                        .setDescription(':thinking:')
                        .setColor('#ff0000')
                        .setTimestamp();
                    await interaction.reply({ embeds: [errEmbed] });
                    return;
                }
            }else if(opts.getSubcommand()==='result'){
                try{
                    let orderStarted = await checkOrderStarted(db, interaction.guildId ?? '', interaction.user.id);
                    if (!orderStarted) {
                        let embed = new EmbedBuilder()
                            .setTitle('尚未開始點餐')
                            .setDescription('請先使用 \`/food order start [餐廳名稱]\`開始點餐')
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }
                    let orderInfo=await getOrderInfo(db, interaction.guildId ?? '', interaction.user.id);
                    let fields:Array<EmbedField> = [];
                    let nameField:EmbedField = {
                        name: `餐廳名稱: ${orderInfo[0]['name']}`,
                        value: ' ',
                        inline: false
                    };
                    let telInEmbed: string = "";
                    if (orderInfo[0]['tel'] == '無') {
                        telInEmbed = orderInfo[0]['tel'];
                    } else {
                        telInEmbed = `<tel://${orderInfo[0]['tel']}>`;
                    }
                    let telField:EmbedField = {
                        name: `電話: ${telInEmbed}`,
                        value: ' ',
                        inline: false
                    };
                    fields.push(nameField);
                    fields.push(telField);
                    let orderRes = await orderResult(db, interaction.guildId ?? '', interaction.user.id);
                    let codeblockText:string="";
                    codeblockText+='\`\`\`';
                    codeblockText+=`[餐點名稱]["數量"]["備註"]\n`;
                    orderRes.forEach((value:orderValue)=>{
                        codeblockText+=`[${value.item}][${value.quantity}][${value.memo}]\n`;
                    });
                    codeblockText += '\`\`\`';
                    let codeblockField:EmbedField = {
                        name: ' ',
                        value: codeblockText,
                        inline: false
                    };
                    fields.push(codeblockField);
                    let embed:EmbedBuilder = new EmbedBuilder()
                        .setTitle('點餐結果')
                        .setFields(fields)
                        .setColor('#0000ff')
                        .setImage(orderInfo[0]['image'])
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: false });
                }catch(err){
                    let errEmbed = new EmbedBuilder()
                        .setTitle('Something wrong')
                        .setDescription(':thinking:')
                        .setColor('#ff0000')
                        .setTimestamp();
                    await interaction.reply({ embeds: [errEmbed] });
                    return;
                }
            }
        }
    }
}