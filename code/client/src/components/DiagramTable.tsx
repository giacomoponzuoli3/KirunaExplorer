
const DiagramTable = (props: any) => {
  const sideWidth = 200;

  return (
    <table
    style={{
      transform: 'none',
      width: `${props.scrollWidth}px`, // Larghezza totale
      height: `${props.scrollHeight}px`, // Altezza totale
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
        {props.years.map((year: any, index: any) => (
          <th
            key={`head-${year}`}
            id={`head-${year}`}
            className="header-cell border-r border-gray-300 text-center text-gray-700 p-4 font-medium"
            style={{
              width: `${props.yearsWidths[index]}px`,
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
      {props.scales.map((scale: any, scaleIndex: any) => (
        <tr 
          key={`docscale-${scale}`} 
          className={`border-b border-gray-200 ${
            scaleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          } hover:bg-gray-100 transition-all duration-200`}
        >
          <td 
            style={{ height: `${scale}px` }}
            className={`side-cell border-r-2 border-gray-300 p-4 text-gray-700 font-medium`}
          >
            {scale}
          </td>
  
          {props.years.map((year: any, yearIndex: any) => (
            <td
              key={`${scale}-${yearIndex}`}
              style={{ width: `${year}px` }}
              className={`border-r border-gray-200 relative`}
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
