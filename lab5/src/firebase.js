import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAph64QHCz_f6gpopTH2eowzdJZwJ2XPY",
  authDomain: "thebestproject-igiveyouaword.firebaseapp.com",
  projectId: "thebestproject-igiveyouaword",
  storageBucket: "thebestproject-igiveyouaword.firebasestorage.app",
  messagingSenderId: "688068403193",
  appId: "1:688068403193:web:b2779d11cc54a6b471a728",
  measurementId: "G-LC1W7KKBRS",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getAppDataFromFirestore = async () => {
  const [hackathonsSnap, participantsSnap] = await Promise.all([
    getDocs(collection(db, "hackathons")),
    getDocs(query(collection(db, "participants"), orderBy("points", "desc"))),
  ]);

  const hackathons = hackathonsSnap.docs.map((doc) => ({
    slug: doc.id,
    ...doc.data(),
  }));

  const participants = participantsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    hackathons,
    participants,
  };
};
