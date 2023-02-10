import { ActionRowBuilder, APISelectMenuOption, CommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

export const createBoardModal = async (interaction: CommandInteraction): Promise<void> => {
    const modal = new ModalBuilder()
        .setCustomId('newBoardModal')
        .setTitle('Create New Board!')
    const boardNameInput = new TextInputBuilder()
        .setCustomId('boardName')
        .setLabel('Board Name')
        .setStyle(TextInputStyle.Short)


    const boardNameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(boardNameInput)
    modal.addComponents(boardNameRow)

    await interaction.showModal(modal)
}
