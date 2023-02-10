import fetch from 'node-fetch';
import { env } from '../config';
import { CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { CreateTrelloBoardResponse, GetTrelloBoardResponse } from '../types/response';
import { Board } from '../types/model';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '..';

export const getAllBoards = async (interaction: CommandInteraction) => {
    let boardList: Array<Board> = new Array<Board>();
    await fetch(`https://api.trello.com/1/members/me?key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response: { status: any; statusText: any; text: () => any; }) => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then((text: string) => {
            let object: any = JSON.parse(text);
            console.log(object.idBoards);
            let boardIdList: Array<string> = object.idBoards;
            return boardIdList;
        })
        .then(async (boardIdList: Array<string>) => {
            for (const boardId of boardIdList) {
                await fetch(`https://api.trello.com/1/boards/${boardId}?key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response: { status: any; statusText: any; text: () => any; }): any => {
                        console.log(
                            `Response: ${response.status} ${response.statusText}`
                        );
                        return response.text();
                    })
                    .then((text: string): void => {
                        const res: GetTrelloBoardResponse = JSON.parse(text);
                        const board: Board = { id: res.id, name: res.name };
                        boardList.push(board);
                        return;
                    })
            }
            return boardList;
        })
        .catch((err: string) => console.error(err));
    let boardListString: string = '```\n';
    for (let i = 0; i < boardList.length; i++) {
        boardListString += `${i + 1}. ${boardList[i].name} (${boardList[i].id})\n`;
    }
    boardListString += '```';
    return boardListString;
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
            );
            return response.text();
        })
        .then(async (text: string) => {
            const res: CreateTrelloBoardResponse = JSON.parse(text);
            boardId = res.id;
            
            if (boardId === null) return

            const board: Board = {
                id: boardId,
                name: boardName
            }
            try {
                const docRef = await addDoc(collection(db, 'boards'), board)
                console.log("Document written with ID: ", docRef.id)
            } catch (e) {
                console.error("Error adding document: ", e)
            }
        })
        .catch((err) => console.error(err));

}