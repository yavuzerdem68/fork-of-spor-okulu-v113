import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-8"
        >
          <WifiOff className="w-24 h-24 text-gray-400 mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Çevrimdışı Moddasınız
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          İnternet bağlantınız kesildi. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          <Wifi className="w-5 h-5" />
          Tekrar Dene
        </motion.button>

        <div className="mt-8 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Çevrimdışı Özellikler:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Önceden yüklenmiş sayfalar görüntülenebilir</li>
            <li>• Uygulama önbelleğe alınmış verilerle çalışır</li>
            <li>• Bağlantı geri geldiğinde otomatik senkronizasyon</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}