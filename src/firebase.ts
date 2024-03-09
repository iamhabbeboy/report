// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  // setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { orderBy } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASLvY5vMGr56JK4K0U4KivtYRpWzGXncQ",
  authDomain: "mcom-bda49.firebaseapp.com",
  projectId: "mcom-bda49",
  storageBucket: "mcom-bda49.appspot.com",
  messagingSenderId: "718836435775",
  appId: "1:718836435775:web:90eb47f184f594375b218a",
  measurementId: "G-E0MWLSCKJD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class GoogleFirestoreDatabase {
  public async getCollection(collectionName: string) {
    return collection(db, collectionName);
  }

  public async addToCollection(collectionName: string, data: any) {
    try {
      let docRef = await addDoc(collection(db, collectionName), data);
      const id = docRef.id;
      const additionalInfo: any = {
        id,
      };
      //adding oauthproviderid for email password
      if (!data.oauthProviderId && data.oauthProvider === "email-pwd")
        additionalInfo.oauthProviderId = id;

      await updateDoc(docRef, additionalInfo);
      docRef = doc(db, collectionName, docRef.id);

      const docSnap = await getDoc(docRef);
      return docSnap.data();
    } catch (e: Error | any) {
      console.log("Error occurred, UnableToSaveData: ", data);
      throw e;
    }
  }

  public async getDocumentById(
    collectionName: string,
    documentId: string,
  ): Promise<Record<string, any> | undefined> {
    const docRef = doc(db, collectionName, documentId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return;
  }

  public async getCollectionByName(collectionName: string, name: string) {
    const data = query(
      collection(db, collectionName),
      where("name", ">=", name),
      where("name", "<", name + "z"),
    );
    const querySnapshot = await getDocs(data);
    return querySnapshot.docs.map((d) => d.data());
  }

  public async getCollectionLimit(collectionName: string) {
    const data = query(
      collection(db, collectionName),
      orderBy("created_at", "desc"),
      limit(5),
    );
    const querySnapshot = await getDocs(data);
    return querySnapshot.docs.map((d) => d.data());
  }
}
