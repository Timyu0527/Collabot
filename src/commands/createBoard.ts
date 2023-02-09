
import fetch from 'node-fetch';
import { SlashCommandBuilder, CommandInteraction, SlashCommandStringOption } from 'discord.js';
import { SlashCommand } from '../types/command';
import { env } from '../config';
// const fetch = require('node-fetch');

export const CreateBoardSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('create_board')
    .addStringOption((option: SlashCommandStringOption) =>
        option
        .setName('board_name')
        .setDescription('Board name.')
        .setRequired(true)
    )
    .setDescription('Replies with Pong!'),
  execute: async (interaction: CommandInteraction) => {
    // await interaction.reply('created');
    let boardName: string = interaction.options.data.values().next().value.value;
    console.log(boardName);
    await fetch(`https://api.trello.com/1/boards/?name=${boardName}&key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`, {
        method: 'POST'
    })
    .then((response: { status: any; statusText: any; text: () => any; }) => {
        console.log(
            `Response: ${response.status} ${response.statusText}`
        );
        return response.text();
    })
    .then((text: string) => console.log(text))
    .catch((err: string) => console.error(err));
  }
}
