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
  const classicLayer =   L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
  );

  // Configurazione layer satellitare alla mappa
  const satelliteLayer = L.tileLayer(
    'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 
    { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
  );

  // Funzione per disegnare un poligono di default
  const drawDefaultPolygon = () => {
    const defaultPolygon = L.polygon(
      [
        [67.855, 20.225],
        [67.856, 20.226],
        [67.857, 20.225],
        [67.856, 20.224],
      ],
      {
        color: '#3388ff',
        weight: 2,
        fillOpacity: 0.3,
      }
    );

    defaultPolygon.addTo(map);
  };


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

    //Add the classic layer
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


    console.log(props.documents);
    // Creazione e aggiunta dei marker personalizzati

    props.documents.filter((d: DocCoordinates) => d.coordinates.length != 0).forEach((doc: any) => {
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
        const documents = await API.getAllDocumentsCoordinates(); //all documents also which that aren't coordinates
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
      <SetMapViewHome documents={documentsCoordinates} getDocumentIcon={getDocumentIcon} onMarkerClick={handleDocumentClick}/>

    </MapContainer>

    {/* Show the Legend of document types */}
    {/*<DocumentLegend />*/}

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