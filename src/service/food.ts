import {
    collection,
    getDocs,
    Firestore,
    DocumentData,
    addDoc,
    where,
    query,
    Query,
    deleteDoc,
    setDoc,
    doc
} from 'firebase/firestore';
import { orderValue } from '../types/orderValue';

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

export async function startOrder(db:Firestore,guildId:string,userId:string,name:string) {
    try{
        let restaurantInfo=await getRestaurant(db,name,guildId,userId);
        if(restaurantInfo.length==0){
            return restaurantInfo;
        }
        if(guildId==''){
            await addDoc(collection(db, 'orderStarted'), {
                userId: userId,
                name:name
            });
        }else{
            await addDoc(collection(db, 'orderStarted'), {
                guildId: guildId,
                userId: userId,
                name:name
            });
        }
        return restaurantInfo;
        // setDoc(doc(db,'order','started'),{
        //     guildId: guildId,
        //     userId: userId,
        // });
    }catch(err){
        console.error('start order error: ',err);
        throw err;
    }
}

export async function checkOrderStarted(db:Firestore,guildId:string,userId:string) {
    try{
        let q:Query<DocumentData>;
        if(guildId==''){
            q = query(collection(db, 'orderStarted'), where('userId', '==', userId));
        }else{
            q = query(collection(db, 'orderStarted'),where('guildId','==',guildId));
        }
        let querySnapshot=await getDocs(q);
        
        // let result:DocumentData[]=[];
        // querySnapshot.forEach((doc)=>{
        //     result.push(doc.data());
        // });
        if (querySnapshot.size==0){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.error('check order state error: ',err);
        throw err;
    }
}

export async function orderAdd(db:Firestore,guildId:string,userId:string,item:string,quantity:number,memo:string) {
    try{
        return await addDoc(collection(db, 'order'), {
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
        let result=new Array<orderValue>();
        let q:Query<DocumentData>;
        if (guildId == '') {
            q = query(collection(db, 'order'), where('userId', '==', userId));
        } else {
            q = query(collection(db, 'order'), where('guildId', '==', guildId));
            let querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                let data=doc.data();
                let item:string=data.item;
                let quantity:number=data.quantity;
                let memo:string=data.memo;
                let found=false;
                for(let i=0;i<result.length;i++){
                    if(result[i].item==item&&result[i].memo==memo){
                        result[i].quantity+=quantity;
                        found=true;
                        break;
                    }
                }
                if(!found){
                    result.push({
                        item: item,
                        quantity: quantity,
                        memo: memo
                    });
                }
                deleteDoc(doc.ref);
            });
        }
        q=query(collection(db,'orderStarted'),where('guildId','==',guildId));
        let querySnapshot=await getDocs(q);
        querySnapshot.forEach((doc)=>{
            deleteDoc(doc.ref);
        });
        return result;
    }catch(err){
        console.error('order result error: ',err);
        throw err;
    } 
}

export async function getOrderInfo(db:Firestore,guildId:string,userId:string) {
    try{
        let q= query(collection(db, 'orderStarted'), where('guildId', '==', guildId));
        let querySnapshot=await getDocs(q);
        return getRestaurant(db, querySnapshot.docs[0].data().name,guildId,userId);
    }catch(err){
        console.error('get order info error: ',err);
        throw err;
    }
}