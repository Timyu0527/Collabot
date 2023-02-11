import {
    SlashCommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    CommandInteractionOptionResolver,
} from 'discord.js'
import { AddAbsenceInfo, GetUserAbsenceInfo, GetDateAbsenceInfo,deleteAbsenceInfo } from '../service/absence'
import { SlashCommand } from '../types/command'
import { db } from '../index'
export const AbsenceSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('absence')
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('the time you want to absence(the format is yyyy:mm:dd)')
                .setRequired(true)
        )
        .setDescription('absence')
    ,
    async execute(interaction: CommandInteraction) {
        const opts = interaction.options as CommandInteractionOptionResolver;
        const time = opts.getString('time');
        if (time === null) {
            await interaction.reply({ content: '請輸入時間!' });
            return;
        }
        let timestamp: Array<string> = time.split(':');
        let alarm = new Date(Number(timestamp[0]), Number(timestamp[1]) - 1, Number(timestamp[2]))
        await AddAbsenceInfo(db, interaction.user.id, alarm).then(async () => {
            await interaction.reply({ content: '請假完成' });
        })
        const wait = (ms: number) => {
            return new Promise(async resolve => {
                setTimeout(resolve, ms);
            })
        }
        await wait(1000);
        await deleteAbsenceInfo(db, interaction.user.id);
    }
}
export const getAbsenceCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('getabsenceinfo')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('get user absence info')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('the user you want to get info')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('date')
                .setDescription('get date absence info')
                .addStringOption(option =>
                    option
                        .setName('date')
                        .setDescription('the date you want to get info')
                        .setRequired(true)
                ))
        .setDescription('get info'),
    async execute(interaction: CommandInteraction) {
        const opts = interaction.options as CommandInteractionOptionResolver;
        if (opts.getSubcommand() === 'user') {
            const user = opts.getUser('user');
            if (user === null) {
                await interaction.reply({ content: '請輸入使用者!' });
                return;
            }
            const absenceInfo = await GetUserAbsenceInfo(db, user.id);
            let dayarray: Array<string> = [];
            let day: string = '';
            for (let i = 0; i < absenceInfo.length; i++) {
                const element = absenceInfo[i].time.toDate();
                if (!dayarray.includes(element.getFullYear() + '/' + (element.getMonth() + 1) + '/' + element.getDate())) {
                    dayarray.push(element.getFullYear() + '/' + (element.getMonth() + 1) + '/' + element.getDate());
                }
            }
            dayarray.sort();
            for (let i = 0; i < dayarray.length; i++) {
                day += dayarray[i] + '\n';
            }
            const embed = new EmbedBuilder()
                .setTitle('Absence User')
                .setDescription(`${user}`)
                .addFields({ name: 'Absence Day', value: day+' ' })
                .setColor(0x00ff00)
            interaction.reply({ embeds: [embed] });
        }
        else if (opts.getSubcommand() === 'date') {
            const date = opts.getString('date');
            if (date === null) {
                await interaction.reply({ content: '請輸入時間!' });
                return;
            }
            let timestamp: Array<string> = date.split(':');
            let alarm = new Date(Number(timestamp[0]), Number(timestamp[1]) - 1, Number(timestamp[2]))
            const absenceInfo = await GetDateAbsenceInfo(db, alarm);
            let userarray: Array<string> = [];
            let user: string = '';
            for (let i = 0; i < absenceInfo.length; i++) {
                if (!userarray.includes(absenceInfo[i].userId)) {
                    userarray.push(absenceInfo[i].userId);
                    user += `<@${absenceInfo[i].userId}>` + '\n';
                }
            }
            const embed = new EmbedBuilder()
                .setTitle('Absence Day')
                .setDescription(alarm.getFullYear() + '/' + (alarm.getMonth() + 1) + '/' + alarm.getDate())
                .addFields({ name: 'Absence User', value: user })
                .setColor(0x00ff00)
            interaction.reply({ embeds: [embed] });
            console.log(user);
        }
    }
}
