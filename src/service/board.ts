import fetch from 'node-fetch'
import { env, trelloAPIKeyAndToken } from '../config'
import { CommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js'
import { Board, Card, CheckList, List } from '../types/model/board'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '..'

const getBoardName = async (boardId: string): Promise<string> => {
    let boardName = ''
    await fetch(`https://api.trello.com/1/board/${boardId}?${trelloAPIKeyAndToken}`, {
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
            const res: any = JSON.parse(text)
            boardName = res.name
        })
        .catch((err) => {
            console.error(`Error: ${err}`)
        })
    return boardName
}

const getCards = async (boardId: string): Promise<Map<string, Array<Card>>> => {
    let listsDetail = new Map<string, Array<Card>>()
    await fetch(`https://api.trello.com/1/board/${boardId}/cards?${trelloAPIKeyAndToken}`, {
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
            res.forEach((card: any) => {
                if (listsDetail.has(card.idList)) {
                    let cardList = listsDetail.get(card.idList)
                    cardList?.push({
                        id: card.id,
                        name: card.name,
                        boardId: card.idBoard,
                        listId: card.idList,
                        memberIds: card.idMembers,
                        checkLists: new Array<CheckList>(),
                        checkListIds: card.idChecklists,
                        labelIds: card.idLabels,
                        labels: card.labels,
                        due: card.due,
                        desc: card.desc,
                        url: card.url,
                    })
                }
                else {
                    listsDetail.set(card.idList, [{
                        id: card.id,
                        name: card.name,
                        boardId: card.idBoard,
                        listId: card.idList,
                        memberIds: card.idMembers,
                        checkLists: new Array<CheckList>(),
                        checkListIds: card.idChecklists,
                        labelIds: card.idLabels,
                        labels: card.labels,
                        due: card.due,
                        desc: card.desc,
                        url: card.url,
                    }])
                }
            })
        })
        .catch((err) => {
            console.error(err)
        })
    return listsDetail
}

const getLists = async (boardId: string): Promise<Array<List>> => {
    let lists = new Array<List>()
    await fetch(`https://api.trello.com/1/boards/${boardId}/lists?${trelloAPIKeyAndToken}`, {
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
            res.forEach((list: any) => {
                lists.push({
                    id: list.id,
                    name: list.name,
                    boardId: list.idBoard,
                    Cards: new Array<Card>()
                })
            })
        })
        .catch((err) => {
            console.error(err)
        })
    return lists
}

const getCheckLists = async (boardId: string) => {
    let checkLists = new Map<string, Array<CheckList>>()
    await fetch(`https://api.trello.com/1/boards/${boardId}/checklists?${trelloAPIKeyAndToken}`, {
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
            const res: any  = JSON.parse(text)
            console.log(res[0].checkItems)
            res.forEach((checkList: any) => {
                if(checkLists.has(checkList.idCard)) {
                    let checkListList = checkLists.get(checkList.idCard)
                    checkList?.push({
                        id: checkList.id,
                        name: checkList.name,
                        boardId: checkList.idBoard,
                        cardId: checkList.idCard,
                        checkItems: checkList.checkItems
                    })
                }
                else {
                    checkLists.set(checkList.idCard, [{
                        id: checkList.id,
                        name: checkList.name,
                        boardId: checkList.idBoard,
                        cardId: checkList.idCard,
                        checkItems: checkList.checkItems
                    }])
                }
            })
        })
        .catch((err) => {
            console.error(err)
        })
    return checkLists
}

// export getMembers = async (boardId: string) => {
//     let members = new Array<Member>()V


export const getBoard = async (interaction: StringSelectMenuInteraction) => {
    // console.log(interaction)
    const boardId = interaction.values[0]
    const boardName = await getBoardName(boardId)
    let cards: Map<string, Array<Card>> = await getCards(boardId)
    let lists: Array<List> = await getLists(boardId)
    let checkLists: Map<string, Array<CheckList>> = await getCheckLists(boardId)

    checkLists.forEach((checkList: Array<CheckList>, cardId: string) => {
        if (cards.has(cardId)) {
            let cardList = cards.get(cardId)
            cardList?.forEach((card: Card) => {
                if (card.id === cardId) {
                    card.checkLists = checkList
                }
            })
        }
    })

    lists.forEach((list: List) => {
        if (cards.has(list.id)) {
            list.Cards = cards.get(list.id)!
        }
    })
    const board = {
        name: boardName,
        Lists: lists
    }

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
            const res: any = JSON.parse(text)
            boardId = res.id

            if (boardId === null) return

            const board = {
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