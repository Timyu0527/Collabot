import { EmbedBuilder } from "@discordjs/builders"
import { Card, List } from "../types/model/board"

export const createBoardEmbed = (board: { name: string, Lists: Array<List> }) => {
    const Lists = board.Lists
    let fields = new Array<{ name: string, value: string }>()
    Lists.forEach((list: List) => {
        let value = `total: ${list.Cards.length} cards`
        fields.push({
            name: list.name,
            value: value,
        })
    })
    const boardEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(board.name)
        .setDescription(`Total: ${Lists.length} lists`)
        .addFields(fields)
    return boardEmbed
}

export const createListEmbed = (list: List) => {
    let fields = new Array<{ name: string, value: string }>()
    list.Cards.forEach((card: Card) => {
        let value: string = card.desc
        value.concat(`Due Date: ${card.due}`)
        fields.push({
            name: card.name,
            value: card.desc
        })
    })
    const listEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(list.name)
        .setDescription(`Total: ${list.Cards.length} cards`)
        .addFields(fields)
    return listEmbed
}