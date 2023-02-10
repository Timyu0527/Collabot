export type Board = {
    id: string,
    name: string,
    guildId: string
    Lists: Array<List>
}

export type List = {
    id: string,
    name: string, 
    boardId: string
    Cards: Array<Card>
}


export type Card = {
    id: string,
    name: string,
    boardId: string,
    listId: string,
    memberIds: Array<string>,
    checkLists: Array<CheckList>,
    checkListIds: Array<string>,
    labelIds: Array<string>,
    labels: Array<Label>,
    due: string,
    desc: string,
    url: string,
}

export type Label = {
    id: string,
    name: string,
    color: string,
    boardId: string
}

export type CheckList = {
    id: string,
    name: string,
    boardId: string,
    cardId: string,
    checkItems: Array<CheckItem>
}

export type CheckItem = {
    id: string,
    name: string,
    state: string,
    checkListId: string,
    memberId: string,
    due: string,
}
