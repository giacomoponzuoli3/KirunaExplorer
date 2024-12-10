import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, ViewportPortal, Handle, Position } from '@xyflow/react';
import 'reactflow/dist/style.css';
import { DocCoordinates } from '../models/document_coordinate';
import Link from '../models/link';
import API from '../API/API';
import DiagramTable from './DiagramTable';
import Coordinate from '../models/coordinate';
import { DocLink } from '../models/document_link';

// Componente per il nodo personalizzato
const CustomNode = ({ data }: any) => {
  const handleCount = 100; // Numero di handle da generare

  return (
    <div className="custom-marker flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
      
      {/* Genera 100 handle di origine */}
      {Array.from({ length: handleCount }).map((_, index) => (
        <div
          key={`source-${data.doc.id}-${index}`}
          id={`source-${data.doc.id}-${index}`}  // Handle di origine unico
          className="react-flow__handle react-flow__handle-source"
        />
      ))}

      {data.label}

      {/* Genera 100 handle di destinazione */}
      {Array.from({ length: handleCount }).map((_, index) => (
        <div
          key={`target-${data.doc.id}-${index}`}
          id={`target-${data.doc.id}-${index}`}  // Handle di destinazione unico
          className="react-flow__handle react-flow__handle-target"
        />
      ))}

    </div>
  );
};


// Definire il tipo di nodo al di fuori del componente per evitare di crearlo ad ogni render
const nodeTypes = {
  custom: CustomNode,
};

interface NodeDoc extends Record<string, unknown> {
  label: string;  // Puoi aggiungere altri campi che ritieni necessari
  doc: DocCoordinates
}

interface EdgeLink extends Record<string, unknown> {
  docLink: DocLink
}


const Diagram = (props: any) => {
  const [documents, setDocuments] = useState<DocCoordinates[] | null>(null);

  //nodes
  const [nodes, setNodes] = useState<Node<NodeDoc>[]>([]);
  //edges
  const [edges, setEdges] = useState<Edge<EdgeLink>[]>([]);

  //scales
  const [scales, setScales] = useState<string[]>([]);
  //years
  const [years, setYears] = useState<number[] | null>(null);

  //heights of scales
  const [scaleHeights, setScaleHeights] = useState<number[]>([]); // Array per le altezze dinamiche delle scale
  //witdhs of years
  const [yearsWidths, setYearsWidths] = useState<number[]>([]); // Array per le altezze dinamiche delle scale

  //scroll diagram
  const [scrollHeight, setScrollHeight] = useState<number | null>(null);
  const [scrollWidth, setScrollWidth] = useState<number | null>(null);


  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );


  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => addEdge(params, eds));
    },
    []
  );


  
  const normalizeDate = (date: string) => Number(date.includes("/") ? date.split('/').pop() : date);
  

  const allDocuments = async () => {
    try {
      const getDocuments = await API.getAllDocumentsCoordinates();
      setDocuments(getDocuments);
      
      //get the scales
      const uniqueScales = Array.from(
        new Set(
          getDocuments.map((doc: DocCoordinates) => doc.scale)
        )
      ).sort() as string[];

      //get the years
      const uniqueYears = Array.from(
        new Set(
          getDocuments
            .map((doc: DocCoordinates) => normalizeDate(doc.issuanceDate)) // Mappa subito con normalizeDate
            .filter((year: number) => !isNaN(year)) // Filtra solo gli anni validi (non NaN)
        )
      ).sort() as number[];
      
      setScales(uniqueScales);
      setYears(uniqueYears);
      
      const heights = Array(uniqueScales.length).fill(50);
      const widths = Array(uniqueYears.length).fill(250);
    
      setScaleHeights(heights);
      setYearsWidths(widths);

      // Per tenere traccia delle posizioni occupate
      const occupiedPositions: Set<string> = new Set();


      const createdNodes = getDocuments.map((doc: DocCoordinates, index: number) => {
        const yearIndex = uniqueYears.indexOf(normalizeDate(doc.issuanceDate));
        const scaleIndex = uniqueScales.indexOf(doc.scale);
      
        // Calcolare la posizione base
        const xBase = widths.slice(0, yearIndex).reduce((acc, w) => acc + w + 40, 200); // Posizione X base
        const yBase = heights.slice(0, scaleIndex).reduce((acc, h) => acc + h + 23, 90);  // Posizione Y base
      
        // Verifica se la posizione è già stata occupata
        let x = xBase;
        let y = yBase;
      
        // Verifica se la posizione (x, y) è già occupata
        const positionKey = `${x},${y}`; // Creiamo una chiave unica per la posizione
        let offset = 40;

        while (occupiedPositions.has(positionKey)) {
          // Aggiungi un offset se la posizione è occupata
          x += offset;
          y += offset;
        }

        // Segna la nuova posizione come occupata
        occupiedPositions.add(`${x},${y}`);


        return {
          id: `node-${index}`,
          type: 'custom', // Usa il tipo di nodo personalizzato
          position: { x, y }, 
          data: { 
            label: props.getDocumentIcon(doc.type, 5),
            doc 
          },
        };
      });
      
      setNodes(createdNodes);



    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

          /*for (const doc of documents) {
          try {
            const docLinks = await API.getDocumentLinksById(doc.id); // Ottieni i collegamenti per il documento
            console.log(`Fetching links for document ${doc.id}:`, docLinks);
      
            docLinks.forEach((link: DocLink) => {
              // Trova il nodo di origine (source) e il nodo di destinazione (target)
              const sourceNode = nodes.find((node: any) => node.data.doc.id === doc.id);
              const targetNode = nodes.find((node: any) => node.data.doc.id === link.id);
              
    
              console.log('Source Node:', sourceNode);
              console.log('Target Node:', targetNode);
    
              if (!sourceNode) {
                console.error(`Source node not found for document ${doc.id}`);
                return;
              }
              if (!targetNode) {
                console.error(`Target node not found for link ${link.id}`);
                return;
              }
      
              // Crea l'ID univoco per l'edge
              const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${link.relatedLink.name}`;
              const reverseId = `edge-${targetNode.id}-${sourceNode.id}-${link.relatedLink.name}`;
      
              // Verifica se l'ID dell'edge è già stato creato per evitare duplicati
              if (createdEdgeIds.has(edgeId) || createdEdgeIds.has(reverseId)) {
                console.log(`Edge ${edgeId} already exists, skipping.`);
                return;
              }
              console.log(targetNode.id);
              console.log(sourceNode.id);

              console.log("sourceHandle:", `source-${doc.id}`);
              console.log("targetHandle:", `target-${link.id}`);
      
              // Aggiungi l'ID dell'edge al set per evitare duplicati futuri
              createdEdgeIds.add(edgeId);
      
              // Aggiungi l'edge all'array
              edges.push({
                id: edgeId,
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: `source-${doc.id}`, // ID del handle di origine
                targetHandle: `target-${link.id}`,// ID del handle di destinazione
                animated: true, // Imposta l'animazione
                style: { stroke: 'black', strokeWidth: 2 },
              });
      
              console.log(`Edge created: ${edgeId}`);
            });

            

          } catch (error) {
            console.error(`Error fetching links for document ${doc.id}:`, error);
          }
        }*/
      
  const createEdges = async (documents: DocCoordinates[], nodes: Node[]) => {
    const edges: Edge<EdgeLink>[] = [];
    const createdEdgeIds = new Set<string>(); // Per evitare duplicati
  
    for (const document of documents) {
      try {
        const docLinks = await API.getDocumentLinksById(document.id); // Ottieni i collegamenti per il documento
        
        const sourceNode = nodes.find((node: any) => node.data.doc.id === document.id);
        if (!sourceNode) {
          console.error(`Source node not found for document ${document.id}`);
          continue;
        }
  
        docLinks.forEach((link: DocLink, index: number) => {
          const targetNode = nodes.find((node: any) => node.data.doc.id === link.id);
          
          if (!targetNode) {
            console.error(`Target node not found for link ${link.id}`);
            return;
          }
  
          // Crea l'ID unico per l'edge
          const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${link.relatedLink.name}`;
          if (createdEdgeIds.has(edgeId)) {
            console.log(`Edge ${edgeId} already exists, skipping.`);
            return;
          }
  
          // Aggiungi l'ID dell'edge al set per evitare duplicati
          createdEdgeIds.add(edgeId);
  
          // Calcola il handle index (puoi personalizzare la logica se necessario)
          const sourceHandleIndex = index % 10; // Usa l'indice % 10 per scegliere un handle diverso
          const targetHandleIndex = index % 10;
  
          // Crea il nuovo edge
          edges.push({
            id: edgeId,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle: `source-${document.id}-${sourceHandleIndex}`, // Handle di origine univoco
            targetHandle: `target-${link.id}-${targetHandleIndex}`, // Handle di destinazione univoco
            animated: true, 
            style: { stroke: 'black', strokeWidth: 2 },
          });
  
          console.log(`Edge created: ${edgeId} from sourceHandle: source-${document.id}-${sourceHandleIndex} to targetHandle: target-${link.id}-${targetHandleIndex}`);
        });
      } catch (error) {
        console.error(`Error fetching links for document ${document.id}:`, error);
      }
    }
  
    return edges;
  };


  useEffect(() => {
    if (documents && nodes.length > 0) {
      console.log("entrato");
      if(edges.length === 0){
        console.log("entrato2");
        createEdges(documents, nodes).then((e) => setEdges(e));
      }
    }
  }, [nodes, documents]);

  useEffect(() => {
    allDocuments();
  }, []);

  useEffect(() => {
    if(scaleHeights){
      setScrollHeight(scaleHeights.reduce((total: any, height: any) => total + height, 0));
    }
    
  }, [scaleHeights])

  useEffect(() => {
    if(yearsWidths){
      setScrollWidth(yearsWidths.reduce((total: any, width: any) => total + width, 200) + 200)
    }
  }, [yearsWidths])
  


  if (!documents || !years || !scales || !scaleHeights.length || !yearsWidths.length || scrollHeight === null || scrollWidth === null) {
    return <><span>Loading....</span></>;
  }else{
    return (   
          <div 
            style={{ width: '100%', height: !scaleHeights ? `700px` : scaleHeights.reduce((acc, curr) => acc + curr,  250), border: "none", transform: 'none'}} 
            className="diagram-svg-fix"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}

              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}

              nodeTypes={nodeTypes}
              connectionLineStyle={{ stroke: "rgb(0, 0, 0)", strokeWidth: 2 }}
              panOnDrag={true}
              panOnScroll={true}
              preventScrolling={false}
              onConnect={onConnect} // Funzione di callback per il collegamento

              translateExtent={[
                [0, 0],
                [scrollWidth ?? 0, (scrollHeight && scrollHeight > 750) ? scrollHeight : 700]
              ]}
              nodeExtent={[
                [200, 50],
                [+Infinity, 750]
              ]}
              minZoom={1}
              nodesDraggable={false}
              style={{transform: 'translate(0px, 0px)'}}
            >
                <ViewportPortal>
                  <DiagramTable
                    years={years}
                    scales={scales}
                    scaleHeights={scaleHeights}
                    yearsWidths={yearsWidths}
                    scrollHeight={scrollHeight}
                    scrollWidth={scrollWidth}
                    style={{
                      position: 'absolute',
                      
                      top: 0, // Calcola dinamicamente se necessario
                      left: 0, // Calcola dinamicamente se necessario
                    }}
                  />
                </ViewportPortal>

            </ReactFlow>

          </div>
      );
  }

  
  
};

export { Diagram };
