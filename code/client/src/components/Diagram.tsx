import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, ViewportPortal } from '@xyflow/react';
import 'reactflow/dist/style.css';
import { DocCoordinates } from '../models/document_coordinate';
import Link from '../models/link';
import API from '../API/API';
import DiagramTable from './DiagramTable';
import Coordinate from '../models/coordinate';

// Componente per il nodo personalizzato
const CustomNode = ({ data }: any) => {
  return (
    <div className="custom-marker flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
      {data.label}
    </div>
  );
};

// Definire il tipo di nodo al di fuori del componente per evitare di crearlo ad ogni render
const nodeTypes = {
  custom: CustomNode,
};

interface NodeDoc extends Record<string, unknown> {
  doc: DocCoordinates
}

const Diagram = (props: any) => {
  const [documents, setDocuments] = useState<DocCoordinates[] | null>(null);
  const [nodes, setNodes] = useState<Node<NodeDoc>[]>([]);

  //const [edges, setEdges] = useState<Edge<Link>[]>([]);

  const [scales, setScales] = useState<string[]>([]);
  const [scaleHeights, setScaleHeights] = useState<number[]>([]); // Array per le altezze dinamiche delle scale
  
  const [years, setYears] = useState<number[] | null>(null); 

  const [scrollHeight, setScrollHeight] = useState<number | null>(null);


  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  /*
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  */

  const allDocuments = async () => {
    try {
      const documents = await API.getAllDocumentsCoordinates();
      setDocuments(documents);
      console.log(documents);

      const uniqueScales = Array.from(
        new Set(
          documents.map((doc: DocCoordinates) => doc.scale).filter((scale: string) => scale)
        )
      ).sort() as string[];

      const uniqueYears = Array.from(
        new Set(
          documents.map((doc: DocCoordinates) => doc.issuanceDate).filter((date: string) => normalizeDate(date))
        )
      ).sort() as number[];


      setScales(uniqueScales);
      setYears(uniqueYears);
      
      setScaleHeights(Array(scales.length).fill(50));
      

    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    allDocuments();
  }, []);

  useEffect(() => {
    if(scaleHeights != null){
      setScrollHeight(scaleHeights.reduce((total, height) => total + height, 0));
    }
  }, [scaleHeights])
  

  const normalizeDate = (date: string) => {
    if(date.includes("/")){
      const year = date.split('/')[date.split('/').length - 1];
      return Number(year);
    }else{
      return Number(date);
    }
  };

 
  useEffect(() => {
    
  }, [documents, scales, scaleHeights]);

  return (
    
    <div style={{
      width: '100%',
      height: '700px', border: "none"
      }}
      className="diagram-svg-fix">
        <ReactFlow
            onNodesChange={onNodesChange}

            nodeTypes={nodeTypes}

            connectionLineStyle={{ stroke: "rgb(0, 0, 0)", strokeWidth: 2 }}
            panOnDrag={true}
            panOnScroll={true}
            preventScrolling={false}
  
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            translateExtent={[
                [0, 0],
                [+Infinity, +Infinity]
            ]}
            nodeExtent={[
                [200,50],
                [+Infinity, 750]
            ]}
            minZoom={1}

            nodesDraggable={false}
        >
          <ViewportPortal>
              <DiagramTable />
          </ViewportPortal>
        </ReactFlow>
    </div>


  );
};

export { Diagram };
