import React, { useState, useEffect } from 'react';
import { getFieldInfo } from '../services/geminiService';
import { FieldLocationData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  city: string;
}

export const FieldInfoModal: React.FC<Props> = ({ isOpen, onClose, fieldName, city }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FieldLocationData | null>(null);

  useEffect(() => {
    if (isOpen && fieldName) {
      setLoading(true);
      getFieldInfo(fieldName, city).then((info) => {
        setData(info);
        setLoading(false);
      });
    }
  }, [isOpen, fieldName, city]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-navy-900 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Field Intelligence</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-900"></div>
              <p className="mt-4 text-gray-500 text-sm">Consulting AI Maps...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-red-500 text-xl mt-1"></i>
                <div>
                  <h4 className="font-bold text-navy-900 text-lg">{data.name}</h4>
                  <p className="text-gray-600">{data.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                 <i className="fas fa-star text-gold-400"></i>
                 <span className="font-semibold text-gray-700">Rating: {data.rating || 'N/A'}</span>
              </div>

              <a 
                href={data.googleMapsUri} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Open Directions in Google Maps
              </a>
              <p className="text-xs text-center text-gray-400 mt-2">Powered by Google Gemini Grounding</p>
            </div>
          ) : (
            <p className="text-red-500 text-center">Could not load field data.</p>
          )}
        </div>
      </div>
    </div>
  );
};
