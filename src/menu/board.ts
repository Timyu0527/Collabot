import { ActionRowBuilder, APISelectMenuOption, CommandInteraction, StringSelectMenuBuilder } from 'discord.js'
import { getAllBoards } from '../service/board'

import { Board } from '../types/model/board'
export const getBoardSelectMenu= async (interaction: CommandInteraction): Promise<void> => {
    const boards: Array<Board> = await getAllBoards(interaction)
    let opts = new Array<APISelectMenuOption>()
    boards.forEach((board: Board) => {
        opts.push({
            label: board.name,
            value: board.id
        })
    })
    const boardMenu = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(opts)

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(boardMenu)

    await interaction.reply({ content: 'Choose a board', components: [row] })
}