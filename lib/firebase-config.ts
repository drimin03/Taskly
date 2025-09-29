// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4l496T4ANBfjzRkBGaCbCq-5OOQxVSh8",
  authDomain: "to-do-6b35f.firebaseapp.com",
  projectId: "to-do-6b35f",
  storageBucket: "to-do-6b35f.appspot.com", // ✅ safer and standard
  messagingSenderId: "846648445299",
  appId: "1:846648445299:web:7f07a331350398cffc5d06",
  measurementId: "G-JXQ6BRYEHV",
}

// Ensure we only initialize once in the browser
const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)

// IMPORTANT: Only initialize analytics in the browser and when supported
let analytics: import("firebase/analytics").Analytics | undefined = undefined
if (typeof window !== "undefined") {
  analyticsIsSupported().then((ok) => {
    if (ok) {
      try {
        analytics = getAnalytics(app)
      } catch {
        // no-op
      }
    }
  })
}

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { app, analytics, db, auth, storage }
