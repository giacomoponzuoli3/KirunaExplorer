import {Button} from "react-bootstrap"
import { useState, useRef } from 'react';
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
import { DocLink } from "../models/document_link";
import { title } from "process";
import {DocumentLegend} from "./DocumentLegend"
import { MapContainer, TileLayer, Marker, Popup, useMap,  Marker as LeafletMarker, MarkerProps } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, LatLngBounds, Icon } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoreferenceNewDocumentModal } from "./GeoreferenceNewDocumentModal";

interface HomepageProps {
    documents: Document[];
    user: User;
    refreshDocuments: () => void;
    stakeholders: Stakeholder[];
}

// Componente per impostare il centro e il livello di zoom della mappa
// Funzione per impostare il centro e il livello di zoom
function SetMapView() {
  const map = useMap(); // Ottieni l'istanza della mappa
  
  const [zoomLevel, setZoomLevel] = useState(10); // Stato per il livello di zoom

  // Funzione per aggiornare dinamicamente il livello di zoom
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(Number(event.target.value));
  };

  // Coordinate di Kiruna, Svezia
  const position: LatLngTuple = [67.8558, 20.2253];

  // Correzione delle icone di Leaflet
  const customIcon = new L.Icon({
    iconUrl: '/kiruna/img/informativeDocument.png',
    iconSize: [25, 41],  // Dimensioni dell'icona
    iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
    popupAnchor: [1, -34], // Punto da cui si apre il popup
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]  // Dimensioni dell'ombra
  });

  const kirunaBounds = new LatLngBounds(
    [67.7758, 20.1003],  // Sud-ovest
    [67.9358, 20.3503]   // Nord-est
  );


  useEffect(() => {
    // Imposta la vista iniziale una sola volta senza fare reset durante lo zoom
    map.setView(position, 12);

    // Imposta i limiti di zoom
    map.setMaxZoom(16);
    map.setMinZoom(12);

    // Limita l'area visibile della mappa alla bounding box di Kiruna
    map.setMaxBounds(kirunaBounds);

    // Aggiungi il layer satellitare alla mappa
    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 
      { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
    );
    satelliteLayer.addTo(map);

    // Creazione e aggiunta di un marker personalizzato
    const marker = L.marker(position, {
      icon: L.divIcon({
        html: `
          <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95">
            <img src="/kiruna/img/informativeDocument.png" alt="Marker Icon" class="w-5 h-5">
          </div>
        `,
        iconSize: [20, 20],
        className: '',
      }),
    }).addTo(map);

    // Popup opzionale per il marker
    marker.bindPopup("<h3 class='font-semibold text-lg text-gray-800'>Informative Document</h3><p class='text-gray-600'>Questo è un marker interattivo.</p>");

    // Pulizia dei listener e degli elementi aggiunti quando il componente viene smontato
    return () => {
      map.removeLayer(marker);
      map.removeLayer(satelliteLayer);
    };
  }, []); // Dipendenze vuote per assicurarsi che il codice venga eseguito solo una volta al montaggio

  return null;
}


function HomePage({documents, user, refreshDocuments, stakeholders} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  const [newDocument, setNewDocument] = useState<Document | null>(null);
  const [showGeoreferenceDocument, setShowGeoreferenceDocument] = useState<boolean>(false);

  const handleEdit = () => {
    setShowEditDocumentModal(true);
  };

  const handleCloseDetailsModal = () => {
      setShowDetails(false);
      setSelectedDocument(null);
  };

  const handleDocumentClick = async (doc: Document) => {
      const document = await API.getDocumentById(doc.id);
      setSelectedDocument(document);
      setShowDetails(true);

  }

  function refreshSelectedDocument(doc: Document) {
    setSelectedDocument(doc)
  }

  function getDocumentIcon(type: string) {
      switch (type) {
          case 'Informative document':
            return <img src="/kiruna/img/informativeDocument.png" alt="Informative Document" />;
          case 'Prescriptive document':
            return <img src="/kiruna/img/prescriptiveDocument.png" alt="Prescriptive Document" />;
          case 'Material effect':
            return <img src="/kiruna/img/construction.png" alt="Material Effect" />;
          case 'Design document':
            return <img src="/kiruna/img/designDocument.png" alt="Design Document" />;
          case 'Technical document':
            return <img src="/kiruna/img/technicalDocument.png" alt="Technical Document" />;
          case 'Agreement':
            return <img src="/kiruna/img/agreement.png" alt="Technical Document" />;
          case 'Conflict':
            return <img src="/kiruna/img/conflict.png" alt="Technical Document" />;
          case 'Consultation':
            return <img src="/kiruna/img/consultation.png" alt="Technical Document" />;
          default:
            return null; // Return null if no matching type
        }
  }

  return (
  <>

    
    {/* Container to show the map */}
    <MapContainer
      style={{ height: "100vh", width: "100%" }}
    >
      {/* Impostiamo il centro e il livello di zoom tramite SetMapView */}
      <SetMapView />

    </MapContainer>

    {/* Show the Legend of document types */}
    <DocumentLegend />

    {/* div to show the documents (this will change once the map is implemented) */}
    <div className="mt-3" 
      style={{ 
      display: 'flex',
      justifyContent: 'center', // Center horizontally
      alignItems: 'center', // Center vertically
      paddingTop: '100px',
      boxSizing: 'border-box'
    }}>
      <div className="mt-5" 
        style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center', // Center items horizontally within the row
        alignItems: 'stretch', // Stretch items to match tallest card in each row
        maxWidth: '80%', // Optional: limits width to prevent cards from stretching too wide
      }}>
        {documents.map((doc, index) => (
          <div key={index} 
            style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            textAlign: 'center',
            width: '150px',
            minHeight: '100%', // Make each card stretch to fill the row
            boxSizing: 'border-box',
          }}
          onClick={() => handleDocumentClick(doc)}
          >
            <span style={{
              marginBottom: '8px',
              fontSize: '24px',
            }}>
              {getDocumentIcon(doc.type)}
            </span>
            <span 
              style={{
              fontWeight: 'bold',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}>
              {doc.title}
            </span>
          </div>
        ))}
      </div>
    </div>





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

function ButtonHomePage(){
  const location = useLocation();
  const isLoginPath = location.pathname === '/';
  return (
    <>
      { !isLoginPath ? (
        <Link 
          to={`/`}
          className="inline-flex  mr-4 items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md px-4 py-2 text-sm font-medium no-underline"
        >
          <i className="bi bi-house-door-fill"></i> 
          <span className="hidden md:inline">Back Home</span>
        </Link>
      ) : null }
    </>
  );
}

export { HomePage, ButtonHomePage };