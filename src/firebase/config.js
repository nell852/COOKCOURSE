import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzHrGu63G7S5yYJdPO86poIV8gfil3GZo",
  authDomain: "cookcourse-eb277.firebaseapp.com",
  projectId: "cookcourse-eb277",
  storageBucket: "cookcourse-eb277.appspot.com",
  messagingSenderId: "901406088939",
  appId: "1:901406088939:web:dd4f755b445fc9c93ba8ae",
  measurementId: "G-79XTJL3CES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage , auth, app };

async function getEmailsFamille() {
  const emails = [];
  const querySnapshot = await getDocs(collection(db, "users")); // "famille" = nom de ta collection
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if(data.email) {
      emails.push(data.email);
    }
  });
  return emails; // tableau des emails
}
