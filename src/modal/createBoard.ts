import { ActionRowBuilder, CommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

export const createBoardModal = async (interaction: CommandInteraction): Promise<void> => {
    const modal = new ModalBuilder()
        .setCustomId('NEW_BOARD')
        .setTitle('Create New Board!');
    const boardNameInput = new TextInputBuilder()
        .setCustomId('BOARD_NAME')
        .setLabel('Board Name')
        .setStyle(TextInputStyle.Short);


    const boardNameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(boardNameInput);
    modal.addComponents(boardNameRow);

    await interaction.showModal(modal);
}