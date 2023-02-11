import { SlashCommandBuilder, CommandInteraction, MessageReaction, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js'
import { SlashCommand } from '../types/command'
import { EmbedField } from '../types/utility'

export const PollSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('the title of the poll'))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Separated by commas(maximum:20)'))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('the due time(the format is yyyy:mm:dd:hh:mm:ss)'))
        .setDescription('start poll')
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
            let t: Array<string> = time.split(':');
            let timestamp = new Array<number>()
            t.forEach((value: string) => {
                timestamp.push(Number(value))
            })
            if (timestamp.length !== 6) {
                for (let i = timestamp.length; i < 6; i++) {
                    timestamp.push(0);
                }
            }
            let alarm = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5]);
            console.log(alarm);
            let timeZone = 8 * 3600 * 1000//Asia/Taipei
            DueTime = alarm.getTime() - new Date().getTime()-timeZone
            if (DueTime < 0) {
                await interaction.reply({ content: '這段時間已經過去了!請輸入正常時間!' });
                return;
            }
        }
        else {
            DueTime = 30 * 1000;
        }
        var choices: Array<string> = choice.split(',');
        const polestart: number = 0x1F44D
        let embedFields = new Array<EmbedField>()
        for (let i = 0; i < Math.min(20, choices.length); i++) {
            const reaction: number = polestart + i
            let embedField: EmbedField = {
                name: choices[i] + '\t' + String.fromCodePoint(reaction),
                value: " "
            }
            embedFields.push(embedField);
        }
        // await message.react('👎');
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(title)
            .setDescription(`the poll will end in ${time} `)
            .addFields(embedFields);
        // const message = await interaction.reply({ content: 'react', fetchReply: true });
        const message = await interaction.reply({ embeds: [exampleEmbed], fetchReply: true });

        for (let i = 0; i < Math.min(20, choices.length); i++) {
            console.log((polestart + i).toString(16));
            const reaction: number = polestart + i
            var temp: string = (polestart + i).toString(16).toUpperCase();
            await message.react(String.fromCodePoint(reaction));

        }
        const filter = (reaction: MessageReaction) => {
            return true;
        }
        console.log("duetime", DueTime);
        const collector = message.createReactionCollector({ filter, time: DueTime });
        collector.on('end', async collected => {

            console.log(`Collected ${collected.size} items`);
            let maxnumber: number = 0;
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
            let maxstring: string = '';
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
            let embedFields = new Array<EmbedField>();
            for (let i = 0; i < Math.min(20, choices.length); i++) {
                const reaction: number = polestart + i
                let count = collected.get(String.fromCodePoint(reaction))?.count;
                if (count === undefined) {
                    count = 0;
                }
                let percent: number = (count-1) / (maxnumber-1) * 15;
                let PercentString: string = '';
                for (let i = 0; i < 15; i++) {
                    if (i < percent) {
                        PercentString += '█';
                    }
                    else {
                        PercentString += '░';
                    }
                }
                if (count === 0)
                    count++;
                PercentString += ` ${count - 1}`;
                console.log(percent);
                let embedField: EmbedField = {
                    name: choices[i],
                    value: PercentString
                }
                embedFields.push(embedField);
            }
            const EmbedResult = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${title}'s result`)
                .addFields(embedFields);
            interaction.channel?.send({ embeds: [EmbedResult] });
        }
        );
    }
}
