import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Markets = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [sortByDistance, setSortByDistance] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [travelTimes, setTravelTimes] = useState(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  // Liste des marchés
  const markets = [
    { id: 1, name: "Marché Central de Yaoundé", lat: 3.8649, lon: 11.5185, description: "Grand marché central avec des produits frais.", path: '/market' },
    { id: 2, name: "Marché Mboppi de Douala", lat: 4.0580, lon: 9.7460, description: "Marché animé connu pour ses épices.", path: '/market/douala' },
    { id: 3, name: "Marché A de Bafoussam", lat: 5.4750, lon: 10.4200, description: "Idéal pour les produits locaux et artisanaux.", path: '/market/bafoussam' },
    { id: 4, name: "Marché Mokolo de Yaoundé", lat: 3.8837, lon: 11.4991, description: "Marché populaire pour vêtements et produits variés.", path: '/market/mokolo' },
    { id: 5, name: "Marché Sandaga de Douala", lat: 4.0485, lon: 9.6947, description: "Marché dynamique pour tissus et artisanat.", path: '/market/sandaga' },
    { id: 6, name: "Marché de Bamenda", lat: 5.9631, lon: 10.1591, description: "Marché principal de Bamenda avec produits agricoles.", path: '/market/bamenda' },
  ];
  // Calcul de la distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Corrigé : supprimé "- lon1"
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // Calcul des temps de trajet avec OpenRouteService
  const fetchTravelTimes = async (start, end) => {
    const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY; // Corrigé : VITE_OPENROUTESERVICE_API_KEY
    const profiles = ['driving-car', 'foot-walking', 'cycling-regular'];
    const times = {};

    for (const profile of profiles) {
      try {
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`
        );
        const data = await response.json();
        if (data.features && data.features[0]) {
          const duration = data.features[0].properties.segments[0].duration / 60; // En minutes
          times[profile] = duration.toFixed(1);
        } else {
          times[profile] = null;
        }
      } catch (err) {
        console.error(`Erreur lors du calcul de l'itinéraire pour ${profile} :`, err);
        times[profile] = null;
      }
    }
    return times;
  };

  // Formatage du temps de trajet
  const formatTravelTime = (minutes) => {
    if (!minutes) return "Erreur de calcul";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Initialisation et géolocalisation
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('marketFavorites')) || [];
    setFavorites(new Set(savedFavorites));

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
          setError('Impossible de récupérer votre position. Veuillez activer la géolocalisation.');
          setLoading(false);
        }
      );
    } else {
      setError('La géolocalisation n’est pas prise en charge par votre navigateur.');
      setLoading(false);
    }
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    if (userLocation && !loading && !mapRef.current) {
      mapRef.current = L.map('map').setView([userLocation.lat, userLocation.lon], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      L.marker([userLocation.lat, userLocation.lon], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup('Vous êtes ici')
        .openPopup();

      markets.forEach(market => {
        L.marker([market.lat, market.lon], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(
            `${market.name}<br>Distance : ${userLocation ? calculateDistance(userLocation.lat, userLocation.lon, market.lat, market.lon) : '?'} km`
          )
          .on('click', () => handleSelectMarket(market));
      });
    }
  }, [userLocation, loading]);

  // Sauvegarde des favoris
  useEffect(() => {
    localStorage.setItem('marketFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Sélection d'un marché et tracé d'itinéraire
  const handleSelectMarket = async (market) => {
    if (!userLocation) return;

    setSelectedMarket(market);
    setTravelTimes(null);

    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(market.lat, market.lon),
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 5 }],
      },
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(mapRef.current);

    try {
      const times = await fetchTravelTimes(userLocation, { lat: market.lat, lon: market.lon });
      setTravelTimes(times);
    } catch (err) {
      setError('Erreur lors du calcul de l’itinéraire. Veuillez réessayer.');
    }
  };

  // Effacer l'itinéraire
  const clearRoute = () => {
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setSelectedMarket(null);
    setTravelTimes(null);
    mapRef.current.setView([userLocation.lat, userLocation.lon], 8);
  };

  // Gestion des favoris
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

  // Tri des marchés par distance
  const sortedMarkets = userLocation && sortByDistance
    ? [...markets].sort((a, b) =>
        calculateDistance(userLocation.lat, userLocation.lon, a.lat, a.lon) -
        calculateDistance(userLocation.lat, userLocation.lon, b.lat, b.lon)
      )
    : markets;

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
      <div className="container mx-auto px-4 py-12">
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
              <div className="flex gap-2 mt-4">
                <Link to={market.path}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-300"
                  >
                    Visiter
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectMarket(market)}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all duration-300"
                >
                  Voir l’itinéraire
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="w-full h-96 mb-8 rounded-xl overflow-hidden shadow-lg bg-white">
          <div id="map" style={{ height: '100%', width: '100%' }}></div>
        </div>

        {selectedMarket && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl mb-8 shadow-lg bg-white"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Itinéraire vers {selectedMarket.name}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={clearRoute}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                <X size={20} />
              </motion.button>
            </div>
            {travelTimes ? (
              <div>
                <p className="font-semibold text-gray-800 mb-2">Temps de trajet estimé :</p>
                <ul className="space-y-1 text-gray-700">
                  <li>Voiture : {formatTravelTime(travelTimes['driving-car'])}</li>
                  <li>À pied : {formatTravelTime(travelTimes['foot-walking'])}</li>
                  <li>Vélo : {formatTravelTime(travelTimes['cycling-regular'])}</li>
                </ul>
              </div>
            ) : (
              <p className="text-gray-600">Chargement des temps de trajet...</p>
            )}
          </motion.div>
        )}

        <div className="text-center text-gray-600 mb-6">
          <p>Heure locale (WAT) : {new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
          <p>Horaires typiques : 7h00 - 18h00 (vérifiez localement)</p>
        </div>
      </div>
    </div>
  );
};

export default Markets;