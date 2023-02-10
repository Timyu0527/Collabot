import { collection, getDocs, Firestore, DocumentData,addDoc,where,query, Query, deleteDoc } from 'firebase/firestore';

export async function addRestaurant(db: Firestore, name:string,tel:string,image:string,guildId: string,userId:string) {
    try{
        await addDoc(collection(db, 'restaurant'), {
            userId: userId,
            guildId: guildId,
            name: name,
            tel: tel,
            image: image
        });
    }catch(err){
        console.error("add restaurant error: ",err);
        throw err;
    }
}

export async function getRestaurant(db: Firestore,name:string,guildId: string,userId:string) {
    try{
        let q:Query<DocumentData>;
        if(guildId==''){
            q = query(collection(db, 'restaurant'), where('userId', '==', userId), where('name', '==', name));
        }else{
            q = query(collection(db, 'restaurant'),where('guildId','==',guildId),where('name','==',name));
        }
        let querySnapshot=await getDocs(q);
        let result:DocumentData[]=[];
        querySnapshot.forEach((doc)=>{
            result.push(doc.data());
        });
        return result;
    }catch(err){
        console.error('get restaurant error: ',err);
        throw err;
    }
}

export async function orderFood(db:Firestore,guildId:string,userId:string,item:string,quantity:number,memo:string) {
    try{
        await addDoc(collection(db, 'order'), {
            guildId: guildId,
            userId: userId,
            item: item,
            quantity: quantity,
            memo: memo
        });
    }catch(err){
        console.error('order food error: ',err);
        throw err;
    }
}

export async function orderResult(db:Firestore,guildId:string,userId:string) {
    try{
        let result=new Map<string,object>();
        let q:Query<DocumentData>;
        if (guildId == '') {
            q = query(collection(db, 'order'), where('userId', '==', userId));
        } else {
            q = query(collection(db, 'order'), where('guildId', '==', guildId));
            let querySnapshot = await getDocs(q);



            querySnapshot.forEach((doc) => {
                let data=doc.data();
                deleteDoc(doc.ref);
            });
        }

    }catch(err){
        console.error('order result error: ',err);
        throw err;
    } 
}