import { SlashCommandBuilder, CommandInteraction, MessageReaction, ClientUser, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js'
import { SlashCommand } from '../types/command'
import { EmbedField } from '../types/utility'

export const PoleSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('pole')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('the title of the pole'))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Separated by commas(maximum:20)'))
        .addStringOption(option =>
            option.setName('time')
            .setDescription('the due time'))
        .setDescription('start pole')
    ,
    async execute(interaction: CommandInteraction) {
        // const title = interaction.options.data.values().next().value.value;
        // const choice = interaction.options.data.values().next().value.value;
        const opts = interaction.options as CommandInteractionOptionResolver;
        const title = opts.getString('title');
        const choice = opts.getString('choice');
        const time = opts.getString('time');
        let DueTime: number = 0;
        if (choice === null) {
            interaction.reply("there is no choice");
            return;
        }
        if (time !== null) {
            let t:Array<string> = time.split(':');
            let timestamp = new Array<number>()
            t.forEach((value: string) => {
              timestamp.push(Number(value))
            })
            let alarm = new Date(timestamp[0], timestamp[1]-1, timestamp[2], timestamp[3], timestamp[4], timestamp[5])
            DueTime = alarm.getTime() - new Date().getTime()
            if (DueTime < 0){
                await interaction.reply({ content: '這段時間已經過去了!請輸入正常時間!' });
                return;
            }
        }
        else{
            DueTime = 30*1000;
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
            .setDescription(`the pole will end in ${time} `)
            .addFields(embedFields);
        // const message = await interaction.reply({ content: 'react', fetchReply: true });
        const message = await interaction.reply({ embeds: [exampleEmbed], fetchReply: true });
        
        for (let i = 0; i < Math.min(20, choices.length); i++) {
            console.log((polestart + i).toString(16));
            const reaction: number = polestart + i
            var temp: string = (polestart + i).toString(16).toUpperCase();
            await message.react(String.fromCodePoint(reaction));

        }
        const filter = (reaction:MessageReaction) => {
            return true;
        }
        console.log("duetime",DueTime);
        const collector = message.createReactionCollector({ filter , time: DueTime});
        collector.on('collect', (reaction) => {
            console.log(reaction.emoji.name, reaction.emoji.id)
            reaction.users.cache.forEach((element) => {
                console.log(element.id);
            });
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
            // console.log(collected.get('👍')?.count);
            let maxnumber:number = 0;
            for (let i = 0; i < Math.min(20, choices.length); i++) {
                const reaction: number = polestart + i
                const count = collected.get(String.fromCodePoint(reaction))?.count;
                if (count === undefined) {
                    continue;
                }
                if (maxnumber < count) {
                    maxnumber = count;
                }
            }
            let maxstring:string = '';
            for (let i = 0; i < Math.min(20, choices.length); i++) {
                const reaction: number = polestart + i
                const count = collected.get(String.fromCodePoint(reaction))?.count;
                if (count === undefined) {
                    continue;
                }
                if (maxnumber === count) {
                    maxstring += ' ' + choices[i];
                }
            }
            // console.log(collected);
            interaction.channel?.send(`🐔@everyone the winner is ${maxstring}🐔`);
        }
        );
    }
}
