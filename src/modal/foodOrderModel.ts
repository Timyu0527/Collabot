import { ActionRowBuilder, ButtonBuilder, CommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

export const foodOrderModal = async (interaction: CommandInteraction): Promise<void> => {
    const modal = new ModalBuilder()
        .setCustomId('food.order.modal')
        .setTitle('點餐');
    const foodNameInput = new TextInputBuilder()
        .setCustomId('food.order.modal.name')
        .setLabel('餐點名稱')
        .setStyle(TextInputStyle.Short);


    const foodNameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(foodNameInput);
    modal.addComponents(foodNameRow);

    await interaction.showModal(modal);
}