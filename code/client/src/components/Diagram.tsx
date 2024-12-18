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


const DiagramLegend = ({ nodeInfo, getDocumentIcon }: { nodeInfo: { type: string, icon: JSX.Element, description: string }[], getDocumentIcon: (type: string, size: number) => JSX.Element | null }) => {
  // Generate the node legends based on the document types
  const documentTypes = Array.from(new Set(nodeInfo.map((info) => info.type)));

  return (
    <div style={{
      padding: '10px',
      backgroundColor: 'white',
      border: '1px solid black',
      borderRadius: '5px',
      maxWidth: '350px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}></h3>

      {/* Node Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 'semi bold', marginBottom: '5px', fontSize: '16px' }}>Document Type</h4>
        <div>
          {documentTypes.map((type) => {
            const icon = getDocumentIcon(type, 5);  // Call the function to get the icon for each type
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ marginRight: '10px' }}>
                  {icon}
                </div>
                <span>{type}</span>  {/* You can add a description or customize the text here */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge Section */}
      <EdgeLegend/>
    </div>
  );
};



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

  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [nodeInfo, setNodeInfo] = useState<{ type: string, icon: JSX.Element, description: string }[]>([]);


  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };



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
      
      // nodeInfo for the legend
      const nodeInfoList = getDocuments.map((doc: DocCoordinates) => ({
        type: doc.type,
        icon: props.getDocumentIcon(doc.type, 16),  // Get icon based on document type
        description: doc.description || 'No description', // Add description or any relevant text
      }));

      setNodeInfo(nodeInfoList);
      //get the scales
      const uniqueScales = Array.from(
        new Set(
          getDocuments.map((doc: DocCoordinates) => doc.scale)
        )
      ).sort((a: any, b: any) => {
        // Handle non-numeric scales like "blueprints/effects" and "Text"
        if (!a.includes(':') && !b.includes(':')) return 0;
        if (!a.includes(':')) return 1; // Place non-numeric scales at the end
        if (!b.includes(':')) return -1;
      
        // Split the scale string by the colon
        const aValue = parseInt(a.split(':')[1], 10);
        const bValue = parseInt(b.split(':')[1], 10);
      
        // Compare the numeric values
        return aValue - bValue;
      }) as string[];

      // Conta il numero di documenti associati a ciascun anno
      const yearCounts = getDocuments
      .map((doc: DocCoordinates) => normalizeDate(doc.issuanceDate)) // Estrai l'anno
      .filter((year: number) => !isNaN(year)) // Filtra solo gli anni validi (non NaN)
      .reduce((counts: Record<number, number>, year: number) => {
        counts[year] = (counts[year] || 0) + 1; // Conta le occorrenze di ciascun anno
        return counts;
      }, {});

      // Ottieni gli anni unici ordinati
      const uniqueYears = Array.from(new Set(Object.keys(yearCounts).map(Number))).sort((a, b) => a - b) as number[];

      // Calcola la larghezza di ciascuna colonna in base al numero di documenti
      const widths = uniqueYears.map(year => {
      const count = yearCounts[year] || 0; // Ottieni il conteggio dei documenti associati a questo anno
      return 250 + (count * 50); // Aggiungi 50px per ogni documento
      });
      
      setScales(uniqueScales);
      setYears(uniqueYears);
      
      const heights = Array(uniqueScales.length).fill(52);
  
    
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
          
          // Verifica se l'edge si sovrappone con altri
          edgePositions.forEach((existingEdge) => {
            if (areEdgesOverlapping(
              { sourceX, sourceY, targetX, targetY, type: link.relatedLink.name },
              existingEdge
            )) {
              overlapCount++; // Incrementa il conteggio delle sovrapposizioni
            }
          });

  
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
      const yBase = heights.slice(0, scaleIndex).reduce((acc, h) => acc + h + 23, 80);  // Posizione Y base

      if(doc.scale === "1:30000" || doc.scale === "Text"){
        console.log("Scale "+doc.scale+" ybase: " + yBase)
      }

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
          doc, 
          isSelected: false,
          x,
          y
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
    const updatedNodes = nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isSelected: n.id === selectedNode?.id, // Pass selected state to the node
      },
    }));
    setNodes(updatedNodes)
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
      setScrollHeight(scaleHeights.reduce((total: any, height: any) => total + height, 300));
      console.log(scaleHeights.reduce((acc, curr) => acc + curr,  350))
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
          {/* Toggle Button */}
          <button 
            onClick={toggleLegend} 
            style={{
              position: 'absolute',
              top: '85px',
              right: '10px',
              zIndex: 20,
              padding: '10px 15px',
              backgroundColor: 'black',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isLegendVisible ? "Hide Legend" : "Show Legend"}
        </button>
      </div>
      <div 
      style={{ 
        width: '100%', 
        height: !scaleHeights ? `900px` : scaleHeights.reduce((acc, curr) => acc + curr,350), 
        border: "none", 
        transform: 'none',
        position: 'relative', // Aggiungi questa proprietà per controllare il posizionamento degli altri componenti
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
        refreshDocumentsCoordinates={() => {props.refreshDocumentsCoordinates(); setIsReload(true);}}
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
          onNodeClick={onNodeClick}
    
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
            [+Infinity, 900]
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
      {isLegendVisible && (
            <div 
              style={{
                position: 'absolute',
                top: '50px',
                right: '10px',
                zIndex: 20
              }}
            >
              <DiagramLegend nodeInfo={nodeInfo} getDocumentIcon={props.getDocumentIcon}/>
            </div>
          )}
      
    </div>
    </> 
    );
  }

  
  
};

export { Diagram };
