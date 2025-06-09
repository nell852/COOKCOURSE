import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
   apiKey: "AIzaSyCzHrGu63G7S5yYJdPO86poIV8gfil3GZo",
  authDomain: "cookcourse-eb277.firebaseapp.com",
  projectId: "cookcourse-eb277",
  storageBucket: "cookcourse-eb277.appspot.com",
  messagingSenderId: "901406088939",
  appId: "1:901406088939:web:dd4f755b445fc9c93ba8ae",
  measurementId: "G-79XTJL3CES"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loadIngredientsFromExcel = async () => {
  const excelFilePath = path.join(process.cwd(), 'ingredients.xlsx'); // Changé en .xlsx

  try {
    // Lire le fichier Excel (.xlsx)
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Prend la première feuille
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet); // Convertir en tableau d'objets

    // Ajouter chaque ingrédient dans Firestore avec vérification
    for (const row of data) {
      const name = row.nom_ingredient; // Utilise nom_ingredient comme champ principal
      if (name && typeof name === 'string' && name.trim().length > 0) {
        await addDoc(collection(db, 'ingredients'), {
          code_ingredient: row.code_ingredient || null,
          name: name.trim(), // Nom principal de l'ingrédient
          autre_nom: row.autre_nom || null, // Nom alternatif
          description: row.description || null,
          origine: row.origine || null,
          addedAt: new Date(),
        });
        console.log(`Ingrédient "${name}" ajouté à Firestore.`);
      } else {
        console.warn(`Ligne ignorée : nom d'ingrédient invalide ou absent :`, row);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des ingrédients :', error);
  }
};

loadIngredientsFromExcel();