import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { db } from '../index'
import { addRestaurant } from '../firebase/utils'

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
                // .addSubcommand((command) =>
                //     command
                //         .setName('info')
                //         .setDescription('查詢餐廳資訊')
                //         .addStringOption((option: SlashCommandStringOption) =>
                //             option
                //                 .setName('name')
                //                 .setDescription('店家名稱')
                //                 .setRequired(false)
                //         )
                // )
        )

        .setDescription('吃東西相關指令'),
    execute: async (interaction: CommandInteraction) => {
        if(interaction.options.getSubcommandGroup() === 'restaurant'){
            switch(interaction.options.getSubcommand()){
                case 'add':
                    const name = interaction.options.getString('name');
                    const phone = interaction.options.getString('phone') ?? "無";
                    const image = interaction.options.getAttachment('image');
                    addRestaurant(db,name, phone, image.url,interaction.guildId);
                    const embed = new EmbedBuilder()
                        .setTitle("已新增餐廳")
                        .setDescription(`店家名稱: ${name}\n店家電話: ${phone}`)
                        .setImage(image.url)
                        .setColor('#00ff00')
                        .setTimestamp();
                    await interaction.reply({embeds: [embed]});
                    break;
                case 'info':
                    await interaction.reply('info');
                    break;
                default:
                    await interaction.reply('default');
                    break;
            }
        }
    }
}