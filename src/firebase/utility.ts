import { collection, getDocs, Firestore, DocumentData } from 'firebase/firestore/lite';

export async function getCities(db: Firestore, collectionName: string){
    const querySnapshot = await getDocs(collection(db, collectionName));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()['test']}`);
    });
}