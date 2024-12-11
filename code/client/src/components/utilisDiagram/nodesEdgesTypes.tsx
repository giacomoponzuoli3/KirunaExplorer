import EdgeDirectConsequence from "./EdgeDirectConsequence";
import EdgeCollateralConsequence from "./EdgeCollateralConsequence";
import EdgePrevision from "./EdgePrevision";
import EdgeUpdate from "./EdgeUpdate";
import EdgeDefault from "./EdgeDefault";
import { Handle, Position } from "@xyflow/react";

// Componente per il nodo personalizzato
const IconNode = ({ data }: any) => {

    return (
      <div className="custom-marker flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950 z-[1000]"
        onClick={() => {}}
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
  
  ì
  
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