import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption } from 'discord.js'
import { SlashCommand } from '../types/command'
import { getCities } from '../firebase/utils'
import { db } from '../index'

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
  async execute(interaction: CommandInteraction) {
    console.log(getCities(db, 'test'));
    await interaction.reply('Pong!');
  }
}