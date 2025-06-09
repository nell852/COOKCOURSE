import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, UserPlus, Users, ChevronRight } from 'lucide-react';
import { useUser } from './UserContext';

const FamilyMembers = () => {
  const navigate = useNavigate();
  const { saveFamilyMembers, user, calculateBMI } = useUser();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [currentField, setCurrentField] = useState('name');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [tempValues, setTempValues] = useState([]);
  
  const fields = [
    { id: 'name', label: 'Nom', placeholder: 'Entrez le nom' },
    { id: 'firstName', label: 'Prénom', placeholder: 'Entrez le prénom' },
    { id: 'gender', label: 'Genre', placeholder: 'Sélectionnez le genre', type: 'select', options: ['Homme', 'Femme', 'Autre'] },
    { id: 'address', label: 'Adresse', placeholder: 'Entrez l\'adresse' },
    { id: 'email', label: 'Email', placeholder: 'Entrez l\'email', type: 'email' },
    { id: 'photo', label: 'Photo', placeholder: 'URL de la photo' },
    { id: 'weight', label: 'Poids (kg)', placeholder: 'Entrez le poids', type: 'number' },
    { id: 'height', label: 'Taille (cm)', placeholder: 'Entrez la taille', type: 'number' },
    { id: 'healthStatus', label: 'État de santé', placeholder: 'Allergies, problèmes de santé', type: 'textarea' },
  ];

  const handleAddMemberClick = () => {
    setShowAddForm(true);
  };

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value, 10) || 0;
    setMemberCount(count);
    
    // Initialize temp array with empty values for each member
    const initialValues = Array(count).fill('');
    setTempValues(initialValues);
  };

  const handleFieldValueChange = (index, value) => {
    const newValues = [...tempValues];
    newValues[index] = value;
    setTempValues(newValues);
  };

  const handleNextField = () => {
    // Save current field values to family members array
    const updatedMembers = [...familyMembers];
    
    for (let i = 0; i < memberCount; i++) {
      if (!updatedMembers[i]) {
        updatedMembers[i] = {};
      }
      updatedMembers[i][currentField] = tempValues[i] || '';
      
      // Calculate BMI if we have both weight and height
      if (currentField === 'height' && updatedMembers[i].weight) {
        updatedMembers[i].bmi = calculateBMI(
          parseFloat(updatedMembers[i].weight),
          parseFloat(updatedMembers[i].height)
        );
      }
    }
    
    setFamilyMembers(updatedMembers);
    
    // Move to next field or finish
    const currentIndex = fields.findIndex(field => field.id === currentField);
    if (currentIndex < fields.length - 1) {
      setCurrentField(fields[currentIndex + 1].id);
      
      // Initialize temp values for next field
      const nextValues = updatedMembers.map(member => member[fields[currentIndex + 1].id] || '');
      setTempValues(nextValues);
    } else {
      // We're done with all fields
      handleFinish(updatedMembers);
    }
  };

  const handleFinish = async (members) => {
    const success = await saveFamilyMembers(members);
    if (success) {
      navigate('/introduction');
    }
  };
  
  const handleRemoveMember = (index) => {
    const updatedMembers = [...familyMembers];
    updatedMembers.splice(index, 1);
    setFamilyMembers(updatedMembers);
    
    // Update member count and temp values
    setMemberCount(updatedMembers.length);
    const newTempValues = [...tempValues];
    newTempValues.splice(index, 1);
    setTempValues(newTempValues);
  };
  
  const handleSkip = () => {
    navigate('/introduction');
  };

  const currentFieldObj = fields.find(field => field.id === currentField);
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="container-custom py-8 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Membres de la famille</h1>
          <p className="text-slate-600">
            Ajoutez les membres de votre famille pour personnaliser les repas pour tous.
          </p>
        </motion.div>
        
        {!showAddForm ? (
          <motion.div 
            className="card max-w-xl mx-auto w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center py-8">
              <Users size={48} className="text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Souhaitez-vous ajouter des membres de votre famille ?</h2>
              <p className="text-slate-600 mb-6">
                Vous pourrez planifier des repas pour toute la famille
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleAddMemberClick}
                  className="btn btn-primary"
                >
                  <UserPlus size={20} />
                  Oui, ajouter
                </button>
                <button 
                  onClick={handleSkip}
                  className="btn btn-secondary"
                >
                  Non, continuer
                </button>
              </div>
            </div>
          </motion.div>
        ) : memberCount === 0 ? (
          <motion.div 
            className="card max-w-xl mx-auto w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Combien de membres souhaitez-vous ajouter ?</h2>
            <input
              type="number"
              min="1"
              max="10"
              value={memberCount || ''}
              onChange={handleCountChange}
              className="input-field mb-6"
              placeholder="Nombre de membres"
            />
            <div className="flex justify-between">
              <button 
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Retour
              </button>
              <button 
                onClick={() => setCurrentField('name')}
                className="btn btn-primary"
                disabled={memberCount < 1}
              >
                Continuer
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="card max-w-2xl mx-auto w-full"
            key={currentField}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6">
              {currentFieldObj.label}
            </h2>
            
            <div className="space-y-4">
              {/* Show previously completed fields as columns */}
              {fields.filter(field => 
                fields.findIndex(f => f.id === field.id) < 
                fields.findIndex(f => f.id === currentField)
              ).length > 0 && (
                <div className="mb-6 overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {fields.filter(field => 
                      fields.findIndex(f => f.id === field.id) < 
                      fields.findIndex(f => f.id === currentField)
                    ).map(field => (
                      <div key={field.id} className="min-w-[120px]">
                        <h3 className="font-medium text-sm text-slate-500 mb-2">{field.label}</h3>
                        {familyMembers.map((member, idx) => (
                          <div key={idx} className="mb-2 text-sm py-2 border-b border-slate-100">
                            {member[field.id]}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current field inputs */}
              {Array.from({ length: memberCount }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    {currentFieldObj.type === 'select' ? (
                      <select
                        value={tempValues[index] || ''}
                        onChange={(e) => handleFieldValueChange(index, e.target.value)}
                        className="input-field"
                      >
                        <option value="">{currentFieldObj.placeholder}</option>
                        {currentFieldObj.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : currentFieldObj.type === 'textarea' ? (
                      <textarea
                        value={tempValues[index] || ''}
                        onChange={(e) => handleFieldValueChange(index, e.target.value)}
                        placeholder={currentFieldObj.placeholder}
                        className="input-field"
                        rows="2"
                      ></textarea>
                    ) : (
                      <input
                        type={currentFieldObj.type || 'text'}
                        value={tempValues[index] || ''}
                        onChange={(e) => handleFieldValueChange(index, e.target.value)}
                        placeholder={`${currentFieldObj.placeholder} pour membre ${index + 1}`}
                        className="input-field"
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveMember(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    title="Supprimer ce membre"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              {/* Add member button */}
              <button
                onClick={() => {
                  setMemberCount(memberCount + 1);
                  setTempValues([...tempValues, '']);
                }}
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 mt-2"
              >
                <Plus size={18} />
                Ajouter un membre
              </button>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  const currentIndex = fields.findIndex(field => field.id === currentField);
                  if (currentIndex > 0) {
                    setCurrentField(fields[currentIndex - 1].id);
                    const prevValues = familyMembers.map(member => member[fields[currentIndex - 1].id] || '');
                    setTempValues(prevValues);
                  } else {
                    setShowAddForm(false);
                    setMemberCount(0);
                  }
                }}
                className="btn btn-secondary"
              >
                Précédent
              </button>
              
              <button 
                onClick={handleNextField}
                className="btn btn-primary"
              >
                {currentField === fields[fields.length - 1].id ? 'Terminer' : 'Suivant'}
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FamilyMembers;