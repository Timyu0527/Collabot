import { collection, getDocs, Firestore, DocumentData,addDoc,where,query, Query } from 'firebase/firestore'

export async function addRestaurant(db: Firestore, name:string,tel:string,image:string,guildId: string,userId:string) {
    await addDoc(collection(db,'restaurant'), {
        userId: userId,
        guildId: guildId,
        name: name,
        tel: tel,
        image: image
    })
}

export async function getRestaurant(db: Firestore,name:string,guildId: string,userId:string) {
    let q:Query<DocumentData>
    if(guildId==''){
        q = query(collection(db, 'restaurant'), where('userId', '==', userId), where('name', '==', name))
    }else{
        q = query(collection(db, 'restaurant'),where('guildId','==',guildId),where('name','==',name))
    }
    let querySnapshot=await getDocs(q)
    let result:DocumentData[]=[]
    querySnapshot.forEach((doc)=>{
        result.push(doc.data())
    })
    return result
}