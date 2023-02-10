import { collection, getDocs, Firestore, DocumentData,addDoc,where,query, Query, deleteDoc } from 'firebase/firestore';

export async function AddAbsenceInfo(db: Firestore,userId:string, time:Date) {
    try{
        await addDoc(collection(db, 'absence'), {
            userId: userId,
            time: time
        });
    }catch(err){
        console.error("add absence error: ",err);
        throw err;
    }
}
export async function GetUserAbsenceInfo(db: Firestore,userId:string) {
    try{
        let q:Query<DocumentData>;
        q = query(collection(db, 'absence'), where('userId', '==', userId));
        let querySnapshot=await getDocs(q);
        let result:DocumentData[]=[];
        querySnapshot.forEach((doc)=>{
            result.push(doc.data());
        });
        return result;
    }catch(err){
        console.error('get absence error: ',err);
        throw err;
    }
}
export async function GetDateAbsenceInfo(db: Firestore, date:Date) {
    try{
        let q:Query<DocumentData>;
        q = query(collection(db, 'absence'), where('time', '==', date));
        let querySnapshot=await getDocs(q);
        let result:DocumentData[]=[];
        querySnapshot.forEach((doc)=>{
            result.push(doc.data());
        });
        return result;
    }catch(err){
        console.error('get absence error: ',err);
        throw err;
    }
}
export async function deleteAbsenceInfo(db: Firestore,userId:string) {
    try{
        let q:Query<DocumentData>;
        q = query(collection(db, 'absence'), where('userId', '==', userId));
        let querySnapshot=await getDocs(q);
        // let result:DocumentData[]=[];
        querySnapshot.forEach(async(doc)=>{
            // result.push(doc.data());
            if (doc.data().time.toDate().getTime() + 24*60*60*1000 <= Date.now())
                await deleteDoc(doc.ref);
        });
    }catch(err){
        console.error('get absence error: ',err);
        throw err;
    }
}