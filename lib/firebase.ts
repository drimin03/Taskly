import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyC4l496T4ANBfjzRkBGaCbCq-5OOQxVSh8",
  authDomain: "to-do-6b35f.firebaseapp.com",
  projectId: "to-do-6b35f",
  storageBucket: "to-do-6b35f.appspot.com",
  messagingSenderId: "846648445299",
  appId: "1:846648445299:web:7f07a331350398cffc5d06",
  measurementId: "G-JXQ6BRYEHV",
  databaseURL: "https://to-do-6b35f-default-rtdb.firebaseio.com/"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const rtdb = getDatabase(app)

export function getFirebaseAuth() {
  return auth
}

export function getFirebaseDB() {
  return db
}

export function getFirebaseRTDB() {
  return rtdb
}

export default app