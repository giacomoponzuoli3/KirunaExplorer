import {Button} from "react-bootstrap"
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../API/API';
import { Link } from 'react-router-dom';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../models/user";
import { useEffect } from "react";
import { AddDocumentModal, ShowDocumentInfoModal, EditDocumentModal, AddNewDocumentLinksModal } from "./DocumentModals";
import { Stakeholder } from "../models/stakeholder";
import {DocumentLegend} from "./DocumentLegend"
import Alert from "./Alert"

import { MapContainer, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoreferenceNewDocumentModal } from "./GeoreferenceNewDocumentModal";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';

// Funzione per ottenere una "firma" unica per un poligono
function getPolygonKey(latLngs: LatLngTuple[]): string {
  // Ordina le coordinate del poligono per latitudine e longitudine
  const sortedCoords = latLngs
    .map(coord => `${coord[0]},${coord[1]}`)  // Converti le coordinate in stringhe
    .sort();  // Ordina le coordinate in ordine crescente
  return sortedCoords.join(";");
}

// Funzione per confrontare se due poligoni sono uguali
function comparePolygons(poly1: LatLngTuple[], poly2: LatLngTuple[]): boolean {
  // Ottieni la firma di entrambi i poligoni
  return getPolygonKey(poly1) === getPolygonKey(poly2);
}

//coordinates of Kiruna Town Hall
const kiruna_town_hall: LatLngTuple = [67.8558, 20.2253];

interface HomepageProps {
    documents: Document[];
    documentsCoordinates: DocCoordinates[];
    user: User;
    refreshDocuments: () => void;
    refreshDocumentsCoordinates: () => void;
    getDocumentIcon: (type: string) => JSX.Element | null;
    stakeholders: Stakeholder[];
}

// Componente per la costruzione della mappa
// Componente per la costruzione della mappa
function SetMapViewHome(props: any) {
  // Ottieni l'istanza della mappa
  const map = useMap(); 

  // coordinates of Kiruna town hall means the centre of the city
  const position: LatLngTuple = [67.8558, 20.2253];

  const kirunaBounds = new LatLngBounds(
    [67.790390, 20.416509],  // Sud-ovest
    [67.889194, 20.050656]   // Nord-est
  );

  // Gestire gli eventi di creazione delle geometrie
  map.on(L.Draw.Event.CREATED, (event: any) => {
    const layer = event.layer;
    
    if (event.layerType === 'polygon') {
      layer.editing.disable(); // Disabilita l'editing del poligono
      layer.options.interactive = false; // Disabilita l'interazione (clic, hover) sul poligono
      
      // Ottieni le coordinate del poligono
      const coordinates = layer.getLatLngs(); // Questo restituirà un array di coordinate
    }

    // Aggiungi il layer creato alla mappa
    layer.addTo(map);
  });

  //classic layer
  const classicLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
  );

  // Configurazione layer satellitare alla mappa
  const satelliteLayer = L.tileLayer(
    'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 
    { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
  );

  useEffect(() => {
    // Impostare la vista iniziale solo al primo rendering
    if (map.getZoom() === undefined) {
      map.setView(position, 12);
    }

    // Imposta i limiti di zoom
    map.setMaxZoom(18);
    map.setMinZoom(12);

    // Limita l'area visibile della mappa alla bounding box di Kiruna
    map.setMaxBounds(kirunaBounds);
    map.options.maxBoundsViscosity = 1.0; // Imposta viscosità per bloccare l'utente al bounding box

    // Aggiungi il layer satellitare alla mappa
    satelliteLayer.addTo(map);

    // Add the classic layer
    classicLayer.addTo(map);

    // Add the control of the layers
    L.control.layers(
      {
        'Classic': classicLayer,
        'Satellite': satelliteLayer
      },
      {},
      {
        position: 'topleft'  // Posizione del controllo dei layer
      }
    ).addTo(map);

    // Pulizia dei listener e degli elementi aggiunti quando il componente viene smontato
    return () => {
      // Rimuovi il controllo di disegno quando il componente viene smontato
      map.eachLayer((layer) => {
        if (layer instanceof L.Control.Draw) {
          map.removeControl(layer); // Rimuove il controllo di disegno
        }
      });

      map.eachLayer((layer) => {
        if (layer !== satelliteLayer && layer !== classicLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map]);

  useEffect(() => {
    // Rimuovere i marker vecchi prima di aggiungere i nuovi
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Mappa per associare documenti a poligoni o punti
    const documentLayers = new Map();

    // Mappa per tenere traccia delle coordinate già utilizzate (in formato stringa) con il numero di duplicati
    const usedCoordinates = new Map<string, number>();

    // Creazione e aggiunta dei marker personalizzati
    props.documentsCoordinates.filter((d: DocCoordinates) => d.coordinates.length !== 0).forEach((doc: any) => {
      let latitude = doc.coordinates[0].latitude;
      let longitude = doc.coordinates[0].longitude;

      // Genera una chiave per le coordinate
      const key = `${latitude},${longitude}`;

      // Se la coordinata è già stata utilizzata, incrementa il contatore e sposta il marker
      let offset = usedCoordinates.get(key) ?? 0; // Usa 0 se offset è undefined
      if (offset > 0) {
        usedCoordinates.set(key, offset + 1);
        // Sposta leggermente il marker (a sinistra o destra) a seconda del contatore
        longitude += 0.0004 * (offset % 2 === 0 ? 1 : -1);  // Alterna il segno per evitare che si accumulino nello stesso punto
      } else {
        // Se è la prima volta che vediamo questa coordinata, aggiungiamo un nuovo contatore
        usedCoordinates.set(key, 1);
      }

      const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);
      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: `
            <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95">
              ${iconHtml}
            </div>
          `,
          iconSize: [20, 20],
          className: '',
        }),
      }).addTo(map);

      // Se il documento ha più di una coordinata (poligono), crea il poligono
      if (doc.coordinates.length > 1) {
        const latLngs = doc.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

        // Definire il poligono, ma non aggiungerlo alla mappa immediatamente
        const relatedLayer: L.Polygon = L.polygon(latLngs, {
          color: '#B22222',  // Bordo rosso più scuro (Rosso fuoco)
          weight: 1,         // Bordo molto sottile
          opacity: 0.8,      // Opacità del bordo (visibile ma non troppo forte)
          fillColor: '#FFD700',  // Colore di riempimento giallo oro
          fillOpacity: 0.1,  // Opacità del riempimento (più opaco per non oscurare la mappa sottostante)
          smoothFactor: 2,   // Rende il poligono con bordi più arrotondati
        });

        documentLayers.set(doc, relatedLayer);

        // Evento per mostrare il poligono quando si passa sopra il marker
        marker.on('mouseover', () => {
          if (!map.hasLayer(relatedLayer)) {
            relatedLayer.addTo(map);  // Aggiungi il poligono alla mappa quando il mouse passa sopra il marker

            // Cambia il colore del bordo e riempimento quando il mouse passa sopra
            relatedLayer.setStyle({
              color: '#8B0000', // Cambia il colore del bordo a un rosso scuro più intenso
              weight: 2,        // Aumenta leggermente lo spessore del bordo
              fillOpacity: 0.2, // Aumenta l'opacità del riempimento
            });
          }
        });

        // Evento per nascondere il poligono quando il mouse esce dal marker
        marker.on('mouseout', () => {
          if (map.hasLayer(relatedLayer)) {
            map.removeLayer(relatedLayer);  // Rimuovi il poligono dalla mappa quando il mouse esce dal marker
          }
        });
      }
        
      // Listener per aprire il componente ShowDocumentInfoModal al clic del marker
      marker.on('click', () => {
        props.onMarkerClick(doc);
      });
    });
  }, [props.documentsCoordinates]);

  return null;
}



function HomePage({documentsCoordinates, documents, user, refreshDocuments, refreshDocumentsCoordinates, getDocumentIcon, stakeholders} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocumentCoordinates, setSelectedDocumentCoordinates] = useState<DocCoordinates | null>(null);

  const [newDocument, setNewDocument] = useState<Document | null>(null);

  //modals
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [showGeoreferenceDocument, setShowGeoreferenceDocument] = useState<boolean>(false);

  const handleEdit = () => {
    setShowEditDocumentModal(true);
  };

  const handleCloseDetailsModal = () => {
      setShowDetails(false);
      setSelectedDocument(null);
      setSelectedDocumentCoordinates(null);
  };

  const handleDocumentClick = async (doc: DocCoordinates) => {
      const document = await API.getDocumentById(doc.id);
      setSelectedDocument(document);
      setSelectedDocumentCoordinates(doc);
      setShowDetails(true);
  }

  function refreshSelectedDocument(doc: Document) {
    setSelectedDocument(doc)
  }

  return (
  <>
    {showAlert &&
      <Alert
          message="Sorry, something went wrong..."
          onClose={() => {
              setShowAlert(false);
          }}
      />
    }
    
    {/* Container to show the map */}
    <MapContainer
      style={{ height: "calc(100vh - 65px)", width: "100%" }}
    >
      {/* Impostiamo il centro, il livello di zoom e i vari documenti tramite SetMapView */}
      <SetMapViewHome documentsCoordinates={documentsCoordinates} getDocumentIcon={getDocumentIcon} onMarkerClick={handleDocumentClick}/>

    </MapContainer>

    {/* Show the Legend of document types */}
    {/*<DocumentLegend />*/}

    {/* Modal to show the document info */}
    {selectedDocumentCoordinates && selectedDocument && ( 
      <ShowDocumentInfoModal 
        show={showDetails} 
        selectedDocument={selectedDocument} 
        selectedDocumentCoordinates={selectedDocumentCoordinates}
        onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon} 
        user={user} handleEdit={handleEdit} refreshDocuments={refreshDocuments} refreshDocumentsCoordinates={refreshDocumentsCoordinates}
      />
    )}
                        
    {/* Add Document Button */}
    {user.role==="Urban Planner" ? (
      <button
        className="bg-blue-950 z-[1000] hover:border-blue-700 hover:bg-blue-700 fixed bottom-6 right-6 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold border-2 border-blue-950"
        onClick={() => setShowAddDocumentModal(true)}
      >
        <img src="kiruna/img/addDocument.png" alt="addDocument icon" />
      </button>
      ) : null
    }

    <AddDocumentModal 
      show={showAddDocumentModal} 
      onHide={() => setShowAddDocumentModal(false)} 
      refreshDocuments={refreshDocuments} 
      stakeholders={stakeholders} 
      showGeoreferenceNewDocumentModal = {(doc: Document) => {setNewDocument(doc); setShowGeoreferenceDocument(true); }}
    />


    {selectedDocument && (
      <EditDocumentModal 
        document={selectedDocument} show={showEditDocumentModal} 
        onHide={() => setShowEditDocumentModal(false)} refreshSelectedDocument={refreshSelectedDocument}
        stakeholders={stakeholders}
      />
    )}

    {newDocument && (
      <GeoreferenceNewDocumentModal show={showGeoreferenceDocument} 
      onHide={() => setShowGeoreferenceDocument(false)} document={newDocument}
      showAddNewDocumentLinks = {(doc: Document) => {setNewDocument(doc); setShowAddLinks(true); }}
    />
    )}

    {newDocument && (
      <AddNewDocumentLinksModal 
        document={newDocument} 
        show={showAddLinks} 
        onHide={() => setShowAddLinks(false)} 
        refreshDocuments={refreshDocuments}
        docs={documents}
      />
    )}
  </>
    
  );      
}

function ButtonHomePage(){
  const location = useLocation();
  const isLoginPath = location.pathname === '/';
  return (
    <>
      { !isLoginPath ? (
        <Link 
          to={`/`}
          className="inline-flex mr-4 items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md px-4 py-2 text-sm font-medium no-underline"
        >
          <i className="bi bi-house-door-fill"></i> 
          <span className="hidden md:inline">Back Home</span>
        </Link>
      ) : null }
    </>
  );
}


export { HomePage, ButtonHomePage };