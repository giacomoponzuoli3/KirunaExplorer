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

import { MapContainer, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';


interface HomepageProps {
    documents: Document[];
    user: User;
    refreshDocuments: () => void;
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
      const marker = L.marker([doc.coordinates.lat, doc.coordinates.lng], {
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

      // Listener per aprire il componente ShowDocumentInfoModal al clic del marker
      marker.on('click', () => {
        props.onMarkerClick(doc);
      });
    });
  }, [props.documents])

  return null;
}


function HomePage({documents, user, refreshDocuments, stakeholders} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [newDocument, setNewDocument] = useState<Document | null>(null);

  //modals
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  

  // Dati di test per i documenti con coordinate all'interno di Kiruna
  const testDocuments = [
    {
      id: 1,
      title: "Environmental Impact Assessment",
      stakeHolders: [{ name: "Kiruna Municipality" }, { name: "LKAB Mining" }],
      scale: "Citywide",
      issuanceDate: "2023-04-15",
      type: "Informative document",
      language: "English",
      pages: "25",
      description: "An assessment of the environmental impact of local mining activities.",
      coordinates: { lat: 67.8558, lng: 20.2253 },
    },
    {
      id: 2,
      title: "Urban Development Plan",
      stakeHolders: [{ name: "City Planning Department" }, { name: "Local Residents Association" }],
      scale: "Citywide",
      issuanceDate: "2022-12-05",
      type: "Design document",
      language: "Swedish",
      pages: "30",
      description: "Plan for urban development in Kiruna considering population relocation.",
      coordinates: { lat: 67.8580, lng: 20.2400 },
    },
    {
      id: 3,
      title: "Historical Preservation Report",
      stakeHolders: [{ name: "Cultural Heritage Agency" }],
      scale: "Local",
      issuanceDate: "2021-09-10",
      type: "Technical document",
      language: "Swedish",
      pages: "15",
      description: "Report on preserving historical buildings in Kiruna.",
      coordinates: { lat: 67.8520, lng: 20.2150 },
    },
    {
      id: 4,
      title: "Infrastructure Agreement",
      stakeHolders: [{ name: "Kiruna Municipality" }, { name: "Swedish Transport Administration" }],
      scale: "Citywide",
      issuanceDate: "2020-07-01",
      type: "Agreement",
      language: "English",
      pages: "12",
      description: "Agreement on the development of new infrastructure in Kiruna.",
      coordinates: { lat: 67.8600, lng: 20.2350 },
    },
    {
      id: 5,
      title: "Mining Effects on Local Wildlife",
      stakeHolders: [{ name: "Environmental Protection Agency" }],
      scale: "Regional",
      issuanceDate: "2023-02-20",
      type: "Prescriptive document",
      language: "English",
      pages: "20",
      description: "Document outlining regulations for protecting wildlife near mining areas.",
      coordinates: { lat: 67.8590, lng: 20.2200 },
    },
    {
      id: 6,
      title: "Public Consultation on Relocation",
      stakeHolders: [{ name: "Local Residents Association" }, { name: "City Council" }],
      scale: "Community",
      issuanceDate: "2023-01-18",
      type: "Consultation",
      language: "Swedish",
      pages: "10",
      description: "Summary of the public consultation regarding relocation plans.",
      coordinates: { lat: 67.8540, lng: 20.2100 },
    },
    {
      id: 7,
      title: "Construction Code Update",
      stakeHolders: [{ name: "Kiruna Municipality" }, { name: "Local Construction Firms" }],
      scale: "Citywide",
      issuanceDate: "2022-06-30",
      type: "Material effect",
      language: "Swedish",
      pages: "18",
      description: "New guidelines for construction standards in the area.",
      coordinates: { lat: 67.8605, lng: 20.2258 },
    },
  ];


  const handleEdit = () => {
    setShowEditDocumentModal(true);
  };

  const handleCloseDetailsModal = () => {
      setShowDetails(false);
      setSelectedDocument(null);
  };

  const handleDocumentClick = async (doc: any) => {
      //const document = await API.getDocumentById(doc.id);
      setSelectedDocument(doc);
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
      {/* Impostiamo il centro, il livello di zoom e i vari documenti tramite SetMapView */}
      <SetMapView documents={testDocuments} onMarkerClick={handleDocumentClick}/>

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
        {testDocuments.map((doc, index) => (
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
      showAddNewDocumentLinksModal = {(doc: Document) => {setNewDocument(doc); setShowAddLinks(true); }}
    />


    {selectedDocument && (
      <EditDocumentModal 
        document={selectedDocument} show={showEditDocumentModal} 
        onHide={() => setShowEditDocumentModal(false)} refreshSelectedDocument={refreshSelectedDocument}
        stakeholders={stakeholders}
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