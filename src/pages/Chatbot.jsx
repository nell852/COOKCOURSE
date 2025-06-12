import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChefHat, Volume2, Pause, StopCircle, Moon, Sun, History, Sparkles, MessageCircle, Mic, Globe } from "lucide-react";
import Navbar from "../components/Navbar";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour ! Je suis votre assistant culinaire. Posez-moi une question comme 'Quels plats contiennent du poulet ?' ou 'Propose une recette avec du poulet et des carottes'.",
      isRecipe: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [meals, setMeals] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [language, setLanguage] = useState("fr");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const messagesEndRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const translations = {
    fr: {
      title: "Chef Assistant",
      subtitle: "Votre assistant culinaire intelligent pour des recettes personnalisées",
      placeholder: "Posez une question ou demandez une recette...",
      suggestionsTitle: "Suggestions rapides :",
      suggestions: [
        "Quels plats contiennent du poulet ?",
        "Propose une recette rapide",
        "Quels sont les desserts ?",
        "Donne-moi une recette avec des légumes",
      ],
      historyTitle: "Historique des recettes",
      noHistory: "Aucune recette enregistrée pour le moment",
      thinking: "Chef réfléchit...",
      errorData: "Erreur lors du chargement des données. Veuillez réessayer plus tard.",
      errorGemini: "Désolé, une erreur est survenue. Veuillez réessayer.",
      errorSpeech: "Désolé, la synthèse vocale n’est pas prise en charge par votre navigateur.",
      errorSpeechRead: "Erreur lors de la lecture de la recette.",
      errorRecognition: "Désolé, la reconnaissance vocale n’est pas prise en charge par votre navigateur.",
      noIngredients: "Désolé, aucun des ingrédients demandés ({ingredients}) n'est disponible.",
      speedLabel: "Vitesse de lecture :",
      darkMode: "Mode Sombre",
      lightMode: "Mode Clair",
      history: "Historique",
      languageLabel: "Langue :",
    },
    en: {
      title: "Chef Assistant",
      subtitle: "Your intelligent culinary assistant for personalized recipes",
      placeholder: "Ask a question or request a recipe...",
      suggestionsTitle: "Quick suggestions:",
      suggestions: [
        "Which dishes contain chicken?",
        "Suggest a quick recipe",
        "What are the desserts?",
        "Give me a recipe with vegetables",
      ],
      historyTitle: "Recipe History",
      noHistory: "No recipes saved yet",
      thinking: "Chef is thinking...",
      errorData: "Error loading data. Please try again later.",
      errorGemini: "Sorry, an error occurred. Please try again.",
      errorSpeech: "Sorry, speech synthesis is not supported by your browser.",
      errorSpeechRead: "Error reading the recipe.",
      errorRecognition: "Sorry, speech recognition is not supported by your browser.",
      noIngredients: "Sorry, none of the requested ingredients ({ingredients}) are available.",
      speedLabel: "Reading speed:",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      history: "History",
      languageLabel: "Language:",
    },
    es: {
      title: "Asistente Chef",
      subtitle: "Tu asistente culinario inteligente para recetas personalizadas",
      placeholder: "Haz una pregunta o pide una receta...",
      suggestionsTitle: "Sugerencias rápidas:",
      suggestions: [
        "¿Qué platos contienen pollo?",
        "Sugiere una receta rápida",
        "¿Cuáles son los postres?",
        "Dame una receta con verduras",
      ],
      historyTitle: "Historial de recetas",
      noHistory: "No hay recetas guardadas aún",
      thinking: "El chef está pensando...",
      errorData: "Error al cargar los datos. Por favor, intenta de nuevo más tarde.",
      errorGemini: "Lo siento, ocurrió un error. Por favor, intenta de nuevo.",
      errorSpeech: "Lo siento, la síntesis de voz no es compatible con tu navegador.",
      errorSpeechRead: "Error al leer la receta.",
      errorRecognition: "Lo siento, el reconocimiento de voz no es compatible con tu navegador.",
      noIngredients: "Lo siento, ninguno de los ingredientes solicitados ({ingredients}) está disponible.",
      speedLabel: "Velocidad de lectura:",
      darkMode: "Modo Oscuro",
      lightMode: "Modo Claro",
      history: "Historial",
      languageLabel: "Idioma:",
    },
  };

  const languageOptions = [
    { code: "fr", name: "Français", voiceLang: "fr-FR" },
    { code: "en", name: "English", voiceLang: "en-US" },
    { code: "es", name: "Español", voiceLang: "es-ES" },
  ];

  useEffect(() => {
    const savedRecipes = JSON.parse(localStorage.getItem("recipeHistory")) || [];
    setRecipeHistory(savedRecipes);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const mealsCollection = collection(db, "meals");
        const mealsSnapshot = await getDocs(mealsCollection);
        const mealsList = mealsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((meal) => meal.name && meal.ingredients && meal.category);
        setMeals(mealsList);

        const ingredientsCollection = collection(db, "ingredients");
        const ingredientsSnapshot = await getDocs(ingredientsCollection);
        const ingredientsList = ingredientsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((ingredient) => ingredient.name);
        setIngredients(ingredientsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: translations[language].errorData,
            isRecipe: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/- /g, "")
      .replace(/#/g, "")
      .replace(/\n/g, ". ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSendMessage = async (question = input) => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: question, isRecipe: false }]);
    setInput("");
    setIsLoading(true);

    try {
      await processWithGemini(question);
    } catch (error) {
      console.error("Error processing with Gemini:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: translations[language].errorGemini, isRecipe: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const processWithGemini = async (question) => {
    const lowerQuestion = question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const mealsContext = meals
      .map((meal) => `Dish: ${meal.name}, Ingredients: ${meal.ingredients.join(", ")}, Category: ${meal.category}`)
      .join("\n");
    const ingredientsContext = ingredients.map((ing) => ing.name).join(", ");

    if (lowerQuestion.includes("recipe") || lowerQuestion.includes("suggest a") || lowerQuestion.includes("recette") || lowerQuestion.includes("propose une")) {
      const requestedIngredients = lowerQuestion
        .split(" ")
        .filter((word) => ingredients.some((ing) => ing.name.toLowerCase().includes(word)))
        .map((word) => word.trim());

      const availableIngredients = ingredients
        .filter((ing) => requestedIngredients.some((req) => ing.name.toLowerCase().includes(req)))
        .map((ing) => ing.name);
      const unavailableIngredients = requestedIngredients.filter(
        (req) => !availableIngredients.some((avail) => avail.toLowerCase().includes(req))
      );

      if (availableIngredients.length === 0 && requestedIngredients.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: translations[language].noIngredients.replace("{ingredients}", requestedIngredients.join(", ")),
            isRecipe: false,
          },
        ]);
        return;
      }

      const recipePrompt = `
        You are an expert chef. Create a recipe in ${languageOptions.find((opt) => opt.code === language).name} using only the ingredients listed below. The recipe must be clear, with a title, a list of ingredients, and detailed steps. If some requested ingredients are not available, mention it in the response and suggest an alternative if possible. Respond in a natural and engaging manner.

        Available ingredients: ${ingredientsContext}

        Requested ingredients: ${requestedIngredients.join(", ")}

        User's question: "${question}"

        Response format:
        **Recipe Title**
        **Ingredients:**
        - [Ingredient 1]
        - [Ingredient 2]
        **Steps:**
        1. [Step 1]
        2. [Step 2]
        **Note:** [Mention if any ingredients are unavailable and suggest alternatives if applicable]
      `;

      try {
        const result = await model.generateContent(recipePrompt);
        const response = result.response.text().trim();
        const newRecipe = { text: response, timestamp: new Date().toISOString(), language };
        const updatedHistory = [...recipeHistory, newRecipe];
        setRecipeHistory(updatedHistory);
        localStorage.setItem("recipeHistory", JSON.stringify(updatedHistory));
        setMessages((prev) => [...prev, { sender: "bot", text: response, isRecipe: true }]);
      } catch (error) {
        throw new Error("Error calling Gemini API for recipe");
      }
      return;
    }

    const prompt = `
      You are a culinary assistant. Answer the following question in ${languageOptions.find((opt) => opt.code === language).name} using only the dishes provided below. If no answer matches, say that you couldn't find a matching dish. Be natural and precise.

      Available dishes:
      ${mealsContext}

      User's question: "${question}"

      Examples of possible questions:
      - Which dishes contain chicken?
      - What are the vegetable dishes?
      - Give me dishes with fish.
      - What are the desserts?
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      setMessages((prev) => [...prev, { sender: "bot", text: response, isRecipe: false }]);
    } catch (error) {
      throw new Error("Error calling Gemini API");
    }
  };

  const readRecipe = (text) => {
    if (!window.speechSynthesis) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: translations[language].errorSpeech, isRecipe: false },
      ]);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanedText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    speechUtteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const selectedLang = languageOptions.find((opt) => opt.code === language).voiceLang;
    const langVoice = voices.find((voice) => voice.lang.startsWith(selectedLang.split("-")[0]));
    utterance.voice = langVoice || voices[0];
    utterance.lang = selectedLang;
    utterance.rate = speechRate;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: translations[language].errorSpeechRead, isRecipe: false },
      ]);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePause = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    } else {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: translations[language].errorRecognition, isRecipe: false },
      ]);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!speechRecognitionRef.current) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.lang = languageOptions.find((opt) => opt.code === language).voiceLang;
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;

      speechRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
        setIsRecognizing(false);
        speechRecognitionRef.current.stop();
      };

      speechRecognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecognizing(false);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: translations[language].errorRecognition, isRecipe: false },
        ]);
      };

      speechRecognitionRef.current.onend = () => {
        setIsRecognizing(false);
      };
    }

    if (isRecognizing) {
      speechRecognitionRef.current.stop();
    } else {
      speechRecognitionRef.current.lang = languageOptions.find((opt) => opt.code === language).voiceLang;
      speechRecognitionRef.current.start();
      setIsRecognizing(true);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50"
      }`}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
            >
              <ChefHat className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              {translations[language].title}
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
            {translations[language].subtitle}
          </p>

          <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isDarkMode ? "bg-yellow-500 text-black" : "bg-gray-800 text-white"
              }`}
              aria-label={translations[language][isDarkMode ? "lightMode" : "darkMode"]}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              {translations[language][isDarkMode ? "lightMode" : "darkMode"]}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              aria-label={translations[language].history}
            >
              <History size={20} />
              {translations[language].history}
            </motion.button>
            <div className="flex items-center gap-2">
              <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {translations[language].languageLabel}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"}`}
                aria-label={translations[language].languageLabel}
              >
                {languageOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="p-6">
                <h2
                  className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                >
                  <History className="w-6 h-6" />
                  {translations[language].historyTitle}
                </h2>
                {recipeHistory.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {translations[language].noHistory}
                  </p>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {recipeHistory.map((recipe, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <p className={`text-sm line-clamp-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {recipe.text}
                        </p>
                        <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {new Date(recipe.timestamp).toLocaleString(languageOptions.find((lang) => lang.code === recipe.language)?.voiceLang || "fr-FR")}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {translations[language].suggestionsTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {translations[language].suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage(suggestion)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 hover:from-orange-200 hover:to-red-200"
                  }`}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === "user" ? "order-2" : "order-1"}`}
                  >
                    <div
                      className={`rounded-2xl p-4 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>

                    {message.isRecipe && (
                      <div className="flex justify-center gap-2 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => readRecipe(message.text)}
                          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                          disabled={isSpeaking}
                          aria-label="Read recipe aloud"
                        >
                          <Volume2 size={16} />
                        </motion.button>
                        {isSpeaking && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={togglePause}
                              className="p-2 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 transition-colors"
                              aria-label={window.speechSynthesis.paused ? "Resume speech" : "Pause speech"}
                            >
                              <Pause size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={stopReading}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                              aria-label="Stop speech"
                            >
                              <StopCircle size={16} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "order-1 mr-3 bg-gradient-to-r from-orange-400 to-red-500"
                        : "order-2 ml-3 bg-gradient-to-r from-green-400 to-emerald-500"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <MessageCircle className="w-4 h-4 text-white" />
                    ) : (
                      <ChefHat className="w-4 h-4 text-white" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className={`rounded-2xl p-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{translations[language].thinking}</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={translations[language].placeholder}
                  className={`w-full p-4 rounded-full text-sm border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-gray-50 text-gray-800 border-gray-200 placeholder-gray-400"
                  }`}
                  disabled={isLoading || isRecognizing}
                />
                
              
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm sm:px-6 sm:py-3"
                disabled={isLoading || isRecognizing}
                aria-label="Send message"
              >
                <Send size={20} />
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {translations[language].speedLabel}
                </label>
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className={`px-3 py-1 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100"} border-gray-300`}
                  aria-label="Select reading speed"
                >
                  <option value={0.8}>Lent</option>
                  <option value={1}>Normal</option>
                  <option value={1.2}>Rapide</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;
