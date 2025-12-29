// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to     use
// https://firebase.google.com/docs/web/setup#available-libraries
//Test Commit
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyB-OYwubrmTaZThyaapsaBkME13fNRKD-c",
  authDomain: "servifyapp-9d5dc.firebaseapp.com",
  projectId: "servifyapp-9d5dc",
  storageBucket: "servifyapp-9d5dc.firebasestorage.app",
  messagingSenderId: "224238467474",
  appId: "1:224238467474:web:bc3d7ea71b313aaf93694b",
  measurementId: "G-SDL72MZVDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
const getAuthInstance = () => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Auth already initialized, get existing instance
    return getAuth(app);
  }
};

export const auth = getAuthInstance();