import { collection, getDocs, Firestore, DocumentData,addDoc,where,query } from 'firebase/firestore';

export async function getCities(db: Firestore, collectionName: string){
    const querySnapshot = await getDocs(collection(db, collectionName));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()['test']}`);
    });
}

export async function addRestaurant(db: Firestore, name:string,tel:string,image:string,guildId: string) {
    addDoc(collection(db,"restaurant"), {
        guildId: guildId,
        name: name,
        tel: tel,
        image: image
    });
}

export async function getRestaurant(db: Firestore,name:string,guildId: string) {
    const q= query(collection(db, "restaurant"), where("guildId", "==", guildId), where("name", "==", name));
    let ret:DocumentData[]=[];
    getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            ret.push(doc.data());
        });
    });
    return ret;
}