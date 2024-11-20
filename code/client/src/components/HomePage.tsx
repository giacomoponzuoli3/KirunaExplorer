import {Button} from "react-bootstrap"
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../API/API';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../models/user";
import { useEffect } from "react";
import { AddDocumentModal } from "./AddDocumentModal";
import { Stakeholder } from "../models/stakeholder";
import {DocumentLegend} from "./DocumentLegend"
import Alert from "./Alert"
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { MapContainer, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions, LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoreferenceNewDocumentModal } from "./GeoreferenceNewDocumentModal";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';
import { ShowDocumentInfoModal } from "./ShowDocumentInfoModal";
import { EditDocumentModal } from "./EditDocumentModal";
import { AddNewDocumentLinksModal } from "./AddNewDocumentLinksModal";
import { SetMapViewHome } from "./Map";

//----------- Functions -------------//

// Funzione per ottenere una "firma" unica per un poligono
function getPolygonKey(latLngs: LatLngTuple[]): string {
  // Ordina le coordinate del poligono per latitudine e longitudine
  const sortedCoords = latLngs
    .map(coord => `${coord[0]},${coord[1]}`)  // Converti le coordinate in stringhe
    .sort();  // Ordina le coordinate in ordine crescente
  return sortedCoords.join(";");
}


//----------- Interfaces -------------//

interface HomepageProps {
    documents: Document[];
    documentsCoordinates: DocCoordinates[];
    user: User;
    refreshDocuments: () => void;
    refreshDocumentsCoordinates: () => void;
    getDocumentIcon: (type: string) => JSX.Element | null;
    stakeholders: Stakeholder[];
}


//----------- Components -------------//

function HomePage({documentsCoordinates, documents, user, refreshDocuments, refreshDocumentsCoordinates, getDocumentIcon, stakeholders} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocumentCoordinates, setSelectedDocumentCoordinates] = useState<DocCoordinates | null>(null);
  const [newDocumentCoordinates,setNewDocumentCoordinates] = useState<LatLng | LatLng[] | null>(null);
  const [newDocument, setNewDocument] = useState<Document | null>(null);

  //modals
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [showGeoreferenceDocument, setShowGeoreferenceDocument] = useState<boolean>(false);

  const handleEdit = () => {
    setShowDetails(false);
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
        setShow={setShowDetails} 
        selectedDocument={selectedDocument} 
        selectedDocumentCoordinates={selectedDocumentCoordinates}
        onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon} 
        user={user} handleEdit={handleEdit} refreshDocuments={refreshDocuments} 
        refreshDocumentsCoordinates={refreshDocumentsCoordinates}
      />
    )}
                        
    {/* Add Document Button */}
    {user.role==="Urban Planner" ? (
      <button
        className="bg-blue-950 z-[999] hover:border-blue-700 hover:bg-blue-700 fixed bottom-6 right-6 rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 border-blue-950"
        onClick={() => setShowAddDocumentModal(true)}
      >
        <DocumentPlusIcon className="h-7 w-7 text-white" />
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
        onHide={() => setShowEditDocumentModal(false)} 
        
        refreshSelectedDocument={refreshSelectedDocument}
        
        stakeholders={stakeholders}
      />
    )}

    {newDocument && (
      <GeoreferenceNewDocumentModal show={showGeoreferenceDocument} onHide={() => setShowGeoreferenceDocument(false)}
      showAddNewDocumentLinks = {(coordinates: LatLng | LatLng[] | null) => {setNewDocumentCoordinates(coordinates); setShowAddLinks(true);}}
    />
    )}

    {newDocument && (
      <AddNewDocumentLinksModal 
        document={newDocument} 
        show={showAddLinks} 
        onHide={() => setShowAddLinks(false)} 
        refreshDocumentsCoordinates={()=>{setNewDocument(null); setNewDocumentCoordinates(null); refreshDocumentsCoordinates();}}
        docs={documents}
        newDocumentCoordinates={newDocumentCoordinates}

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