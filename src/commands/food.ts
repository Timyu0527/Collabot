import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption, EmbedBuilder, Embed, CommandInteractionOptionResolver } from 'discord.js'
import { SlashCommand } from '../types/command'
import { db } from '../index'
import { addRestaurant } from '../firebase/utility'
import { getRestaurant } from '../firebase/utility'
import { DocumentData } from 'firebase/firestore'

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

        .setDescription('吃東西相關指令'),
    execute: async (interaction: CommandInteraction) => {
        const opts=interaction.options as CommandInteractionOptionResolver;
        if(opts.getSubcommandGroup() === 'restaurant'){
            switch(opts.getSubcommand()){
                case 'add':
                    const addName = opts.getString('name')??'';
                    const addPhone = opts.getString('phone') ?? "無";
                    const addImage = opts.getAttachment('image');
                    let addImageUrl='';
                    if(addImage!=null) addImageUrl=addImage.url;
                    await addRestaurant(db,addName, addPhone, addImageUrl,interaction.guildId??'',interaction.user.id);
                    const addEmbed = new EmbedBuilder()
                        .setTitle("已新增餐廳")
                        .setDescription(`店家名稱: ${addName}\n店家電話: ${addPhone}`)
                        .setImage(addImageUrl)
                        .setColor('#00ff00')
                        .setTimestamp();
                    await interaction.reply({embeds: [addEmbed]});
                    break;
                case 'info':
                    const infoName=opts.getString('name')??'';
                    let infoRes:DocumentData[]=await getRestaurant(db,infoName,interaction.guildId ?? '',interaction.user.id);
                    if(infoRes.length<1){
                        let embed=new EmbedBuilder()
                            .setTitle("查無此餐廳")
                            .setDescription(`查詢 "${infoName}" 餐廳無結果。`)
                            .setColor('#ff0000')
                            .setTimestamp();
                        await interaction.reply({embeds:[embed]});
                    }else{
                        let embeds:EmbedBuilder[]=[];
                        for(let i=0;i<infoRes.length;++i){
                            let telInEmbed:string="";
                            if(infoRes[i]['tel']=='無'){
                                telInEmbed=infoRes[i]['tel'];
                            }else{
                                telInEmbed =`<tel://${infoRes[i]['tel']}>`;
                            }
                            let embed=new EmbedBuilder()
                                .setTitle(`搜尋餐廳 "${infoName}" 的結果`)
                                .setDescription(`店家名稱: ${infoRes[i]['name']}\n店家電話: ${telInEmbed}`)
                                .setImage(infoRes[i]['image'])
                                .setColor('#0000ff')
                                .setTimestamp();
                            embeds.push(embed);
                        }
                        await interaction.reply({embeds:embeds});
                    }
                    break;
                default:
                    await interaction.reply('default');
                    break;
            }
        }
    }
}