import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, SlashCommandSubcommandBuilder, APIApplicationCommandBooleanOption, APIApplicationCommandOptionChoice } from 'discord.js'
import { SlashCommand } from '../types/command'
import { getAllBoards } from '../service/board'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '..'
import { trelloAPIKeyAndToken } from '../config'
import { Board } from '../types/model/board'

const getBoardChoices = (): Array<{ name: string, value: string }> => {
    let boardList = new Array<Board>()
    fetch(`https://api.trello.com/1/members/me?${trelloAPIKeyAndToken}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            )
            return response.text()
        })
        .then((text: string) => {
            let profile: any = JSON.parse(text)
            let boardIdList: Array<string> = profile.idBoards
            return boardIdList
        })
        .then(async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'boards'))
                querySnapshot.forEach((doc) => {
                    const board = doc.data() as Board
                    boardList.push(board)
                })
            }
            catch (e) {
                console.log('Error getting documents: ', e)
            }
        })
        .catch((err: string) => console.error(err))
    let boards = new Array<{ name: string, value: string }>()
    boardList.forEach((board: Board) => {
        boards.push({
            name: board.name,
            value: board.id
        })
    })
    return boards
}


export const ListSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list')
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName('get')
                .addStringOption((option) =>
                    option
                        .setName('board_id')
                        // .addChoices({ name: 'test', value: 't' })
                        .setDescription('Board ID')
                )
        )
        .setDescription('List all board IDs and names.')
        .setDescription('list command.'),
    execute: async (interaction: CommandInteraction) => {
        const opts = interaction.options as CommandInteractionOptionResolver
        const subcommand: string = opts.getSubcommand()
        if (subcommand == 'get') {
            const boards = await getAllBoards()


            if (boards) {
                let boardsStr = new String('```\n')

                for (let i = 0; i < boards.length; ++i) {
                    boardsStr += `${i + 1}. ${boards[i].name} (${boards[i].id})\n`
                }
                boardsStr += '```'
                await interaction.reply({ content: boardsStr.toString() })
            }
            else await interaction.reply({ content: 'No boards found.' })
        }
    }
}