import React, { useState, useEffect } from 'react';
import iconLegendMap from '../img/iconLegendMap.png'

function DocumentLegend() {
  const [isLegendVisible, setIsLegendVisible] = useState(false);

  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };



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
        className="fixed bottom-4 left-4 z-[1000] bg-blue-950 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200"
        aria-label="Toggle Legend"
      >
        <img
          src={iconLegendMap}
          alt="Legend Map Icon"
          className="w-5 h-5 object-contain" // Customize the size
        />
      </button>

      {/* Overlay for closing legend */}
      {isLegendVisible && (
        <div
          className="absolute left-[4rem] bottom-[3rem] w-[20rem] h-[10rem] bg-black opacity-25 z-40"
        ></div>
      )}
      {/* Legend Modal */}
      {isLegendVisible && (
        <div
          id="legend-box"
          className="fixed left-[5rem] bottom-4 transform -translate-y-1/2 flex items-center bg-white rounded-sm shadow-lg px-1 py-1 border border-gray-200 z-[1000] animate-rotate-in mb-2"
          style={{ zIndex: 1000 }}
        >
          {/* Red Cluster */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-xs font border border-white shadow-md">
              N
            </div>
            <span className="text-gray-700 text-sm">
              Points with the same coordinates
            </span>
          </div>
          {/* Separator */}
          <div className="mx-4 h-6 border-l border-gray-300"></div>
          {/* Blue Cluster */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white text-xs font border border-white shadow-md">
              N
            </div>
            <span className="text-gray-700 text-sm">
              Points with nearby coordinates
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export { DocumentLegend };


/*
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

*/
