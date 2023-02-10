import fetch from 'node-fetch';
import { env } from '../config';
import { CommandInteraction } from 'discord.js';
import { GetTrelloBoardResponse } from '../types/response';
import { Board } from '../types/model';

export const getAllBoards = async (interaction: CommandInteraction) => {
    let subcommand: string = interaction.options.getSubcommand();
    let boardList: Array<Board> = new Array<Board>();
    if(subcommand == 'list') {
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
            for(const boardId of boardIdList) {
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
        for(let i = 0; i < boardList.length; i++) {
            boardListString += `${i+1}. ${boardList[i].name} (${boardList[i].id})\n`;
        }
        boardListString += '```';
        // console.log(`boardListString: ${boardListString}`)
        // await interaction.reply(boardListString);
        return boardListString;
    }
}