import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { CookingPot, Utensils, Heart, ChefHat, Coffee, Apple, Cake, Lock, Mail, ArrowRight } from "lucide-react";

// Composant pour les particules flottantes (réutilisé de la page d'accueil)
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    icon: [CookingPot, Utensils, Heart, ChefHat, Coffee, Apple, Cake][i % 7],
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const Icon = particle.icon;
        return (
          <motion.div
            key={particle.id}
            className="absolute text-emerald-300/10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              x: [-10, 10, -10],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          >
            <Icon size={24} />
          </motion.div>
        );
      })}
    </div>
  );
};

// Composant pour l'effet de machine à écrire
const TypewriterText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
        className="inline-block w-1 h-8 bg-emerald-500 ml-1"
      />
    </span>
  );
};

// Composant pour les champs de formulaire animés
const AnimatedInput = ({ id, name, type, placeholder, value, onChange, icon: Icon, isFirst = false, isLast = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: isFirst ? 0.3 : 0.5 }}
    >
      <div
        className={`flex items-center overflow-hidden relative ${
          isFirst ? "rounded-t-xl" : ""
        } ${isLast ? "rounded-b-xl" : ""} ${
          isFocused ? "shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "shadow-md"
        } transition-shadow duration-300`}
      >
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon
            className={`h-5 w-5 ${isFocused ? "text-emerald-500" : "text-gray-400"} transition-colors duration-300`}
          />
        </div>
        <input
          id={id}
          name={name}
          type={type}
          className={`block w-full pl-10 pr-3 py-4 border-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none text-lg bg-white ${
            isFocused ? "bg-emerald-50" : ""
          } transition-colors duration-300`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
        />
        {isFocused && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default function SpectacularLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX - innerWidth / 2) / innerWidth;
      const yPct = (clientY - innerHeight / 2) / innerHeight;
      x.set(xPct * 10);
      y.set(yPct * 10);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulation d'une connexion
    try {
      // Ici, vous intégreriez votre logique d'authentification Firebase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulation de succès
      setSuccess(true);
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      setError("Échec de la connexion. Vérifiez votre email ou mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        bounce: 0.4,
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Arrière-plan avec effet parallaxe */}
      <motion.div className="absolute inset-0 z-0" style={{ y: y1, opacity }}>
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            filter: "blur(3px) brightness(0.7)",
          }}
        />
      </motion.div>

      {/* Overlay avec gradient animé */}
      <motion.div className="absolute inset-0 z-10" style={{ y: y2 }}>
        <div className="w-full h-full bg-gradient-to-br from-green-900/30 via-emerald-900/40 to-teal-900/30" />
      </motion.div>

      {/* Particules flottantes */}
      <FloatingParticles />

      {/* Contenu principal */}
      <motion.div
        className="relative z-20 container mx-auto px-4 max-w-md min-h-screen flex items-center justify-center"
        style={{ x, y }}
      >
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          {/* Logo et titre */}
          <motion.div className="mb-8 flex justify-center" variants={itemVariants}>
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <div className="relative bg-white rounded-full p-4 shadow-2xl">
                <CookingPot size={50} className="text-emerald-500" strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>

          {/* Titre avec effet de machine à écrire */}
          <motion.h1
            className="text-center font-bold text-3xl md:text-4xl mb-2 text-white drop-shadow-lg"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              <TypewriterText text="Connexion" />
            </span>
          </motion.h1>

          <motion.p className="text-center text-white/80 mb-8 text-lg" variants={itemVariants}>
            Accédez à votre espace culinaire
          </motion.p>

          {/* Carte du formulaire avec effet 3D */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden relative"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            {/* Effet de brillance */}
            <motion.div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            />

            {/* Message d'erreur */}
            {error && (
              <motion.div
                className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Message de succès */}
            {success && (
              <motion.div
                className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Connexion réussie ! Redirection...
              </motion.div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatedInput
                id="email"
                name="email"
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                isFirst={true}
              />

              <AnimatedInput
                id="password"
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                isLast={true}
              />

              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading || success}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">{loading ? "Connexion en cours..." : "Se connecter"}</span>
                  {!loading && (
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  )}
                  {loading && (
                    <motion.div
                      className="relative z-10 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Liens supplémentaires */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <button
                onClick={() => navigate("/onboarding")}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors duration-300"
              >
                Pas encore de compte ? S'inscrire
              </button>
              <div className="mt-2">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Lien de retour */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <button
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-1"
            >
              <motion.span animate={{ x: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                ←
              </motion.span>{" "}
              Retour à l'accueil
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
