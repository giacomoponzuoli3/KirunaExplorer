import React, { useEffect, useState } from 'react';
import { DocCoordinates } from '../models/document_coordinate';
import API from '../API/API';

const DiagramTable = (props: any) => {
  const [scales, setScales] = useState<string[]>([]);

  const getScales = async () => {
    try {
      const documents = await API.getAllDocumentsCoordinates();
      console.log(documents);

      const uniqueScales = Array.from(
        new Set(
          documents.map((doc: DocCoordinates) => doc.scale).filter((scale: string) => scale)
        )
      ).sort() as string[];

      setScales(uniqueScales);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getScales().then();
  }, []); // Aggiungi la dipendenza per evitare il ciclo infinito

  // 2️⃣ Calcoliamo gli anni una sola volta (non ad ogni render)
  const years = Array.from({ length: 22 }, (_, index) => 2004 + index);
  const yearWidths = Array(22).fill(250); // 22 colonne, ognuna larga 300px
  const scalesHeights = Array(scales.length).fill(50);

  const scrollWidth = yearWidths.reduce((total, width) => total + width, 0); // Assicurati che la somma sia corretta
  const scrollHeight = scalesHeights.reduce((total, height) => total + height, 0);
  
  const sideWidth = 200;

  return (
    <table
    style={{
      width: `${scrollWidth + sideWidth}px`, // Larghezza totale
      height: `${scrollHeight}px`, // Altezza totale
      tableLayout: 'fixed', // Mantiene larghezze uniformi
    }}
    className="border-collapse border border-gray-200"
  >
    {/* Header con gli anni */}
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        <th
          style={{ width: `${sideWidth}px` }}
          className="header-cell border-r-2 border-gray-300 text-left p-4"
        ></th>
        {years.map((year, index) => (
          <th
            key={`head-${year}`}
            id={`head-${year}`}
            className="header-cell border-r border-gray-300 text-center text-gray-700 p-4 font-medium"
            style={{
              width: `${yearWidths[index]}px`,
              whiteSpace: 'nowrap',
            }}
          >
            {year}
          </th>
        ))}
      </tr>
    </thead>
  
    {/* Corpo della tabella con le scale */}
    <tbody>
      {scales.map((scale, scaleIndex) => (
        <tr 
          key={`docscale-${scale}`} 
          className={`border-b border-gray-200 ${
            scaleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          } hover:bg-gray-100 transition-all duration-200`}
        >
          <td 
            className="side-cell border-r-2 border-gray-300 p-4 text-gray-700 font-medium"
          >
            {scale}
          </td>
  
          {yearWidths.map((_, yearIndex) => (
            <td
              key={`${scale}-${yearIndex}`}
              className={`h-18 border-r border-gray-200 relative`}
            >
              {/* Linea diagonale (opzionale) */}
              {/* <div className="absolute inset-0 w-full h-1 bg-blue-500 rotate-45 transform origin-bottom-left"></div> */}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
  
  );
};

export default DiagramTable;
