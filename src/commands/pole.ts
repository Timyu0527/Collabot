import { SlashCommandBuilder, CommandInteraction, MessageReaction, ClientUser, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js'
import { SlashCommand } from '../types/command'
import { EmbedField } from '../types/utility'

export const pole: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('pole')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('the title of the pole'))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Separated by commas(maximum:20)'))
        .setDescription('start pole')
    ,
    async execute(interaction: CommandInteraction) {
        // const title = interaction.options.data.values().next().value.value;
        // const choice = interaction.options.data.values().next().value.value;
        const opts = interaction.options as CommandInteractionOptionResolver;
        const title = opts.getString('title');
        const choice = opts.getString('choice');
        if (choice === null) {
            interaction.reply("there is no choice");
            return;
        }
        var choices: Array<string> = choice.split(',');
        const polestart: number = 0x1F44D
        let embedFields = new Array<EmbedField>()
        for (let i = 0; i < Math.min(20, choices.length); i++) {
            const reaction: number = polestart + i
            let embedField: EmbedField = {
                name: choices[i],
                value: String.fromCodePoint(reaction)
            }
            embedFields.push(embedField);
        }
        // await message.react('👎');
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(title)
            .setDescription('Some description here')
            .addFields(embedFields);
        // const message = await interaction.reply({ content: 'react', fetchReply: true });
        const message = await interaction.reply({ embeds: [exampleEmbed], fetchReply: true });
        
        for (let i = 0; i < Math.min(20, choices.length); i++) {
            console.log((polestart + i).toString(16));
            const reaction: number = polestart + i
            var temp: string = (polestart + i).toString(16).toUpperCase();
            await message.react(String.fromCodePoint(reaction));

        }


        // for (let i = 0; i < Math.min(20, choices.length);i++){
        //     exampleEmbed.addFields({name:choices[i], value:String.fromCodePoint("0x" + temp)});
        // }
        const filter = (reaction:MessageReaction) => {
            return true;
        }
        const collector = message.createReactionCollector({ filter });
        collector.on('collect', (reaction) => {
            console.log(reaction.emoji.name, reaction.emoji.id)
            reaction.users.cache.forEach((element) => {
                console.log(element.id);
            });
        });
    }
}
