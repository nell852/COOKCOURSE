import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, AlertCircle, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

const MarketList = () => {
  const [marketList, setMarketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef(null); // Reference to the table for PDF generation

  useEffect(() => {
    const fetchMarketList = async () => {
      try {
        const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
        const ingredients = ingredientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const ingredientsMap = {};

        ingredients.forEach(ingredient => {
          if (!ingredient.name) {
            return; // Ignore ingredients without a name
          }

          const key = ingredient.name.toLowerCase().trim();

          if (!ingredientsMap[key]) {
            ingredientsMap[key] = {
              name: ingredient.name,
              quantity: 0,
              unit: ingredient.unit || 'unité',
              price: 0,
            };
          }

          ingredientsMap[key].quantity += ingredient.quantity || 1;
          ingredientsMap[key].price += (ingredient.price || 0) * (ingredient.quantity || 1);
        });

        setMarketList(Object.values(ingredientsMap));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketList();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const generatePDF = () => {
    const element = tableRef.current;
    if (element) {
      html2pdf()
        .from(element)
        .set({
          margin: [10, 10, 10, 10],
          filename: 'market_list.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .save();
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <ShoppingBag className="text-green-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold">Market List</h1>
          {marketList.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generatePDF}
              className="ml-auto flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300"
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </motion.button>
          )}
        </motion.div>

        {marketList.length === 0 ? (
          <div className="empty-state flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle size={48} />
            <p>No items in your market list</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div ref={tableRef} className="w-full">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Item</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Unit</th>
                    <th className="py-3 px-4 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {marketList.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.unit}</td>
                      <td className="py-3 px-4">{formatPrice(item.price)} FCFA</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketList;
