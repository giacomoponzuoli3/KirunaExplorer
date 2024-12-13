import React, {useCallback, useEffect, useState} from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  getConnectedEdges,
  Node,
  ReactFlow,
  ViewportPortal,
  NodeMouseHandler
} from '@xyflow/react';

import {DocCoordinates} from '../models/document_coordinate';

import API from '../API/API';
import DiagramTable from './DiagramTable';

import {edgeTypes, nodeTypes} from './utilisDiagram/nodesEdgesTypes';
import '@xyflow/react/dist/style.css';
import EdgeLegend from './utilisDiagram/EdgeLegend';
import { ShowDocumentInfoModal } from './ShowDocumentInfoModal';


const Diagram = (props: any) => {
  const [documents, setDocuments] = useState<DocCoordinates[] | null>(null);

  //nodes
  const [nodes, setNodes] = useState<Node[]>([]);
  //edges
  const [edges, setEdges] = useState<Edge[]>([]);

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

  //modal document info
  const [isModalInfoOpen, setIsModalInfoOpen] = useState(false);
  const [selectedDocumentCoordinates, setSelectedDocumentCoordinates] = useState<DocCoordinates | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isReload, setIsReload] = useState(false);


  const onNodesChange = useCallback(
    (changes: any) => {
      console.log('Nodi cambiati:', changes); // Verifica il contenuto di changes
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );


  const onEdgesChange = useCallback(
    (changes: any) => {
      console.log('Edge cambiato:', changes); // Aggiungi un log per monitorare
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (params: any) => {
      console.log('Nuova connessione:', params); // Verifica la connessione
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

      //creation nodes
      const createdNodes = createNodes(getDocuments, uniqueYears, uniqueScales, widths, heights, normalizeDate, occupiedPositions, props);
      
      setNodes(createdNodes);

      //creation edges
      const edges = await createEdges(getDocuments, createdNodes);
      setEdges(edges);

    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const areEdgesOverlapping = (
    edge1: { sourceX: number; sourceY: number; targetX: number; targetY: number; type: string },
    edge2: { sourceX: number; sourceY: number; targetX: number; targetY: number; type: string }
  ) => {
    const tolerance = 150; // Tolleranza per considerare la sovrapposizione

    // Calcoliamo la distanza tra le linee degli edge
    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
    // Verifica se i segmenti sono abbastanza vicini tra loro
    const distanceSourceSource = distance(edge1.sourceX, edge1.sourceY, edge2.sourceX, edge2.sourceY);
    const distanceTargetTarget = distance(edge1.targetX, edge1.targetY, edge2.targetX, edge2.targetY);
  
    // Considera la sovrapposizione solo se i tipi di link sono uguali
    return (
      distanceSourceSource < tolerance || distanceTargetTarget < tolerance
    );
  };
  

  const createEdges = async (documents: DocCoordinates[], nodes: Node[]) => {
    const edges: Edge[] = [];
    const createdEdgeIds = new Set<string>(); // Set per tracciare gli edge univoci
    const edgePositions: { sourceX: number; sourceY: number; targetX: number; targetY: number; type: string }[] = [];
  
    for (const document of documents) {
      try {
        const docLinks = await API.getDocumentLinksById(document.id); // Ottieni i collegamenti per il documento
  
        const sourceNode = nodes.find((node: any) => node.data.doc.id === document.id);
        if (!sourceNode) {
          console.error(`Source node not found for document ${document.id}`);
          continue;
        }
  
        for (const link of docLinks) {
          const targetNode = nodes.find((node: any) => node.data.doc.id === link.id);
  
          if (!targetNode) {
            console.error(`Target node not found for link ${link.id}`);
            continue;
          }
  
          // Crea la chiave unica per la connessione
          const pairKey = sourceNode.id < targetNode.id 
            ? `${sourceNode.id}-${targetNode.id}-${link.relatedLink.id}` 
            : `${targetNode.id}-${sourceNode.id}-${link.relatedLink.id}`;
  
          // Verifica se l'edge è già stato creato
          if (createdEdgeIds.has(pairKey)) {
            continue;
          }
  
          createdEdgeIds.add(pairKey);

          // Calcola le coordinate degli edge
          let sourceX = sourceNode.position.x;
          let sourceY = sourceNode.position.y;
          let targetX = targetNode.position.x;
          let targetY = targetNode.position.y;
  
          // Variabili per l'offset
          let offset = 30; // Offset di default
          let overlapCount = 0;
          
          if(pairKey == "1-4-3"){
            console.log("1-4-3")
          }
          if(pairKey == "1-4-1"){
            console.log("1-4-1")
          }
          if(pairKey == "1-4-4"){
            console.log("1-4-4")
          }
          // Verifica se l'edge si sovrappone con altri
          edgePositions.forEach((existingEdge) => {
            if (areEdgesOverlapping(
              { sourceX, sourceY, targetX, targetY, type: link.relatedLink.name },
              existingEdge
            )) {
              console.log("entraot");
              overlapCount++; // Incrementa il conteggio delle sovrapposizioni
            }
          });

          if(pairKey == "1-4-1"){
            console.log("1-4-1 offset: " + offset);
          }
          if(pairKey == "1-4-4"){
            console.log("1-4-4 offeset: " + offset);
          }
          if(pairKey == "1-4-3"){
            console.log("1-4-3 offset: " + offset)
          }
  
          // Se ci sono sovrapposizioni, applica l'offset
          if (overlapCount > 0) {
            console.log(overlapCount);
            offset = overlapCount * 20; // Maggiore sovrapposizione -> maggiore offset
            sourceX += offset;
            sourceY += offset;
            targetX += offset;
            targetY += offset;
          }
  
          // Aggiungi la posizione dell'edge alla lista per i confronti futuri
          edgePositions.push({ sourceX, sourceY, targetX, targetY, type: link.relatedLink.name });
  
          // Aggiungi l'edge con l'offset al componente
          edges.push({
            id: pairKey,
            source: sourceNode.id,
            target: targetNode.id,
            type: link.relatedLink.name,
            data: { type: link.relatedLink.name, offset },
            animated: false,
            style: { stroke: 'black', strokeWidth: 2 },
            zIndex: 4,
          });
        }
      } catch (error) {
        console.error(`Error fetching links for document ${document.id}:`, error);
      }
    }
  
    return edges;
  };
  
  
  
  

  const createNodes = (getDocuments: DocCoordinates[], uniqueYears: number[], uniqueScales: string[], widths: number[], heights: number[], normalizeDate: (date: string) => number, occupiedPositions: Set<string>, props: any) => {
    // Restituisci i nodi creati
    return getDocuments.map((doc: DocCoordinates, index: number) => {
      // Trova gli indici unici per l'anno e la scala
      const yearIndex = uniqueYears.indexOf(normalizeDate(doc.issuanceDate));
      const scaleIndex = uniqueScales.indexOf(doc.scale);

      // Calcolare la posizione base in base all'indice dell'anno e della scala
      const xBase = widths.slice(0, yearIndex).reduce((acc, w) => acc + w + 50, 210); // Posizione X base
      const yBase = heights.slice(0, scaleIndex).reduce((acc, h) => acc + h + 23, 90);  // Posizione Y base

      // Verifica se la posizione è già occupata
      let x = xBase;
      let y = yBase;

      // Creiamo una chiave unica per la posizione
      let positionKey = `${x},${y}`;
      let offset = 50;

      // Se la posizione è già occupata, aggiungi un offset per cercare una nuova posizione
      while (occupiedPositions.has(positionKey)) {
        x += offset;
        positionKey = `${x},${y}`;
      }

      // Segna la nuova posizione come occupata
      occupiedPositions.add(`${x},${y}`);

      // Crea il nodo
      return {
        id: doc.id.toString(),
        type: 'icon', // Tipo di nodo personalizzato
        position: {x, y},
        data: {
          label: props.getDocumentIcon(doc.type, 5), // Usa la funzione per ottenere l'icona
          doc
        },
        zIndex: 5,
      };
    });
  };

  const handleCloseDetailsModal = () => {
    setIsModalInfoOpen(false);
    setSelectedNode(null)
    setSelectedDocumentCoordinates(null)
  };

  function refreshSelectedDocument(doc: DocCoordinates) {
    // props.refreshDocumentsCoordinates();
    setIsReload(true);
  }
        
    const onNodeClick: NodeMouseHandler = (event, node) => {
    console.log('Node clicked:', node);
  
    // No need to access documents directly here
    setSelectedNode(node);
  };
  
  useEffect(() => {
    if (selectedNode && documents) {
      const document = documents.find((doc) => doc.id === Number(selectedNode.id)) ?? null;
      setSelectedDocumentCoordinates(document);
      setIsModalInfoOpen(true);
    }
  }, [selectedNode, documents]); 
        
  useEffect(() => {
    if(nodes.length === 0) allDocuments().then();

  }, []);

  useEffect(() => {
    if(isReload){
      allDocuments().then();
      setIsReload(false)
    }

  }, [isReload]);

  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      console.log("Nodes and Edges:", nodes, edges);
      const connectedEdges = getConnectedEdges(nodes, edges);
      console.log(connectedEdges)
    }
  }, [nodes, edges]); 


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
      <> 
      <div className="px-4 mt-4 mb-4">
          <h2 className="text-3xl font-bold text-black-600 text-center mb-6">
                Diagram of Documents
          </h2>
      </div>
      <div 
      style={{ 
        width: '100%', 
        height: !scaleHeights ? `700px` : scaleHeights.reduce((acc, curr) => acc + curr,  250), 
        border: "none", 
        transform: 'none',
        position: 'relative' // Aggiungi questa proprietà per controllare il posizionamento degli altri componenti
      }} 
      className="diagram-svg-fix"
    >
      {/* Modal to show the document info */}
     {isModalInfoOpen && selectedDocumentCoordinates &&( 
      <ShowDocumentInfoModal 
        show={isModalInfoOpen}
        selectedDocumentCoordinates={selectedDocumentCoordinates}
        onHide={handleCloseDetailsModal} 
        getDocumentIcon={props.getDocumentIcon} 
        user={props.user}
        geoJsonData={props.geoJsonData}
        refreshDocumentsCoordinates={props.refreshDocumentsCoordinates}
        scaleOptions={props.scaleOptions}
        typeOptions={props.typeOptions}
        onCreateScale={props.onCreateScale}
        onCreateType={props.onCreateType}
        stakeholders={props.stakeholders}
        refreshSelectedDocument={refreshSelectedDocument} 
      />
     )}
    
      {nodes.length > 0 && edges.length > 0 && (
        
        <ReactFlow
          nodes={nodes}
          edges={edges}

          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}


          onEdgesChange={onEdgesChange}
          onConnect={onConnect} // Funzione di callback per il collegamento
    
          connectionLineStyle={{ stroke: "rgb(0, 0, 0)", strokeWidth: 2 }}

          
          panOnDrag={true}
          panOnScroll={true}
          preventScrolling={false}
    
          translateExtent={[
            [0, 0],
            [scrollWidth ?? 0, (scrollHeight && scrollHeight > 750) ? scrollHeight : 600]
          ]}
          nodeExtent={[
            [200, 50],
            [+Infinity, 650]
          ]}
          minZoom={1}
          nodesDraggable={false}
    
          style={{
            transform: 'translate(0px, 0px)',
            zIndex: 10
          }}
        >
          {<ViewportPortal>
            <DiagramTable
              years={years}
              scales={scales}
              scaleHeights={scaleHeights}
              yearsWidths={yearsWidths}
              scrollHeight={scrollHeight}
              scrollWidth={scrollWidth}
              
              style={{
                position: 'relative ',
                top: 0, // Calcola dinamicamente se necessario
                left: 0, // Calcola dinamicamente se necessario
              }}
            />
            </ViewportPortal>}
        </ReactFlow>
      )}
      
    </div>
      <EdgeLegend />
    </> 
    );
  }

  
  
};

export { Diagram };
