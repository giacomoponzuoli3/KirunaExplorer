import React, { useState } from 'react';

function DocumentLegend() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="sm:hidden bg-transparent text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md shadow-sm border border-gray-300 w-full text-left flex justify-between items-center"
      >
        <span className="font-medium">Document Type Legend</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu for small screens */}
      {isDropdownOpen && (
        <div className="sm:hidden absolute bg-white border border-gray-300 rounded-md shadow-lg mt-2 w-full p-2 space-y-2 z-50">
          {documentTypes.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md py-1 px-2"
            >
              <img
                src={`/kiruna/img/${item.icon}`}
                alt={item.type}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <span className="text-gray-700">{item.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend for larger screens */}
      <div className="hidden sm:flex items-center justify-start bg-white p-3 shadow-md fixed top-16 left-0 right-0 z-50 space-x-6">
        <span className="text-gray-700 text-sm font-medium mr-4">Document Type Legend</span>
        {documentTypes.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <img
              src={`/kiruna/img/${item.icon}`}
              alt={item.type}
              className="w-6 h-6 object-contain"
            />
            <span className="text-gray-700">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { DocumentLegend };
