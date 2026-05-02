import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import {
  deleteDoc,
  addDoc,
  doc,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

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
export const auth = getAuth(app);
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

export const saveUserProfile = async (user) => {
  if (!user?.uid) {
    throw new Error("User is required");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const createApplication = async (applicationData, user) => {
  if (!user?.uid) {
    throw new Error("Authentication required");
  }

  const normalizedEmail = (user.email || applicationData.email || "").trim();

  if (!normalizedEmail) {
    throw new Error("Authenticated user email is required");
  }

  const docRef = await addDoc(collection(db, "applications"), {
    name: String(applicationData.name || "").trim(),
    email: normalizedEmail,
    hackathon: String(applicationData.hackathon || "").trim(),
    project: String(applicationData.project || "").trim(),
    idea: String(applicationData.idea || "").trim(),
    uid: user.uid,
    userEmail: normalizedEmail,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getUserApplications = async (uid) => {
  if (!uid) {
    throw new Error("User id is required");
  }

  const applicationsQuery = query(
    collection(db, "applications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(applicationsQuery);

  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data();

    return {
      id: snapshotDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  });
};

export const deleteApplicationById = async (id) => {
  if (!id) {
    throw new Error("Application id is required");
  }

  await deleteDoc(doc(db, "applications", id));
};
export const registerUser = async (email, password) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const loginUser = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getCurrentUser = () => auth.currentUser;

export const checkCurrentUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

export const subscribeToAuthChanges = (callback) => onAuthStateChanged(auth, callback);
