// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUF9zcnYHKuwQNmvprOIFR8HPITERpPh0",
  authDomain: "karting-employee-app.firebaseapp.com",
  projectId: "karting-employee-app",
  storageBucket: "karting-employee-app.firebasestorage.app",
  messagingSenderId: "529811338415",
  appId: "1:529811338415:web:03581eb83c70a4157ed05a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
