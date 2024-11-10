import React, { useState, useEffect } from 'react';

function DocumentLegend() {
  const [isLegendVisible, setIsLegendVisible] = useState(false);

  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };

  const documentTypes = [
    { type: 'Informative document', icon: 'informativeDocument.png' },
    { type: 'Prescriptive document', icon: 'prescriptiveDocument.png' },
    { type: 'Material effect', icon: 'construction.png' },
    { type: 'Design document', icon: 'designDocument.png' },
    { type: 'Technical document', icon: 'technicalDocument.png' },
    { type: 'Agreement', icon: 'agreement.png' },
    { type: 'Conflict', icon: 'conflict.png' },
    { type: 'Consultation', icon: 'consultation.png' },
  ];

  // Close the legend if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isLegendVisible && !event.target.closest('#legend-box') && !event.target.closest('#toggle-button')) {
        setIsLegendVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLegendVisible]);

  return (
    <div className="relative">
      
      {/* Toggle Icon Button in Bottom-Left */}
      <button
        id="toggle-button"
        onClick={toggleLegend}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200"
        aria-label="Toggle Legend"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>


      {/* Overlay for closing legend */}
      {isLegendVisible && <div className="fixed inset-0 bg-black opacity-25 z-40"></div>}

      {/* Legend Modal */}
      {isLegendVisible && (
        <div
          id="legend-box"
          className="fixed bottom-16 left-4 max-w-sm w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50 animate-rotate-in"
        >
          <h3 className="text-center text-lg font-semibold text-gray-800 mb-3">Document Type Legend</h3>
          <div className="space-y-3">
            {documentTypes.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-md border border-gray-100 shadow-sm"
              >
                <img
                  src={`/kiruna/img/${item.icon}`}
                  alt={item.type}
                  className="w-6 h-6 object-contain rounded-full bg-gray-200 p-1"
                />
                <span className="text-gray-700 text-sm font-medium">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { DocumentLegend };
