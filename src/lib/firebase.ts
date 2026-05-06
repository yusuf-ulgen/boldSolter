import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBysZvA2I2GaBpz33p8mAXivUWwHdnIkpA",
  authDomain: "boltsorter-a2bb0.firebaseapp.com",
  projectId: "boltsorter-a2bb0",
  storageBucket: "boltsorter-a2bb0.firebasestorage.app",
  messagingSenderId: "985360862673",
  appId: "1:985360862673:web:35b72f0ffd59646b88a4f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
