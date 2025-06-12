import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Users, AlertCircle } from 'lucide-react';
import { useUser } from './UserContext';
import { db, auth } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error('Utilisateur non connecté');
        }

        // Récupérer le profil de l'utilisateur principal
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          setError('Profil utilisateur non trouvé');
        }

        // Récupérer les profils des membres de la famille
        const familyQuery = query(
          collection(db, 'family_members'),
          where('userId', '==', auth.currentUser.uid)
        );
        const familySnapshot = await getDocs(familyQuery);
        const familyData = familySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamilyMembers(familyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <User size={40} className="text-primary-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card max-w-xl mx-auto w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary mt-4"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="container-custom py-8 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Vos profils</h1>
          <p className="text-slate-600">
            Consultez les informations de votre profil et de votre famille.
          </p>
        </motion.div>

        {/* Profil utilisateur principal */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card max-w-2xl mx-auto w-full mb-8"
          >
            <div className="flex items-center gap-6 p-6">
              {userProfile.photo ? (
                <img
                  src={userProfile.photo}
                  alt="Photo de profil"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <User size={64} className="text-primary-500" />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">{userProfile.firstName} {userProfile.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Genre :</strong> {userProfile.gender}</p>
                  <p><strong>Adresse :</strong> {userProfile.address}</p>
                  <p><strong>Email :</strong> {userProfile.email}</p>
                  <p><strong>Poids :</strong> {userProfile.weight} kg</p>
                  <p><strong>Taille :</strong> {userProfile.height} cm</p>
                  <p><strong>IMC :</strong> {userProfile.bmi}</p>
                  <p className="md:col-span-2"><strong>État de santé :</strong> {userProfile.healthStatus || 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Membres de la famille */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Membres de la famille</h2>
          {familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="card w-full"
                >
                  <div className="flex items-center gap-4 p-4">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={`Photo de ${member.firstName}`}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
                      />
                    ) : (
                      <Users size={48} className="text-primary-500" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-medium">{member.firstName} {member.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Genre :</strong> {member.gender}</p>
                        <p><strong>Adresse :</strong> {member.address}</p>
                        <p><strong>Email :</strong> {member.email}</p>
                        <p><strong>Poids :</strong> {member.weight} kg</p>
                        <p><strong>Taille :</strong> {member.height} cm</p>
                        <p><strong>IMC :</strong> {member.bmi}</p>
                        <p><strong>État de santé :</strong> {member.healthStatus || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card max-w-xl mx-auto w-full text-center py-8">
              <Users size={48} className="text-primary-500 mx-auto mb-4" />
              <p className="text-slate-600">Aucun membre de la famille n'a été ajouté.</p>
              <button
                onClick={() => navigate('/family-members')}
                className="btn btn-primary mt-4"
              >
                Ajouter des membres
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;