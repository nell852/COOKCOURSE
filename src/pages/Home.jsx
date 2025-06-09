import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { useUser } from './UserContext';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useUser();
  
  // Placeholder data for recent meals
  const recentMeals = [
    {
      id: 1,
      name: 'Sauce Jaune',
      category: 'Sauce',
      image: 'https://th.bing.com/th/id/OIP.hjprnx1gsXusK1S4iY6hSAHaE6?rs=1&pid=ImgDetMain',
      prepTime: '25 min'
    },
    {
      id: 2,
      name: 'Poulet Grillé ',
      category: 'grillades',
      image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      prepTime: '40 min'
    },
    {
      id: 3,
      name: 'Vin de Palme',
      category: 'boissons',
      image: 'https://th.bing.com/th/id/OIP.I3UBl6RO_nkLP87mXAGtCQHaEK?rs=1&pid=ImgDetMain',
      prepTime: '10 min'
    }
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container-custom py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName || 'bienvenue'} !
          </h1>
          <p className="text-slate-600">
            Que souhaitez-vous préparer aujourd'hui ?
          </p>
        </motion.div>
        
        {/* Quick access cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/meals">
            <motion.div 
              className="card bg-primary-50 border border-primary-100 hover:shadow-lg transition-shadow flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="p-4 bg-primary-100 rounded-full mr-4">
                <Utensils size={24} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-primary-800">Plats habituels</h2>
                <p className="text-primary-600 text-sm">Gérez vos plats favoris</p>
              </div>
              <ArrowRight size={20} className="text-primary-400" />
            </motion.div>
          </Link>
          
          <Link to="/calendar/weekly">
            <motion.div 
              className="card bg-secondary-50 border border-secondary-100 hover:shadow-lg transition-shadow flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="p-4 bg-secondary-100 rounded-full mr-4">
                <Calendar size={24} className="text-secondary-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-secondary-800">Calendrier des repas</h2>
                <p className="text-secondary-600 text-sm">Planifiez vos repas</p>
              </div>
              <ArrowRight size={20} className="text-secondary-400" />
            </motion.div>
          </Link>
        </div>
        
        {/* Recent meals section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Repas récents</h2>
            <Link to="/meals" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              Voir tous <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                className="card overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.1 * index }
                }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={meal.image} 
                    alt={meal.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{meal.name}</h3>
                    <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded">
                      {meal.category}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <Clock size={14} className="mr-1" />
                    {meal.prepTime}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Family members section - if available */}
        {user && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Préférences familiales</h2>
            <div className="card">
              <div className="flex items-center mb-4">
                <User size={24} className="text-slate-500 mr-3" />
                <p>Gérez les préférences alimentaires et restrictions de votre famille</p>
              </div>
              <Link to="/family-members" className="btn btn-secondary inline-flex">
                Gérer la famille
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;