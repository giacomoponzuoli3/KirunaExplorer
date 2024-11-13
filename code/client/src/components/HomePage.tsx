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
import { LatLngTuple, LatLngBounds } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoreferenceNewDocumentModal } from "./GeoreferenceNewDocumentModal";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';


//coordinates of Kiruna Town Hall
const kiruna_town_hall: LatLngTuple = [67.8558, 20.2253];

interface HomepageProps {
    documents: Document[];
    user: User;
    refreshDocuments: () => void;
    getDocumentIcon: (type: string) => JSX.Element | null;
    stakeholders: Stakeholder[];
}

// Componente per la costruzione dell mappa
function SetMapView(props: any) {

  // Ottieni l'istanza della mappa
  const map = useMap(); 

  // Coordinate di Kiruna, Svezia
  const position: LatLngTuple = [67.8558, 20.2253];

  const kirunaBounds = new LatLngBounds(
    [67.7758, 20.1003],  // Sud-ovest
    [67.9358, 20.3503]   // Nord-est
  );

  // Definisci l'icona personalizzata per i marker disegnati
  const customIcon = L.icon({
    iconUrl: '/kiruna/img/informativeDocument.png', // Percorso dell'icona personalizzata
    iconSize: [20, 20], // Dimensioni dell'icona
    iconAnchor: [10, 10], // Punto dell'icona che si allinea alla posizione del marker
    popupAnchor: [0, -10], // Punto per l'apertura del popup rispetto al marker
  });
    

  // Configurazione strumenti di disegno
  const drawControl = new L.Control.Draw({
    draw: {
      marker: {icon: customIcon}, // Abilita l'opzione di aggiungere punti
      polygon: {
        shapeOptions: {
          color: '#3388ff', // Colore del bordo
          weight: 2,        // Spessore del bordo
          opacity: 0.8,     // Opacità del bordo
          fillColor: '#3388ff', // Colore di riempimento
          fillOpacity: 0.3, // Opacità del riempimento
          dashArray: '5,5', // Linea tratteggiata (opzionale)
        },
      }, // Abilita l'opzione di aggiungere poligoni
      polyline: false, // Disabilita linee per questo esempio
      rectangle: false, // Disabilita rettangoli
      circle: false, // Disabilita cerchi
      circlemarker: false, // Disabilita marker circolari
    },
  });

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
    map.setMaxZoom(16);
    map.setMinZoom(12);

    // Limita l'area visibile della mappa alla bounding box di Kiruna
    map.setMaxBounds(kirunaBounds);

    //inserisco le opzioni di disegno
    map.addControl(drawControl);

    // Aggiungi il layer satellitare alla mappa
    satelliteLayer.addTo(map);


    // Pulizia dei listener e degli elementi aggiunti quando il componente viene smontato
    return () => {
      // Rimuovi il controllo di disegno quando il componente viene smontato
      map.eachLayer((layer) => {
        if (layer instanceof L.Control.Draw) {
          map.removeControl(layer); // Rimuove il controllo di disegno
        }
      });

      map.eachLayer((layer) => {
        if (layer !== satelliteLayer) map.removeLayer(layer);
      });
    };

  }, [map]); 

  useEffect(() => {

    // Creazione e aggiunta dei marker personalizzati
    props.documents.forEach((doc: any) => {
      const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);
      const marker = L.marker([doc.coordinates[0].latitude, doc.coordinates[0].longitude], {
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

      // Listener per aprire il componente ShowDocumentInfoModal al clic del marker
      marker.on('click', () => {
        props.onMarkerClick(doc);
      });
    });
  }, [props.documents])

  return null;
}


function HomePage({documents, user, refreshDocuments, getDocumentIcon, stakeholders} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [newDocument, setNewDocument] = useState<Document | null>(null);
  const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]|null>([]);

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
  };

  const handleDocumentClick = async (doc: any) => {
      const document = await API.getDocumentById(doc.id);
      setSelectedDocument(document);
      setShowDetails(true);
  }

  function refreshSelectedDocument(doc: Document) {
    setSelectedDocument(doc)
  }


  useEffect (() => {
    const getDocCord = async () => {
      try {
        const documents =await API.getAllDocumentsCoordinates();
        setDocumentsCoordinates(documents);
      }
      catch (error) {
        setShowAlert(true);
      }
    }
    getDocCord().then();
  }, []);

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
      <SetMapView documents={documentsCoordinates} getDocumentIcon={getDocumentIcon} onMarkerClick={handleDocumentClick}/>

    </MapContainer>

    {/* Show the Legend of document types */}
    <DocumentLegend />

  {/* Modal to show the document info */}
    {selectedDocument && ( 
      <ShowDocumentInfoModal 
        selectedDocument={selectedDocument} show={showDetails} 
        onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon} 
        user={user} handleEdit={handleEdit} refreshDocuments={refreshDocuments}
      />
    )}
                        
  {/* Add Document Button */}
    {user.role==="Urban Planner" ? (
      <Button className="bg-blue-950 z-[1000] hover:border-blue-500 hover:bg-blue-500" 
        style={{
            backgroundColor: '#1E3A8A', // Hex per la tonalità blu scura
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            border: "#1E3A8A" /* Bordo blu scuro */
        }}
        onClick={() => setShowAddDocumentModal(true)}
      >
        <img src="kiruna/img/addDocument.png" alt="addDocument icon" />
      </Button>
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


export { HomePage };