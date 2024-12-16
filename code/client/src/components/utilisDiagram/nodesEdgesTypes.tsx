import EdgeDirectConsequence from "./EdgeDirectConsequence";
import EdgeCollateralConsequence from "./EdgeCollateralConsequence";
import EdgePrevision from "./EdgePrevision";
import EdgeUpdate from "./EdgeUpdate";
import EdgeDefault from "./EdgeDefault";
import { Handle, Position } from "@xyflow/react";

// Componente per il nodo personalizzato
const IconNode = ({ data }: any) => {

    return (
      <div 
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
      >  
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