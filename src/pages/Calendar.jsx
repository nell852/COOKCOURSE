import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Download, Send, ArrowLeft, Info } from 'lucide-react';
import { format, addDays, startOfWeek, startOfMonth, addWeeks, addMonths, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import toPDF from 'react-to-pdf';
import { useUser } from './UserContext';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const Calendar = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, familyMembers } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generatedCalendar, setGeneratedCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [meals, setMeals] = useState([]);
  const calendarRef = useRef();

  useEffect(() => {
    emailjs.init('fPlwIN8-Jue0vhZba');
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        console.log('Récupération des plats habituels depuis Firestore');
        const userId = user ? user.uid : 'anonymous-user';
        const platsHabituelsQuery = query(collection(db, 'plats_habituels'), where('userId', '==', userId));
        const platsHabituelsSnapshot = await getDocs(platsHabituelsQuery);
        const platsHabituels = platsHabituelsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtrer uniquement les plats (type 'plat')
        const plats = platsHabituels.filter(plat => plat.type === 'plat');
        console.log('Plats habituels récupérés :', plats);
        setMeals(plats);
      } catch (error) {
        console.error('Erreur lors de la récupération des plats habituels :', error);
        setMeals([]);
      }
    };

    fetchMeals();
  }, [user]);

  const generateRandomMeal = () => {
    if (meals.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * meals.length);
    return meals[randomIndex];
  };

  const generateDailyCalendar = () => {
    if (meals.length === 0) return null;
    return {
      date: currentDate,
      breakfast: generateRandomMeal(),
      lunch: generateRandomMeal(),
      dinner: generateRandomMeal(),
      snack: generateRandomMeal(),
    };
  };

  const generateWeeklyCalendar = () => {
    if (meals.length === 0) return null;
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      days.push({
        date,
        breakfast: generateRandomMeal(),
        lunch: generateRandomMeal(),
        dinner: generateRandomMeal(),
      });
    }
    return days;
  };

  const generateMonthlyCalendar = () => {
    if (meals.length === 0) return null;
    const startDate = startOfMonth(currentDate);
    const weeks = [];

    for (let i = 0; i < 4; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j;
        const date = addDays(startDate, dayIndex);
        week.push({
          date,
          lunch: generateRandomMeal(),
          dinner: generateRandomMeal(),
        });
      }
      weeks.push(week);
    }

    return weeks;
  };

  const handleGenerateCalendar = () => {
    setLoading(true);

    setTimeout(() => {
      let calendar;

      if (meals.length === 0) {
        setGeneratedCalendar(null);
        setLoading(false);
        return;
      }

      switch (type) {
        case 'daily':
          calendar = generateDailyCalendar();
          break;
        case 'weekly':
          calendar = generateWeeklyCalendar();
          break;
        case 'monthly':
          calendar = generateMonthlyCalendar();
          break;
        default:
          calendar = generateWeeklyCalendar();
      }

      setGeneratedCalendar(calendar);
      setLoading(false);
    }, 500);
  };

  const handleDownloadPDF = async () => {
    try {
      await toPDF(calendarRef, { filename: `${type}-meal-plan.pdf` });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
    }
  };

  const handleSendByEmail = async () => {
    try {
      // Récupérer les emails des membres de la famille et de l'utilisateur
      const emails = [];
      if (user?.email) {
        emails.push(user.email);
      } else {
        console.warn('Aucun email trouvé pour l\'utilisateur actuel');
      }

      familyMembers.forEach((member) => {
        if (member.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(member.email)) {
            emails.push(member.email);
          } else {
            console.warn(`Adresse email invalide pour le membre ${member.name}: ${member.email}`);
          }
        }
      });

      if (emails.length === 0) {
        setTooltipMessage('Aucun email valide trouvé pour l\'utilisateur ou les membres de la famille');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
        return;
      }

      console.log('Emails à qui envoyer le calendrier :', emails);

      // Générer le contenu textuel du calendrier
      let calendarText = `Bonjour,\n\nVoici le planning de repas ${
        type === 'daily' ? 'Journalier' : type === 'weekly' ? 'Hebdomadaire' : 'Mensuel'
      } pour ${format(currentDate, 'd MMMM yyyy', { locale: fr })}.\n\n`;

      if (generatedCalendar) {
        switch (type) {
          case 'daily':
            const { breakfast, lunch, dinner, snack } = generatedCalendar;
            calendarText += `Petit-déjeuner: ${breakfast ? breakfast.name : 'Aucun plat'}\n`;
            calendarText += `Déjeuner: ${lunch ? lunch.name : 'Aucun plat'}\n`;
            calendarText += `Dîner: ${dinner ? dinner.name : 'Aucun plat'}\n`;
            calendarText += `Collation: ${snack ? snack.name : 'Aucun plat'}\n`;
            break;
          case 'weekly':
            generatedCalendar.forEach((day, index) => {
              calendarText += `\n${format(day.date, 'EEEE d MMMM', { locale: fr })}:\n`;
              calendarText += `  Petit-déjeuner: ${day.breakfast ? day.breakfast.name : 'Aucun plat'}\n`;
              calendarText += `  Déjeuner: ${day.lunch ? day.lunch.name : 'Aucun plat'}\n`;
              calendarText += `  Dîner: ${day.dinner ? day.dinner.name : 'Aucun plat'}\n`;
            });
            break;
          case 'monthly':
            generatedCalendar.forEach((week, weekIndex) => {
              calendarText += `\nSemaine ${weekIndex + 1}:\n`;
              week.forEach((day, dayIndex) => {
                calendarText += `  ${format(day.date, 'EEEE d MMMM', { locale: fr })}:\n`;
                calendarText += `    Déjeuner: ${day.lunch ? day.lunch.name : 'Aucun plat'}\n`;
                calendarText += `    Dîner: ${day.dinner ? day.dinner.name : 'Aucun plat'}\n`;
              });
            });
            break;
        }
      } else {
        calendarText += 'Aucun calendrier généré pour le moment.';
      }

      calendarText += '\nBon appétit !\nL\'équipe CookCourse';

      // Envoyer un email à chaque membre avec gestion des erreurs détaillée
      const sendPromises = emails.map(async (email, index) => {
        const templateParams = {
          to_email: email,
          subject: `Planning de repas ${type} - ${format(currentDate, 'd MMMM yyyy', { locale: fr })}`,
          message: calendarText,
          from_name: user?.name || 'CookCourse',
        };

        console.log(`Envoi de l'email à ${email} (${index + 1}/${emails.length})...`);

        try {
          const response = await emailjs.send(
            'service_lt1rh5c', // Remplace par ton Service ID
            'template_mijdj1s', // Remplace par ton Template ID
            templateParams
          );
          console.log(`Email envoyé avec succès à ${email}:`, response);
          return { email, success: true, response };
        } catch (error) {
          console.error(`Échec de l'envoi de l'email à ${email}:`, error);
          return { email, success: false, error };
        }
      });

      // Attendre que tous les emails soient envoyés
      const results = await Promise.all(sendPromises);

      // Analyser les résultats
      const successfulSends = results.filter((result) => result.success);
      const failedSends = results.filter((result) => !result.success);

      if (successfulSends.length === emails.length) {
        setTooltipMessage(`Calendrier envoyé avec succès à ${successfulSends.length} destinataire(s) !`);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      } else if (successfulSends.length > 0) {
        setTooltipMessage(
          `Calendrier envoyé à ${successfulSends.length}/${emails.length} destinataire(s). Échec pour ${failedSends.length}. Vérifiez la console pour plus de détails.`
        );
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      } else {
        setTooltipMessage('Échec de l\'envoi des emails. Vérifiez la console pour plus de détails.');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);

        // Afficher le contenu de l'email dans la console comme solution de secours
        console.log(
          'Contenu de l\'email (vous pouvez le copier et l\'envoyer manuellement) :',
          calendarText
        );
      }

      // Afficher les erreurs spécifiques pour chaque email échoué
      if (failedSends.length > 0) {
        failedSends.forEach(({ email, error }) => {
          if (error.status === 429) {
            console.error(
              `Erreur 429 pour ${email}: Trop de requêtes. Vous avez peut-être dépassé le quota d'EmailJS. Vérifiez votre compte EmailJS.`
            );
          } else if (error.text) {
            console.error(`Détails de l'erreur pour ${email}:`, error.text);
          }
        });
      }
    } catch (error) {
      console.error('Erreur générale lors de l\'envoi des emails :', error);
      setTooltipMessage('Erreur lors de l\'envoi des emails. Vérifiez la console pour plus de détails.');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  const handlePrevious = () => {
    switch (type) {
      case 'daily':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, -1));
        break;
    }
    setGeneratedCalendar(null);
  };

  const handleNext = () => {
    switch (type) {
      case 'daily':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
    setGeneratedCalendar(null);
  };

  const renderDailyCalendar = () => {
    const { date, breakfast, lunch, dinner, snack } = generatedCalendar;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          Menu du {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { time: 'Petit-déjeuner', meal: breakfast },
            { time: 'Déjeuner', meal: lunch },
            { time: 'Dîner', meal: dinner },
            { time: 'Collation', meal: snack },
          ].map((item, index) => (
            <div key={index} className="card overflow-hidden">
              <div className="bg-primary-100 px-4 py-2">
                <h3 className="font-medium text-primary-800">{item.time}</h3>
              </div>
              <div className="p-4 flex items-center">
                {item.meal ? (
                  <>
                    <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                      <img src={item.meal.image} alt={item.meal.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.meal.name}</h4>
                      <p className="text-sm text-slate-500">{item.meal.category}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Aucun plat disponible</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyCalendar = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = addDays(startDate, 6);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          Menu du {format(startDate, 'd MMMM', { locale: fr })} au {format(endDate, 'd MMMM yyyy', { locale: fr })}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Jour</th>
                <th className="py-3 px-4 border-b text-left">Petit-déjeuner</th>
                <th className="py-3 px-4 border-b text-left">Déjeuner</th>
                <th className="py-3 px-4 border-b text-left">Dîner</th>
              </tr>
            </thead>
            <tbody>
              {generatedCalendar.map((day, index) => (
                <tr key={index} className={isSameDay(day.date, new Date()) ? 'bg-primary-50' : ''}>
                  <td className="py-3 px-4 border-b">
                    <div className="font-medium">{format(day.date, 'EEEE', { locale: fr })}</div>
                    <div className="text-sm text-slate-500">{format(day.date, 'd/MM')}</div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {day.breakfast ? (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                          <img src={day.breakfast.image} alt={day.breakfast.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm">{day.breakfast.name}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Aucun plat</div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {day.lunch ? (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                          <img src={day.lunch.image} alt={day.lunch.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm">{day.lunch.name}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Aucun plat</div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {day.dinner ? (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                          <img src={day.dinner.image} alt={day.dinner.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm">{day.dinner.name}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Aucun plat</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMonthlyCalendar = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          Menu du mois de {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>

        <div className="space-y-8">
          {generatedCalendar.map((week, weekIndex) => (
            <div key={weekIndex} className="space-y-2">
              <h3 className="font-medium">Semaine {weekIndex + 1}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-3 border-b text-left text-xs">Jour</th>
                      {week.map((day, dayIndex) => (
                        <th key={dayIndex} className="py-2 px-3 border-b text-center text-xs">
                          <div>{format(day.date, 'EEE', { locale: fr })}</div>
                          <div>{format(day.date, 'd/MM')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border-b font-medium text-xs">Déjeuner</td>
                      {week.map((day, dayIndex) => (
                        <td key={`lunch-${dayIndex}`} className="py-2 px-3 border-b text-center">
                          {day.lunch ? (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mb-1">
                                <img src={day.lunch.image} alt={day.lunch.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs">{day.lunch.name}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Aucun plat</div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-b font-medium text-xs">Dîner</td>
                      {week.map((day, dayIndex) => (
                        <td key={`dinner-${dayIndex}`} className="py-2 px-3 border-b text-center">
                          {day.dinner ? (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mb-1">
                                <img src={day.dinner.image} alt={day.dinner.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs">{day.dinner.name}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Aucun plat</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (!generatedCalendar) {
      return (
        <div className="text-center text-gray-500">
          Aucun plat disponible dans la base de données. Veuillez ajouter des plats dans la section "Plats".
        </div>
      );
    }

    switch (type) {
      case 'daily':
        return renderDailyCalendar();
      case 'weekly':
        return renderWeeklyCalendar();
      case 'monthly':
        return renderMonthlyCalendar();
      default:
        return renderWeeklyCalendar();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container-custom py-6">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/home')} className="mr-3 p-2 rounded-full hover:bg-slate-200">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Calendrier {type === 'daily' ? 'Journalier' : type === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</h1>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CalendarIcon className="mr-2 text-primary-500" size={24} />
              Générer un calendrier de repas
            </h2>

            <div className="flex gap-2">
              <button onClick={handlePrevious} className="p-2 rounded-md hover:bg-slate-100">
                ←
              </button>
              <div className="px-3 py-1 bg-slate-100 rounded-md">
                {type === 'daily'
                  ? format(currentDate, 'd MMMM yyyy', { locale: fr })
                  : type === 'weekly'
                  ? `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM', { locale: fr })}`
                  : format(currentDate, 'MMMM yyyy', { locale: fr })}
              </div>
              <button onClick={handleNext} className="p-2 rounded-md hover:bg-slate-100">
                →
              </button>
            </div>
          </div>

          <p className="text-slate-600 mb-6">
            Générez automatiquement un planning de repas basé sur tous les plats disponibles.
          </p>

          <button onClick={handleGenerateCalendar} className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Génération en cours...
              </span>
            ) : (
              'Générer le calendrier'
            )}
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="text-center text-gray-500">
            Aucun plat disponible dans la base de données. Veuillez ajouter des plats dans la section "Plats".
          </div>
        ) : (
          generatedCalendar && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" ref={calendarRef}>
              {renderCalendar()}

              <div className="mt-8 flex flex-wrap gap-3 justify-between items-center">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Partagez ce calendrier avec votre famille</div>
                  <div className="flex gap-3">
                    <button onClick={handleDownloadPDF} className="btn btn-secondary">
                      <Download size={18} />
                      <span className="ml-2">Télécharger PDF</span>
                    </button>

                    <div className="relative">
                      <button onClick={handleSendByEmail} className="btn btn-primary">
                        <Send size={18} />
                        <span className="ml-2">Envoyer par email</span>
                      </button>

                      {showTooltip && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-green-100 text-green-800 rounded-md text-sm">
                          {tooltipMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-500 text-sm">
                  <Info size={16} className="mr-2" />
                  <span>Le calendrier sera envoyé à tous les membres de votre famille</span>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default Calendar;
