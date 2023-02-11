import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption } from 'discord.js'
import { SlashCommand } from '../types/command'

export const PingSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName('person')
        .setDescription('chooice a person who you want to tag')
        .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName('message')
        .setDescription('message')
        .setRequired(true)
    )
    .setDescription('Replies with Pong!'),
  execute: async(interaction: CommandInteraction) => {
    // console.log(getCities(db, 'test'))
    await interaction.reply('Pong!')
  }
}