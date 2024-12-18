import { useState } from 'react';
import { useLocation, Link, useNavigate} from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../models/user";
import { AddDocumentModal } from "./AddDocumentModal";
import { Stakeholder } from "../models/stakeholder";
import {DocumentLegend} from "./DocumentLegend"
import Alert from "./Alert"
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { MapContainer } from 'react-leaflet';
import {LatLng, LatLngTuple} from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
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
  const [showAddLinks, setShowAddLinks] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [showGeoreferenceDocument, setShowGeoreferenceDocument] = useState<boolean>(false);



  

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


export { MapPage, ButtonHomePage };
