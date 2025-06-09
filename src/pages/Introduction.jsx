import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, UtensilsCrossed, CalendarCheck, Truck } from 'lucide-react';
import { useUser } from './UserContext';

const Introduction = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 'healthy',
      title: 'Mangez sainement',
      description: 'Des repas équilibrés adaptés à vos besoins nutritionnels et à ceux de votre famille.',
      icon: <CheckCircle size={48} className="text-primary-500" />,
      bgImage: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 'variety',
      title: 'Découvrez de nouvelles recettes',
      description: 'Une large variété de plats pour ne jamais vous ennuyer à table.',
      icon: <UtensilsCrossed size={48} className="text-primary-500" />,
      bgImage: 'https://th.bing.com/th/id/OIP.b6UCTwu6gpdtHRkI3ylkdAHaEJ?w=1200&h=673&rs=1&pid=ImgDetMain'
    },
    {
      id: 'planning',
      title: 'Planifiez vos repas',
      description: 'Organisez votre semaine ou votre mois et partagez le planning avec toute la famille.',
      icon: <CalendarCheck size={48} className="text-primary-500" />,
      bgImage: 'https://images.pexels.com/photos/3054690/pexels-photo-3054690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 'delivery',
      title: 'Faites-vous livrer',
      description: 'Commandez vos ingrédients et recevez-les directement chez vous.',
      icon: <Truck size={48} className="text-primary-500" />,
      bgImage: 'https://images.pexels.com/photos/10327297/pexels-photo-10327297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          <div 
            className="h-[60vh] bg-cover bg-center relative flex items-center justify-center" 
            style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-full p-4 inline-block mb-6"
              >
                {slides[currentSlide].icon}
              </motion.div>
              <motion.h1 
                className="text-4xl font-bold mb-4 text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p 
                className="text-xl text-white max-w-lg mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>
          </div>
          
          <div className="flex-1 bg-white flex flex-col items-center justify-center p-6">
            {currentSlide === 0 && (
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-primary-600 mb-2">
                  Super {user?.firstName || ''}, c'est fait avec succès !
                </h2>
                <p className="text-slate-600">
                  "La santé commence dans l'assiette. Découvrez comment CookCourse peut transformer votre alimentation."
                </p>
              </motion.div>
            )}
            
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Progress dots */}
              <div className="flex gap-2 mb-8">
                {slides.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-primary-500' : 'bg-slate-300'
                    } transition-colors`}
                  ></div>
                ))}
              </div>
              
              <button 
                onClick={handleNext}
                className="btn btn-primary w-full max-w-xs"
              >
                {currentSlide === slides.length - 1 ? 'Terminer' : 'Continuer'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Introduction;