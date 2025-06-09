// Onboarding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, User, Calendar, Scale, Ruler, Heart, Mail, MapPin, Image } from 'lucide-react';
import { useUser } from './UserContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { saveUser, calculateBMI } = useUser();

  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    firstName: '',
    gender: '',
    address: '',
    email: '',
    photo: '',
    weight: '',
    height: '',
    healthStatus: '',
  });

  const [bmi, setBmi] = useState(null);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (userData.weight && userData.height) {
      const calculatedBMI = calculateBMI(
        parseFloat(userData.weight),
        parseFloat(userData.height)
      );
      setBmi(calculatedBMI);
    }
  }, [userData.weight, userData.height, calculateBMI]);

  const steps = [
    {
      id: 'name',
      question: 'Quel est votre nom ?',
      field: 'name',
      icon: <User className="text-primary-500" size={28} />,
      type: 'text',
      placeholder: 'Entrez votre nom'
    },
    {
      id: 'firstName',
      question: 'Quel est votre prénom ?',
      field: 'firstName',
      icon: <User className="text-primary-500" size={28} />,
      type: 'text',
      placeholder: 'Entrez votre prénom'
    },
    {
      id: 'gender',
      question: 'Quel est votre genre ?',
      field: 'gender',
      icon: <User className="text-primary-500" size={28} />,
      type: 'select',
      options: ['Homme', 'Femme'],
      placeholder: 'Sélectionnez votre genre'
    },
    {
      id: 'address',
      question: 'Quelle est votre adresse ?',
      field: 'address',
      icon: <MapPin className="text-primary-500" size={28} />,
      type: 'text',
      placeholder: 'Entrez votre adresse'
    },
    {
      id: 'email',
      question: 'Quelle est votre adresse e-mail ?',
      field: 'email',
      icon: <Mail className="text-primary-500" size={28} />,
      type: 'email',
      placeholder: 'Entrez votre e-mail'
    },
    {
      id: 'photo',
      question: 'Ajoutez une photo de profil',
      field: 'photo',
      icon: <Image className="text-primary-500" size={28} />,
      type: 'file',
      accept: 'image/*',
      placeholder: 'Choisir une image'
    },
    {
      id: 'weight',
      question: 'Quel est votre poids (kg) ?',
      field: 'weight',
      icon: <Scale className="text-primary-500" size={28} />,
      type: 'number',
      placeholder: 'Entrez votre poids en kg'
    },
    {
      id: 'height',
      question: 'Quelle est votre taille (cm) ?',
      field: 'height',
      icon: <Ruler className="text-primary-500" size={28} />,
      type: 'number',
      placeholder: 'Entrez votre taille en cm'
    },
    {
      id: 'healthStatus',
      question: 'Avez-vous des allergies ou problèmes de santé ?',
      field: 'healthStatus',
      icon: <Heart className="text-primary-500" size={28} />,
      type: 'textarea',
      placeholder: 'Décrivez vos allergies ou problèmes de santé (optionnel)'
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files[0]) {
      // For demo purposes, we're just storing the file name
      // In a real app, you would upload to Firebase Storage
      setUserData({
        ...userData,
        [name]: files[0].name,
      });
    } else {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // On final step, save user data and proceed to family members
      const success = await saveUser({
        ...userData,
        bmi: bmi
      });

      if (success) {
        navigate('/family-members');
      }
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];

  const renderInputField = () => {
    switch (currentStep.type) {
      case 'select':
        return (
          <select
            name={currentStep.field}
            value={userData[currentStep.field]}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="" disabled>{currentStep.placeholder}</option>
            {currentStep.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            name={currentStep.field}
            value={userData[currentStep.field]}
            onChange={handleInputChange}
            placeholder={currentStep.placeholder}
            className="input-field min-h-[120px]"
          ></textarea>
        );
      case 'file':
        return (
          <div className="flex flex-col items-center">
            <label className="w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-400 transition-colors">
                <Image size={36} className="text-slate-400 mb-2" />
                <span className="text-slate-500">
                  {userData[currentStep.field]
                    ? userData[currentStep.field]
                    : 'Cliquez pour ajouter une photo'}
                </span>
              </div>
              <input
                type="file"
                name={currentStep.field}
                accept={currentStep.accept}
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        );
      default:
        return (
          <input
            type={currentStep.type}
            name={currentStep.field}
            value={userData[currentStep.field]}
            onChange={handleInputChange}
            placeholder={currentStep.placeholder}
            className="input-field"
            required
          />
        );
    }
  };

  // Show BMI result if available
  const renderBMIResult = () => {
    if (currentStep.field === 'height' && bmi) {
      return (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <h3 className="font-medium text-primary-700">Votre IMC est de: {bmi}</h3>
          <p className="text-sm text-primary-600 mt-1">
            {bmi < 18.5 ? 'Insuffisance pondérale' :
             bmi < 25 ? 'Poids normal' :
             bmi < 30 ? 'Surpoids' : 'Obésité'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-slate-200 h-1">
        <div
          className="bg-primary-500 h-1 transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 container-custom py-8 flex flex-col">
        {/* Step indicator */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-slate-500">
            Étape {step + 1} sur {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="card max-w-xl mx-auto w-full flex-1 flex flex-col">
              <div className="flex items-center mb-6">
                {currentStep.icon}
                <h2 className="text-2xl font-semibold ml-3">{currentStep.question}</h2>
              </div>

              {renderInputField()}
              {renderBMIResult()}

              <div className="mt-auto pt-8 flex justify-between">
                {step > 0 ? (
                  <button
                    onClick={handlePrevious}
                    className="btn btn-secondary"
                  >
                    Précédent
                  </button>
                ) : <div></div>}

                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={!userData[currentStep.field] && currentStep.field !== 'healthStatus'}
                >
                  {step === steps.length - 1 ? 'Terminer' : 'Suivant'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
