import { Edge, EdgeProps, Position, getBezierPath } from "@xyflow/react";
import { EdgeData } from "./EdgeCollateralConsequence";

// Definisci un tipo per i dati che passano nel prop `data`
const EdgePrevision = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}: EdgeProps & {data: EdgeData}) => {

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
    <path
      id={id}
      d={edgePath}
      stroke="#1E90FF"
      strokeWidth={2}
      fill="none"
      strokeDasharray="2,5"
    />
  );
};

export default EdgePrevision;
