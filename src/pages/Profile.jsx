import React from "react";
import { useUser } from "./UserContext";

function Profile() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-green-600 text-lg font-semibold">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg font-semibold">
        Utilisateur non trouvé.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-[#f8fff8] p-10 font-sans text-green-800">
      <div className="max-w-4xl mx-auto space-y-14">
        {/* Profil utilisateur */}
        <div className="bg-white rounded-3xl shadow-lg p-10 transform transition-all hover:scale-105 hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-10">
            {/* Cercle avec nom */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center shadow-lg animate-pulse-slow">
              <span className="text-white text-center text-xl font-bold leading-tight px-2">
                {user.displayName || 'Inconnu'}
              </span>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg leading-relaxed">
                <p><strong className="text-green-500">Email :</strong> {user.email || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
