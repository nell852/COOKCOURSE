# 🍴 COOKCOURSE

**Cookcourse** est une application web moderne développée avec **React (.jsx uniquement, pas de .tsx)**, **HTML** et **CSS**.  
Elle est dynamique, réactive, interactive et esthétique, avec beaucoup d’animations et d’originalité.  
La persistance des données est assurée par **Firebase** (Firestore + Storage).  

---

## ✨ Fonctionnalités principales

### 🔹 Onboarding
- Création du **profil principal** (nom, prénom, sexe, adresse, mail, photo, poids, taille, IMC auto, état de santé).
- Ajout des **profils des membres** (processus guidé, étape par étape avec défilements animés).
- Félicitations animées à la fin :  
  _“SUPER [nom de l’utilisateur], tu l’as fait avec succès !”_
- Page d’introduction avec **slogan santé/alimentation** et bouton **COMMENCER**.

---

### 🔹 Page d’accueil
- **PLAT**
  - **Plats habituels** : sélection de repas par catégories (légumes, grillades, fruits, féculents, sauces, boissons, autres).  
  - Chaque plat → photo, description déroulante, recette, bouton **SELECTIONNER**, bouton **+ COMPLÉMENT** (ajout ingrédients).  
  - Ingrédients sauvegardés dans `meals/{mealId}/ingredients` et `plats_habituels`.  
  - Bouton favori (cœur animé avec bruitage).

- **CALENDRIER**  
  - Journalier, hebdomadaire, mensuel.  
  - Génère un **PDF** avec les repas (images + titres) choisis aléatoirement depuis `plats_habituels`.  
  - Envoi automatique du menu par **EmailJS** aux adresses mails des membres.

- **STOCK**  
  - Vue des ingrédients disponibles (collection `stock`).  
  - Ajout des nouveaux ingrédients sous forme de tableau.

- **MARCHÉ**  
  - **Faire le marché** : ingrédients classés par catégories (condiments, graines, boucherie, poissonnerie, liquides, boissons, fruits…).  
  - Chaque ingrédient → photo, prix, description nutritionnelle, champ quantité + unité (kg, L, cuillerée…).  
  - Bouton **Ajouter** → enregistrement dans `stock`.  
  - **Liste du marché** : génération automatique en agrégeant tous les ingrédients de tous les plats (`meals/*/ingredients`).  
    - ⚡ Les ingrédients identiques sont regroupés avec quantités/prix multipliés selon occurrences.

---

## 🧰 Pile technologique
- **React 18 (Vite)** — `.jsx` uniquement  
- **React Router** (navigation)  
- **Framer Motion** (animations fluides)  
- **Firebase** (Firestore + Storage)  
- **EmailJS** (envoi email)  
- **jsPDF + html2canvas** (PDF)  
- **Zustand** (gestion état global)  
- **Day.js** (dates), **uuid**, **classnames**

---

## ✅ Prérequis
- **Node.js 18+**  
- **npm / yarn / nvm** (déjà installés 👍)

---

## 🚀 Installation

```bash
# 1) Créer une app React avec Vite (JavaScript)
npm create vite@latest cookcourse -- --template react
# ou
yarn create vite cookcourse --template react

cd cookcourse

# 2) Installer les dépendances
npm install react-router-dom framer-motion firebase emailjs-com jspdf html2canvas zustand dayjs uuid classnames lucide-react

# 3) Lancer l’app
npm run dev
