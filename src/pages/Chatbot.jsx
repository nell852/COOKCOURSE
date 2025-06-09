import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour ! Je suis votre assistant culinaire. Posez-moi des questions comme "Quels plats contiennent du poulet ?" ou "Quels sont les plats de légumes ?".' }
  ]);
  const [input, setInput] = useState('');
  const [meals, setMeals] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMeals = async () => {
      const mealsCollection = collection(db, 'meals');
      const mealsSnapshot = await getDocs(mealsCollection);
      const mealsList = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsList);
    };
    fetchMeals();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    processQuestion(input);
    setInput('');
  };

  const processQuestion = (question) => {
    const lower = question.toLowerCase().trim();

    // Salutations simples
    if (/^(bonjour|salut|coucou|bonsoir)/i.test(lower)) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Bonjour ! Que puis-je faire pour vous aujourd\'hui ? 😊' }]);
      return;
    }

    if (/merci/i.test(lower)) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Avec plaisir ! 😊' }]);
      return;
    }

    if (/aide|qu'est-ce que je peux demander|exemples/i.test(lower)) {
      setMessages(prev => [...prev, { sender: 'bot', text: `Voici des exemples de questions que vous pouvez poser :
- Quels plats contiennent du poulet ?
- Quels sont les plats de légumes ?
- Donne-moi des plats avec du poisson.
- Quels sont les desserts ?
- Quels plats sont rapides à préparer ?
- Quel est le plat du jour ?` }]);
      return;
    }

    // Recherche par ingrédient
    const ingredientMatch = lower.match(/contiennent?\s+([a-zéèàêëôïûç\s]+)/i);
    if (ingredientMatch) {
      const ingredient = ingredientMatch[1].trim();
      const matchingMeals = meals.filter(meal =>
        meal.ingredients?.some(ing => ing.toLowerCase().includes(ingredient))
      );
      const response = matchingMeals.length > 0
        ? `Voici les plats contenant ${ingredient} : ${matchingMeals.map(meal => meal.name).join(', ')}.`
        : `Désolé, je n'ai trouvé aucun plat contenant ${ingredient}.`;
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      return;
    }

    // Recherche par catégorie
    const categoryMatch = lower.match(/plats\s+(?:de|des)\s+([a-zéèàêëôïûç\s]+)/i);
    if (categoryMatch) {
      const category = categoryMatch[1].trim();
      const matchingMeals = meals.filter(meal =>
        meal.category?.toLowerCase().includes(category)
      );
      const response = matchingMeals.length > 0
        ? `Voici les plats de la catégorie ${category} : ${matchingMeals.map(meal => meal.name).join(', ')}.`
        : `Désolé, je n'ai trouvé aucun plat dans la catégorie ${category}.`;
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      return;
    }

    // Réponse par défaut
    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: "Désolé, je n'ai pas compris votre question. Essayez des phrases comme : 'Quels plats contiennent du poulet ?' ou 'Quels sont les plats de légumes ?'." }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
      <Navbar />
      <div className="container-custom py-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 text-center animate-pulse bg-gradient-to-r from-green-600 to-yellow-400 bg-clip-text text-transparent">
          Chatbot Culinaire
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Posez des questions sur vos repas et découvrez des plats délicieux !
        </p>

        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl mx-auto">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Posez une question sur les repas..."
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-all duration-300"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
