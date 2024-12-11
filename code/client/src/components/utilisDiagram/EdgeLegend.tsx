import React from "react";

const EdgeLegend = () => {
  // Definisci i tipi di edge con i loro colori, etichette e stile del tratto
  const edgeTypes = {
    "Direct consequence": {
      color: "#FF5733", // Rosso
      label: "Direct Consequence",
      dashArray: null, 
    },
    "Collateral consequence": {
      color: "#000", // Nero
      label: "Collateral Consequence",
      dashArray: "5,5",  // Dash pattern
    },
    "Prevision": {
      color: "#1E90FF", // Verde Lime
      label: "Prevision",
      dashArray: "2,5",  
    },
    "Update": {
      color: "#32CD32", 
      label: "Update",
      dashArray: "10,5,2,5", // Dash pattern
    },
  };

  return (
    <div className="pt-3 h-screen border-1 border-t-gray-300  bg-white w-full mb-4">
      <h4 className="text-lg font-semibold mb-2 ml-2">Legend of Connection Types</h4>
      {/* Contenitore per la legenda, usiamo flex per l'allineamento orizzontale */}
      <div className="flex justify-evenly items-center">
        {Object.entries(edgeTypes).map(([key, { color, label, dashArray }]) => (
          <div key={key} className="flex items-center space-x-4 pb-2">
            {/* Tratto per il tipo di edge usando SVG */}
            <svg width="60" height="4">
              <line
                x1="0"
                y1="2"
                x2={label === "Update" ? "70" : "40"}
                y2="2"
                stroke={color}
                strokeWidth="4"
                strokeDasharray={dashArray ? dashArray : "0"}  // Imposta il dash pattern se disponibile
              />
            </svg>
            {/* Etichetta */}
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EdgeLegend;
