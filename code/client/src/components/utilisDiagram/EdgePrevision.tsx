import { Edge, EdgeProps, Position, getBezierPath } from "@xyflow/react";
import { EdgeData } from "./EdgeCollateralConsequence";
import { useState } from "react";

// Definisci un tipo per i dati che passano nel prop `data`
const EdgePrevision = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}: EdgeProps & {data: EdgeData}) => {

  const [hovered, setHovered] = useState(false); // Track hover state

  // Ottieni l'offset da 'data'
  const { offset = 0 } = data || {};

  // Calcolo delle distanze orizzontali e verticali
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;

  // Calcolo della posizione di controllo del Bezier
  let controlX = (sourceX + targetX) / 2;
  let controlY = (sourceY + targetY) / 2;

  // Modifica la curva in base all'offset
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Se la distanza orizzontale è maggiore, modifica l'altezza della curva
    controlY += offset;
  } else {
    // Se la distanza verticale è maggiore, modifica la larghezza della curva
    controlX += offset;
  }

  // Decidi la forma della curva in base all'offset
  const curve = deltaX > deltaY ? 0.5 + offset / 100 : 0.5 - offset / 100;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature: curve
  });

  return (
    <g>
    <path
      id={id}
      d={edgePath}
      stroke="#1E90FF"
      strokeWidth={2}
      fill="none"
      strokeDasharray="2,5"
      onMouseEnter={() => setHovered(true)} // Show tooltip
      onMouseLeave={() => setHovered(false)} // Hide tooltip
    />
    {/* Tooltip rendered using foreignObject */}
    {hovered && (
          <foreignObject
          x={controlX - 50} // Adjust X position to center the div
          y={controlY - 50} // Adjust Y position above the edge
          width={180}       // Width of the tooltip
          height={50}       // Height of the tooltip
          style={{ overflow: 'visible', pointerEvents: 'none' }} // Ensure visibility
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 123, 255, 0.9)', // Background color
              color: '#fff',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none', // Ensure it doesn't block mouse events
            }}
          >
            Connection type: Prevision {/* Display the document title */}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default EdgePrevision;
