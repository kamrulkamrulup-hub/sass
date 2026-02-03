
import * as fbApp from "firebase/app";
import * as fbAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Fix: Bypassing "no exported member" errors by using namespaced type assertion for the environment
export const initializeApp = (fbApp as any).initializeApp;
export const getAuth = (fbAuth as any).getAuth;

const firebaseConfig = {
  apiKey: "AIzaSyB_AUTD-D97xnuHk5zJLVCNGon_DwGQmD4",
  authDomain: "cmss-c2d4e.firebaseapp.com",
  projectId: "cmss-c2d4e",
  storageBucket: "cmss-c2d4e.firebasestorage.app",
  messagingSenderId: "150489041707",
  appId: "1:150489041707:web:51d75768ef0b47f537136e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
