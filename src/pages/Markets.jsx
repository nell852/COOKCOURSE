import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Initialiser une icône personnalisée pour Leaflet
const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Markets = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [sortByDistance, setSortByDistance] = useState(false);

  // Liste de marchés prédéfinis avec leurs coordonnées
  const markets = [
    { id: 1, name: "Marché de Yaoundé", lat: 3.8480, lon: 11.5021, description: "Grand marché central avec des produits frais.", path: '/market' }, // Redirection directe vers /market
    { id: 2, name: "Marché de Douala", lat: 4.0511, lon: 9.7679, description: "Marché animé connu pour ses épices.", path: '/market/douala' },
    { id: 3, name: "Marché de Bafoussam", lat: 5.4778, lon: 10.4176, description: "Idéal pour les produits locaux et artisanaux.", path: '/market/bafoussam' },
  ];

  // Fonction pour calculer la distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // Récupérer la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          setError("Impossible de récupérer votre position. Veuillez activer la géolocalisation.");
          setLoading(false);
        }
      );
    } else {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      setLoading(false);
    }
  }, []);

  // Trier les marchés par distance si activé
  const sortedMarkets = userLocation && sortByDistance
    ? [...markets].sort((a, b) => 
        calculateDistance(userLocation.lat, userLocation.lon, a.lat, a.lon) - 
        calculateDistance(userLocation.lat, userLocation.lon, b.lat, b.lon)
      )
    : markets;

  // Initialiser la carte Leaflet
  useEffect(() => {
    if (userLocation && !loading) {
      const map = L.map('map').setView([userLocation.lat, userLocation.lon], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Ajouter un marqueur pour l'utilisateur
      L.marker([userLocation.lat, userLocation.lon], { icon: customIcon })
        .addTo(map)
        .bindPopup('Vous êtes ici')
        .openPopup();

      // Ajouter des marqueurs pour les marchés
      sortedMarkets.forEach(market => {
        L.marker([market.lat, market.lon], { icon: customIcon })
          .addTo(map)
          .bindPopup(`${market.name}<br>Distance: ${userLocation ? calculateDistance(userLocation.lat, userLocation.lon, market.lat, market.lon) : '?'} km`);
      });
    }
  }, [userLocation, loading, sortedMarkets]);

  const toggleFavorite = (marketId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(marketId)) {
        newFavorites.delete(marketId);
      } else {
        newFavorites.add(marketId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-4xl text-green-600"
        >
          📍
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-emerald-50 to-green-50">
      <Navbar />
      <div className="container-custom py-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 text-center animate-pulse bg-gradient-to-r from-green-600 to-yellow-400 bg-clip-text text-transparent">
          Mes Marchés
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Explorez les marchés à proximité avec style et découvrez leurs trésors !
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 p-4 rounded-xl max-w-3xl mx-auto mb-6 shadow-md"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortByDistance(!sortByDistance)}
            className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-700 transition-all duration-300"
          >
            <span>Trier par distance</span>
            <svg className={`w-5 h-5 ${sortByDistance ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedMarkets.map((market) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: market.id * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MapPin size={24} className="text-green-600" />
                  <h3 className="text-2xl font-semibold text-gray-800">{market.name}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(market.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Heart size={20} fill={favorites.has(market.id) ? 'red' : 'none'} />
                </motion.button>
              </div>
              <p className="text-gray-600 mb-4">{market.description}</p>
              {userLocation && (
                <p className="text-gray-700 font-medium">
                  Distance : {calculateDistance(userLocation.lat, userLocation.lon, market.lat, market.lon)} km
                </p>
              )}
              <Link to={market.path}>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#34d399' }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-300"
                >
                  Visiter {market.name}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="w-full h-96 mb-8 rounded-xl overflow-hidden shadow-2xl">
          <div id="map" style={{ height: '100%', width: '100%' }}></div>
        </div>

        <div className="text-center text-gray-600 mb-6">
          <p>Heure locale (WAT) : {new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
          <p>Horaires typiques : 7h00 - 18h00 (vérifiez localement)</p>
        </div>
      </div>
    </div>
  );
};

export default Markets;