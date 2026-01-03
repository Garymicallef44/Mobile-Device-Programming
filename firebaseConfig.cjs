
require("dotenv").config({path:"../.env"});
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const {initializeAuth,getReactNativePersistence,getAuth} = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { AsyncStorage } = require("@react-native-async-storage/async-storage");

// TODO: Add SDKs for Firebase products that you want to     use
// https://firebase.google.com/docs/web/setup#available-libraries
//Test Commit
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey:process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain:process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId:process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const PID = firebaseConfig.projectId;
console.log(PID);
const db = getFirestore(app);
module.exports = {app,db};

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