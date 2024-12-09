import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { DocCoordinates } from '../models/document_coordinate';
import Link from '../models/link';
import API from '../API/API';

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

const DiagramDocuments = (props: any) => {
  const [documents, setDocuments] = useState<DocCoordinates[] | null>(null);
  const [nodes, setNodes] = useState<Node<DocCoordinates>[]>([]);
  const [edges, setEdges] = useState<Edge<Link>[]>([]);

  const [scales, setScales] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [yearWidths, setYearWidths] = useState<number[]>([]); // Array per le larghezze dinamiche degli anni
  const [scaleHeights, setScaleHeights] = useState<number[]>([]); // Array per le altezze dinamiche delle scale

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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
          documents
            .map((doc: DocCoordinates) => {
              let year: string | undefined = undefined;

              if (doc.issuanceDate.includes('/')) {
                const dateParts = doc.issuanceDate.split('/');
                year = dateParts.length === 3 ? dateParts[2] : dateParts[1];
              } else {
                year = doc.issuanceDate;
              }

              return year;
            })
            .filter((year: string | undefined) => year)
        )
      ).sort() as string[];

      setScales(uniqueScales);
      setYears(uniqueYears);

      // Calcolare la larghezza degli anni in base al numero di documenti per anno
      const yearCountMap = uniqueYears.reduce((acc: any, year: string) => {
        acc[year] = documents.filter((doc: DocCoordinates) => normalizeDate(doc.issuanceDate) === year).length;
        return acc;
      }, {});

      // Assegnare una larghezza proporzionale per ogni anno
      const totalDocuments = documents.length;
      const newYearWidths = uniqueYears.map((year) => {
        const documentCount = yearCountMap[year];
        // Proporzionalità: la larghezza di ogni anno è calcolata in base al numero di documenti
        return (documentCount / totalDocuments) * 500; // Ad esempio, moltiplicato per 1000 per ottenere una larghezza visibile
      });

      setYearWidths(newYearWidths);

      // Calcolare l'altezza delle scale in base al numero di documenti per scala
      const scaleCountMap = uniqueScales.reduce((acc: any, scale: string) => {
        acc[scale] = documents.filter((doc: DocCoordinates) => doc.scale === scale).length;
        return acc;
      }, {});

      const newScaleHeights = uniqueScales.map((scale) => {
        const documentCount = scaleCountMap[scale];
        // Proporzionalità: l'altezza di ogni scala è calcolata in base al numero di documenti
        return (documentCount / documents.length) * 500; // Ad esempio, moltiplicato per 1000 per ottenere una larghezza visibile
      });

      setScaleHeights(newScaleHeights);

    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    allDocuments();
  }, []);

  const getYAxisWidth = () => {
    const longestScale = scales.reduce((longest, scale) => (scale.length > longest.length ? scale : longest), "");
    return longestScale.length * 10 + 20; // Aggiungi padding per margine
  };

  const calculateNodePosition = (year: string, scale: string) => {
    if (!documents) {
      // Se documents è null, restituiamo un oggetto di posizione predefinito o gestiamo l'errore
      console.error("Documents are not available.");
      return { x: 0, y: 0 };  // Restituiamo una posizione predefinita o come desiderato
    }
  
    const yearIndex = years.indexOf(year);
    const scaleIndex = scales.indexOf(scale);
  
    // Calcolare la larghezza totale per ogni anno
    const yearWidth = yearWidths[yearIndex];
    
    // Filtro i documenti per anno e calcolo il numero di documenti
    const yearDocuments = documents.filter(
      (doc) => normalizeDate(doc.issuanceDate) === year
    );
    const yearDocumentCount = yearDocuments.length;
    
    if (yearDocumentCount === 0) {
      // Gestisci il caso in cui non ci siano documenti per l'anno specificato
      console.error(`No documents found for year: ${year}`);
      return { x: 0, y: 0 };
    }
  
    // Calcola la larghezza per ogni documento dell'anno
    const documentWidth = yearWidth / yearDocumentCount;
  
    // Calcola l'offset X per i documenti degli anni precedenti
    const xOffset = yearWidths.slice(0, yearIndex).reduce((acc, width) => acc + width, 0);
  
    // Trova l'indice del documento per il calcolo della posizione X
    const documentIndex = yearDocuments.findIndex(
      (doc) => doc.scale === scale
    );
  
    if (documentIndex === -1) {
      // Gestisci il caso in cui il documento non è trovato
      console.error(`Document with scale ${scale} not found in year ${year}`);
      return { x: 0, y: 0 };
    }
  
    // L'origine dell'asse X è alla fine della label dell'asse Y
    const x = xOffset + documentWidth * documentIndex;
  
    // Calcolare l'offset Y basato sulla dimensione della scala
    const yOffset = scaleHeights.slice(0, scaleIndex).reduce((acc, val) => acc + val, 0);
  
    // Posizione Y
    const y = yOffset;
  
    return { x, y };
  };
  
  

  const normalizeDate = (date: string) => {
    const year = date.split('/')[date.split('/').length - 1];
    return year;
  };

  const createNodes = () => {
    if (documents && documents.length > 0 && scales.length > 0) {
      const newNodes = documents.map((doc) => {
        const year = normalizeDate(doc.issuanceDate);
        const { x, y } = calculateNodePosition(year, doc.scale);

        return {
          id: String(doc.id),
          type: 'custom',  // Usa il tipo personalizzato
          position: { x, y },
          data: {
            label: props.getDocumentIcon(doc.type, 5),  // Passa solo l'icona o l'elemento desiderato
            id: doc.id,
            title: doc.title,
            stakeHolders: doc.stakeHolders,
            scale: doc.scale,
            issuanceDate: doc.issuanceDate,
            type: doc.type,
            language: doc.language,
            pages: doc.pages,
            description: doc.description,
            coordinates: doc.coordinates,
          },
        };
      });
      setNodes(newNodes);
    }
  };

  useEffect(() => {
    createNodes();
  }, [documents, scales, yearWidths, scaleHeights]);

  // Calcolare la larghezza dell'asse X
  const getXAxisHeight = () => {
    return '30px'; // Altezza dell'asse X
  };

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
    {/* Asse Y con le Categorie (Scale) */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: getYAxisWidth(), height: '100%', backgroundColor: '#f3f3f3' }}>
      {scales.map((scale, index) => (
        <div
          key={index}
          style={{
            height: `${scaleHeights[index]}px`,  // Altezza dinamica basata sul numero di documenti per scala
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #ddd',
          }}
        >
          {scale}
        </div>
      ))}
    </div>
  
    {/* Diagramma principale */}
    {nodes && (
      <div style={{ marginLeft: getYAxisWidth(), height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodesDraggable={false}
          translateExtent={[
            [0, 0],
            [yearWidths.reduce((partialSum: number, a: number) => partialSum + a, 0), getYAxisWidth()] // Aggiustato per usare il totale della larghezza
          ]}
          nodeExtent={[
            [getYAxisWidth(), 50],  // Aggiusta la posizione dell'asse X
            [+Infinity, 750]
          ]}
          minZoom={1}  // Imposta minZoom a 1 per disabilitare lo zoom verso il basso
          maxZoom={1}  // Imposta maxZoom a 1 per disabilitare lo zoom verso l'alto
          zoomOnScroll={false}  // Disabilita lo zoom tramite la rotella del mouse
          zoomOnPinch={false}  // Disabilita lo zoom tramite il pinch sui dispositivi touch
          panOnDrag={false}    // Disabilita il pan tramite il drag del mouse
          style={{ height: '100%', width: '100%' }}
          nodeTypes={nodeTypes}
        >
          <Background color="#aaa" gap={16} />
        </ReactFlow>
        <div className="h-[30px] flex flex-row">
            {years.map((year, index) => (
              <div
                key={index}
                className="flex-1 text-center border-r border-gray-300 py-1.5 flex justify-center"
                style={{ width: `${yearWidths[index]}px` }}
              >
                <div
                  className="inline-block max-w-full overflow-x-auto whitespace-nowrap pb-2"
                >
                  {year}
                </div>
              </div>
            ))}
          </div>
      </div>
    )}
  </div>
  );
};

export { DiagramDocuments };
