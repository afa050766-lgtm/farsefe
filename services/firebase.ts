
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfSDYeKIyn-QjdyZfJr14J1ODUNH1y6HI",
  authDomain: "asffd-46b33.firebaseapp.com",
  projectId: "asffd-46b33",
  storageBucket: "asffd-46b33.firebasestorage.app",
  messagingSenderId: "1065748260689",
  appId: "1:1065748260689:web:dd75b2c535e4b981e69570",
  measurementId: "G-14V2HTRGSM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
