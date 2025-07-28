// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCN6bHNuGRvvEx6hoMsR6nlFIs_oiBKj_E",
  authDomain: "track-tycoon-app.firebaseapp.com",
  projectId: "track-tycoon-app",
  storageBucket: "track-tycoon-app.appspot.com",
  messagingSenderId: "640474963976",
  appId: "1:640474963976:web:70aa70dae0b82b33cab1bd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
