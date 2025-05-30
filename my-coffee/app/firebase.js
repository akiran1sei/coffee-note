// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiahjL8KavfXUkm1cJklGCDBhX0Yi8OUg",
  authDomain: "coffeenote-1152d.firebaseapp.com",
  databaseURL: "https://coffeenote-1152d-default-rtdb.firebaseio.com",
  projectId: "coffeenote-1152d",
  storageBucket: "coffeenote-1152d.firebasestorage.app",
  messagingSenderId: "422996855295",
  appId: "1:422996855295:web:27e1b10a174426f522ffca",
  measurementId: "G-FRXJ225Q7L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
