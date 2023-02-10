import { ActionRowBuilder, APISelectMenuOption, CommandInteraction, StringSelectMenuBuilder } from 'discord.js'
import { getLists } from '../service/board'
import { List } from '../types/model/board'

export const createListSelectMenu= async (interaction: CommandInteraction, boardId: string): Promise<void> => {
    const lists: Array<List> = await getLists(boardId)
    let opts = new Array<APISelectMenuOption>()
    lists.forEach((list: List) => {
        opts.push({
            label: list.name,
            value: list.id
        })
    })
    const boardMenu = new StringSelectMenuBuilder()
            .setCustomId('listMenu')
            .setPlaceholder('Nothing selected')
            .addOptions(opts)

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(boardMenu)

    await interaction.reply({ content: 'Choose a list', components: [row] })
}
