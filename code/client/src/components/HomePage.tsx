import { useState } from 'react';
import { useLocation, Link, useNavigate} from 'react-router-dom';
import API from '../API/API';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../../../common_models/user";
import { AddDocumentModal } from "./AddDocumentModal";
import { Stakeholder } from "../models/stakeholder";
import {DocumentLegend} from "./DocumentLegend"
import Alert from "./Alert"
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { MapContainer } from 'react-leaflet';
import {LatLng, LatLngTuple} from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import { GeoreferenceNewDocumentModal } from "./GeoreferenceNewDocumentModal";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import { ShowDocumentInfoModal } from "./ShowDocumentInfoModal";
import { EditDocumentModal } from "./EditDocumentModal";
import { AddNewDocumentLinksModal } from "./AddNewDocumentLinksModal";
import { SetMapViewHome } from "./Map";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

//----------- Functions -------------//

// Funzione per ottenere una "firma" unica per un poligono
function getPolygonKey(latLngs: LatLngTuple[]): string {
  // Ordina le coordinate del poligono per latitudine e longitudine
  const sortedCoords = latLngs
    .map(coord => `${coord[0]},${coord[1]}`)  // Converti le coordinate in stringhe
    .sort((a: string, b: string) => {
        if (a < b) return -1
        if (a > b) return 1

        return 0
    });  // Ordina le coordinate in ordine crescente
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
    geoJsonData: any;
    scaleOptions: { value: string; label: string }[];
    //setScaleOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
    onCreateScale: (inputValue: string) => Promise<void>;
}


//----------- Components -------------//

function HomePage({documentsCoordinates, documents, user, refreshDocuments, refreshDocumentsCoordinates, getDocumentIcon, stakeholders, geoJsonData, scaleOptions, onCreateScale} : HomepageProps) {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocumentCoordinates, setSelectedDocumentCoordinates] = useState<DocCoordinates | null>(null);
  const [newDocumentCoordinates,setNewDocumentCoordinates] = useState<LatLng | LatLng[] | null>(null);
  const [newDocument, setNewDocument] = useState<Document | null>(null);
  const [files, setFiles] = useState<File[]>([]);//Resources of newDocument
  const navigate = useNavigate();

  //modals
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [showGeoreferenceDocument, setShowGeoreferenceDocument] = useState<boolean>(false);

  
  

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

  function refreshSelectedDocument(doc: DocCoordinates) {
    setSelectedDocument(doc)
    setSelectedDocumentCoordinates(doc);
    refreshDocumentsCoordinates();
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
      <SetMapViewHome documentsCoordinates={documentsCoordinates} geoJsonData={geoJsonData} getDocumentIcon={getDocumentIcon} onMarkerClick={handleDocumentClick}/>

    </MapContainer>

    {/* Show the Legend of document types */}
    {<DocumentLegend />}

    {/* Modal to show the document info */}
    {selectedDocumentCoordinates && selectedDocument && ( 
      <ShowDocumentInfoModal 
        show={showDetails}
        setShow={setShowDetails} 
        selectedDocumentCoordinates={selectedDocumentCoordinates}
        onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon} 
        user={user} handleEdit={() => {setShowDetails(false); setShowEditDocumentModal(true);}} refreshDocuments={refreshDocuments} 
        geoJsonData={geoJsonData}
        refreshDocumentsCoordinates={refreshDocumentsCoordinates}
      />
    )}

    {/* Search Document Button */}
    <button
      className="fixed bottom-20 left-4 z-[999] bg-blue-950 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
      onClick={() =>{
        navigate(`/documents/-1`)
      }}
      title="Search on documents referred to the whole municipality"
    >
      <MagnifyingGlassIcon className="h-5 w-5" />
    </button>   
                        
    {/* Add Document Button */}
    {user.role==="Urban Planner" ? (
      <button
        className="fixed bottom-6 right-4 z-[999] bg-blue-950 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        onClick={() => setShowAddDocumentModal(true)}
      >
        <DocumentPlusIcon className="h-5 w-5" />
      </button>
      ) : null
    }

    <AddDocumentModal 
      show={showAddDocumentModal} 
      onHide={() => setShowAddDocumentModal(false)} 
      refreshDocuments={refreshDocuments} 
      stakeholders={stakeholders} 
      showGeoreferenceNewDocumentModal = {(doc: Document, filesUploaded: File[]) => {
        setNewDocument(doc); setShowGeoreferenceDocument(true);
      if(filesUploaded.length>0){setFiles(filesUploaded)} }}
      scaleOptions={scaleOptions}
      //setScaleOptions={setScaleOptions}
      onCreateScale={onCreateScale}
    />

    {selectedDocument && (
      <EditDocumentModal 
        document={selectedDocument} show={showEditDocumentModal} 
        onHide={() => {setShowEditDocumentModal(false); setShowDetails(true);}} 
        refreshSelectedDocument={refreshSelectedDocument}
        
        stakeholders={stakeholders}
        scaleOptions={scaleOptions}
        //setScaleOptions={setScaleOptions}
        onCreateScale={onCreateScale}
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
        filesUploaded={files}
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
