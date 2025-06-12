import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Calendar, User, Menu, X, ShoppingCart, Package, Brain, MapPin, ChefHat } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    { path: '/home', label: 'Accueil', icon: <Utensils size={20} /> },
    { path: '/meals', label: 'Plats', icon: <Utensils size={20} /> },
    { 
      path: '/calendar', 
      label: 'Calendrier', 
      icon: <Calendar size={20} />,
      dropdown: [
        { path: '/calendar/daily', label: 'Journalier' },
        { path: '/calendar/weekly', label: 'Hebdomadaire' },
        { path: '/calendar/monthly', label: 'Mensuel' },
      ]
    },
    { path: '/market', label: 'Market', icon: <ShoppingCart size={20} /> },
    { path: '/marketall', label: 'MarketAll', icon: <MapPin size={20} /> },
    { path: '/marketlist', label: 'Liste de Marché', icon: <ShoppingCart size={20} /> },
    { path: '/stock', label: 'Stock', icon: <Package size={20} /> },
  
    { path: '/chatbot', label: 'Chatbot', icon: <ChefHat size={20} /> }, // Ajout du Chatbot
    { path: '/profile', label: 'Profil', icon: <User size={20} /> }, 
  ];

  const toggleDropdown = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <div className="bg-primary-500 text-white p-2 rounded-full mr-2">
              <Utensils size={20} />
            </div>
            <span className="font-bold text-xl text-primary-700">CookCourse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div key={index} className="relative">
                {item.dropdown ? (
                  <>
                    <button 
                      className={`px-4 py-2 rounded-md flex items-center hover:bg-slate-100 ${
                        location.pathname.startsWith(item.path) ? 'text-primary-600 font-medium' : 'text-slate-700'
                      }`}
                      onClick={() => toggleDropdown(index)}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                      <svg 
                        className={`ml-2 h-4 w-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === index && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                        >
                          <div className="py-1">
                            {item.dropdown.map((dropdownItem, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                to={dropdownItem.path}
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {dropdownItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-md flex items-center hover:bg-slate-100 ${
                      location.pathname === item.path ? 'text-primary-600 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-inner"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <>
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                          location.pathname.startsWith(item.path) ? 'bg-primary-50 text-primary-600 font-medium' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => toggleDropdown(index)}
                      >
                        <span className="flex items-center">
                          {item.icon && <span className="mr-3">{item.icon}</span>}
                          {item.label}
                        </span>
                        <svg 
                          className={`h-4 w-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {activeDropdown === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 mt-1 pl-4 border-l-2 border-slate-200"
                          >
                            {item.dropdown.map((dropdownItem, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                to={dropdownItem.path}
                                className="block py-2 pl-3 pr-4 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                {dropdownItem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`block px-3 py-2 rounded-md flex items-center ${
                        location.pathname === item.path ? 'bg-primary-50 text-primary-600 font-medium' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <span className="mr-3">{item.icon}</span>}
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
