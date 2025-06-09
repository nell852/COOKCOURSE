import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronRight, CookingPot, Utensils, Heart, Sparkles, Star, ChefHat, Coffee, Apple, Cake } from "lucide-react";

// Composant pour les particules flottantes
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
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
            className="absolute text-emerald-300/20"
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

// Composant pour les cartes 3D
const Card3D = ({ children, className }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = (e.clientY - centerY) / 10;
    const rotateYValue = (centerX - e.clientX) / 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 50 }}
    >
      {children}
    </motion.div>
  );
};

export default function SpectacularWelcome() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const navigate = useNavigate();

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX - innerWidth / 2) / innerWidth;
      const yPct = (clientY - innerHeight / 2) / innerHeight;
      x.set(xPct * 20);
      y.set(yPct * 20);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        bounce: 0.4,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5,
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
              'url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            filter: "blur(2px) brightness(0.7)",
          }}
        />
      </motion.div>

      {/* Overlay avec gradient animé */}
      <motion.div className="absolute inset-0 z-10" style={{ y: y2 }}>
        <div className="w-full h-full bg-gradient-to-br from-green-900/20 via-emerald-900/30 to-teal-900/20" />
      </motion.div>

      {/* Particules flottantes */}
      <FloatingParticles />

      {/* Contenu principal */}
      <motion.div
        className="relative z-20 container mx-auto px-4 max-w-6xl min-h-screen flex items-center justify-center"
        style={{ x, y }}
      >
        <motion.div className="text-center py-12" variants={containerVariants} initial="hidden" animate="visible">
          {/* Icône principale avec effet morphing */}
          <motion.div className="mb-8 flex justify-center" variants={iconVariants}>
            <motion.div
              className="relative"
              whileHover={{ scale: 1.2, rotate: 15 }}
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
              <div className="relative bg-white rounded-full p-6 shadow-2xl">
                <CookingPot size={80} className="text-emerald-500" strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>

          {/* Titre avec effet de machine à écrire */}
          <motion.h1 className="font-bold text-4xl md:text-7xl mb-6 text-white drop-shadow-2xl" variants={itemVariants}>
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              <TypewriterText text="CookCourse" />
            </span>
          </motion.h1>

          {/* Sous-titre avec effet de brillance */}
          <motion.p
            className="text-xl md:text-3xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg"
            variants={itemVariants}
          >
            <motion.span
              className="inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Planifiez vos repas, mangez sainement et simplifiez votre quotidien familial
            </motion.span>
          </motion.p>

          {/* Carte principale avec effet 3D */}
          <motion.div className="mb-16" variants={itemVariants}>
            <Card3D className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-3xl mx-auto border border-white/20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Sparkles className="text-teal-400" size={32} />
                  </motion.div>
                  Êtes-vous prêt pour l'aventure culinaire ?
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  >
                    <Heart className="text-green-500" size={32} />
                  </motion.div>
                </h2>

                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Organisez les repas de votre famille, découvrez de nouvelles recettes savoureuses et recevez votre
                  planning de repas personnalisé chaque semaine. Une expérience culinaire unique vous attend !
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <button
                      onClick={() => navigate("/onboarding")}
                      className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10">Commencer l'aventure</span>
                      <motion.div
                        className="relative z-10"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ChevronRight size={24} />
                      </motion.div>
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <button
                      onClick={() => navigate("/login")}
                      className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <span>Se connecter</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </Card3D>
          </motion.div>

          {/* Cartes de fonctionnalités avec animations avancées */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" variants={itemVariants}>
            {[
              {
                icon: Star,
                title: "Simple & Intuitif",
                description: "Créez votre profil familial et ajoutez tous les membres en quelques clics magiques",
                color: "from-blue-400 to-purple-500",
                delay: 0,
              },
              {
                icon: Utensils,
                title: "Pratique & Malin",
                description: "Recevez des plannings de repas sur-mesure adaptés aux goûts de toute la famille",
                color: "from-green-400 to-blue-500",
                delay: 0.2,
              },
              {
                icon: Heart,
                title: "Sain & Équilibré",
                description: "Mangez sainement grâce à nos suggestions nutritionnelles personnalisées",
                color: "from-pink-400 to-red-500",
                delay: 0.4,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: feature.delay + 1.5,
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.3,
                  }}
                  whileHover={{
                    y: -10,
                    rotateX: 5,
                    rotateY: 5,
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                  className="group relative"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 h-full relative overflow-hidden">
                    {/* Effet de brillance au hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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

                    <motion.div
                      className="mb-6 flex justify-center"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full shadow-lg`}>
                        <Icon size={32} className="text-white" />
                      </div>
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-emerald-600 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
