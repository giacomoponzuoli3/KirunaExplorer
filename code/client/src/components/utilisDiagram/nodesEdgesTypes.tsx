import EdgeDirectConsequence from "./EdgeDirectConsequence";
import EdgeCollateralConsequence from "./EdgeCollateralConsequence";
import EdgePrevision from "./EdgePrevision";
import EdgeUpdate from "./EdgeUpdate";
import EdgeDefault from "./EdgeDefault";
import { Handle, Position } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

// Tooltip Component
const Tooltip = ({ title, x, y }: { title: string; x: number; y: number}) => {

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: y, // Adjust position above the node
        left: x,
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(0, 123, 255, 0.9)',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '8px',
        fontSize: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        pointerEvents: 'none', // Tooltip won't block interactions
      }}
    >
      {title}
    </div>,
    document.body // Render the tooltip outside the React Flow container
  );
};
// Componente per il nodo personalizzato
const IconNode = ({ data, position }: any) => {

  const [isHovered, setIsHovered] = useState(false); // State to track hover
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // Position for tooltip
  const nodeRef = useRef<HTMLDivElement | null>(null); // Ref to the node div

  useEffect(() => {
    if (isHovered && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      // Set the tooltip position above the node (adjust as needed)
      setTooltipPosition({
        x: rect.left + rect.width / 2, // Center the tooltip horizontally
        y: rect.top + 350, // Position above the node, you can adjust the `-20` as needed
      });
    }
  }, [isHovered]);

    return (
      <div 
      ref={nodeRef} // Attach ref to the node
      className={`flex items-center justify-center 
        transition duration-200 transform 
        ${data.isSelected ? 'scale-110' : ''}`} // Add scaling only on selection
      style={{
        width: data.isSelected ? '48px' : '45px',
        height: data.isSelected ? '48px' : '45px',
        backgroundColor: data.isSelected ? '#FFD700' : 'white', // Yellow for selected, Blue for default
        borderRadius: '50%',
        border: data.isSelected ? '3px solid #ffbf00' : '1px solid #ddd', // Yellow border on select
        boxShadow: data.isSelected ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}

      onMouseEnter={() => setIsHovered(true)} // Show tooltip on hover
      onMouseLeave={() => setIsHovered(false)} // Hide tooltip when not hovered
      >  
      {/* Tooltip */}
      {isHovered && (
        <Tooltip title={data.doc.title} x={tooltipPosition.x} y={tooltipPosition.y}/>
      )}
        {/* Handle input */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="target"
          position={Position.Right}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />

        {/* Handle output */}
        <Handle
          type="source"
          position={Position.Top}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="source"
          position={Position.Left}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={false}
          style={{
            width: 10,
            height: 10,
            background: "#555",
            borderRadius: "50%",
            visibility: "hidden",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centra l'handle
          }}
        />

  
        {data.label}
  
      </div>
    );
  };
  
  
  // Definire il tipo di nodo al di fuori del componente per evitare di crearlo ad ogni render
  export const nodeTypes = {
    icon: IconNode,
  };
  
  export const edgeTypes = {
    "Direct consequence": EdgeDirectConsequence,
    "Collateral consequence": EdgeCollateralConsequence,
    "Prevision": EdgePrevision,
    "Update": EdgeUpdate,
    default: EdgeDefault,
  };