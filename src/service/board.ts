import fetch from 'node-fetch'
import { env, trelloAPIKeyAndToken } from '../config'
import { CommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js'
import { CreateTrelloBoardResponse } from '../types/response'
import { Board } from '../types/model/board'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '..'

export const getBoard = async (interaction: StringSelectMenuInteraction) => {
    const boardId = interaction.values[0]
    let board = new String('')
    await fetch(`https://api.trello.com/1/boards/${boardId}/cards?${trelloAPIKeyAndToken}`, {
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
            const res: Array<any> = JSON.parse(text)
            // console.log(text)
            console.log(res)
            board = text
        })
        .catch((err) => {
            console.error(err)
        })

    return board.toString()
}

export const getAllBoards = async (interaction: CommandInteraction): Promise<Array<Board>> => {
    let boardList: Array<Board> = new Array<Board>()
    await fetch(`https://api.trello.com/1/members/me?${trelloAPIKeyAndToken}`, {
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
            // console.log(profile.idBoards)
            let boardIdList: Array<string> = profile.idBoards
            return boardIdList
        })
        .then(async () => {
            try{
                const querySnapshot = await getDocs(collection(db, 'boards'))
                querySnapshot.forEach((doc) => {
                    const board = doc.data() as Board
                    boardList.push(board)
                })
            }
            catch(e){
                console.log('Error getting documents: ', e)
            }
        })
        .catch((err: string) => console.error(err))
    return boardList
}

export const createBoard = async (interaction: ModalSubmitInteraction): Promise<void> => {
    let boardId: string | null = null
    const boardName = interaction.fields.getTextInputValue('boardName') as string

    await fetch(`https://api.trello.com/1/boards/?name=${boardName}&key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`, {
        method: 'POST'
    })
        .then((response) => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            )
            return response.text()
        })
        .then(async (text: string) => {
            const res: CreateTrelloBoardResponse = JSON.parse(text)
            boardId = res.id
            
            if (boardId === null) return

            const board: Board = {
                id: boardId,
                name: boardName,
                guildId: interaction.guildId as string
            }
            try {
                const docRef = await addDoc(collection(db, 'boards'), board)
                console.log("Document written with ID: ", docRef.id)
            } catch (e) {
                console.error("Error adding document: ", e)
            }
        })
        .catch((err) => console.error(err))

}