import { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../models/user";
import { AddDocumentModal } from "./AddDocumentModal";
import { Stakeholder } from "../models/stakeholder";
import {DocumentLegend} from "./DocumentLegend"
import Alert from "./Alert"
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { MapContainer } from 'react-leaflet';
// Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import { SetMapViewHome } from "./Map";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

//----------- Functions -------------//

// Funzione per ottenere una "firma" unica per un poligono


//----------- Interfaces -------------//

interface MapPageProps {
    documentsCoordinates: DocCoordinates[];
    user: User;
    refreshDocumentsCoordinates: () => void;
    getDocumentIcon: (type: string) => JSX.Element | null;
    stakeholders: Stakeholder[];
    geoJsonData: any;
    scaleOptions: { value: string; label: string }[];
    typeOptions: { value: string; label: string }[];
    //setScaleOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
    onCreateScale: (inputValue: string) => Promise<void>;
    onCreateType: (inputValue: string) => Promise<void>;
}


//----------- Components -------------//

function MapPage({documentsCoordinates, user, refreshDocumentsCoordinates, getDocumentIcon, stakeholders, geoJsonData, scaleOptions, onCreateScale, typeOptions, onCreateType} : MapPageProps) {
  const navigate = useNavigate();

  //modals
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);





  

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
      <SetMapViewHome documentsCoordinates={documentsCoordinates} 
        geoJsonData={geoJsonData} getDocumentIcon={getDocumentIcon} 
        user={user} refreshDocumentsCoordinates={refreshDocumentsCoordinates}
        scaleOptions={scaleOptions} onCreateScale={onCreateScale}
        stakeholders={stakeholders} typeOptions={typeOptions} onCreateType={onCreateType}
      />

    </MapContainer>

    {/* Show the Legend of document types */}
    {<DocumentLegend />}


    {/* Search Document Button */}
    <button
      className="fixed bottom-20 left-4 z-[999] bg-blue-950 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
      onClick={() =>{
        navigate(`/documents/-1`)
      }}
      title="View documents related to the entire municipality of Kiruna"
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
      stakeholders={stakeholders} 
      refreshDocumentsCoordinates = {refreshDocumentsCoordinates}
      documentsCoordinates={documentsCoordinates}
      scaleOptions={scaleOptions}
      typeOptions={typeOptions}
      //setScaleOptions={setScaleOptions}
      onCreateScale={onCreateScale}
      onCreateType={onCreateType}
    />
  </>
    
  );      
}


export { MapPage };
