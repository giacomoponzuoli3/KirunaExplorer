import React, { useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import API from '../API/API';
import { DocCoordinates } from "../models/document_coordinate";
import { SetMapViewEdit } from './Map';
import {createCityCoordinates} from './Map'
import { Button } from 'react-bootstrap';
import {ArrowsPointingOutIcon, InformationCircleIcon, Square2StackIcon, MapPinIcon, PencilSquareIcon} from '@heroicons/react/24/solid'
import Alert from './Alert';


interface ModalEditGeoreferenceProps {
  documentCoordinates: DocCoordinates;  // Documento con latitudine e longitudine
  onClose: () => void;  // Funzione per chiudere il modal
  refreshDocuments: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  refreshDocumentsCoordinates: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  onBack: () => void;
  mode: string //Variabile che mi dice se sono in modalità di inserimento o update
}

const ModalEditGeoreference: React.FC<ModalEditGeoreferenceProps> = ({
  documentCoordinates,
  onClose,
  refreshDocuments,
  refreshDocumentsCoordinates,
  onBack,
  mode
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMunicipalArea, setUseMunicipalArea] = useState(false);  // Stato per la checkbox

  //state for the selection
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // Stato per il pulsante selezionato

  //alert
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Default coordinate of municipal city
  const coordinatesCity: L.LatLng[] = createCityCoordinates();

  // Determina se le coordinate rappresentano un poligono o un punto
  const isPolygon = documentCoordinates.coordinates && documentCoordinates.coordinates.length > 1;

  const handleUpdate = async () => {
    if (selectedPosition != null && selectedPosition.length !== 0) {
      setIsLoading(true);
      setError(null);

      try {
        if(mode == "edit"){
          // Fai la chiamata API per aggiornare le coordinate del documento
          await API.updateDocumentCoordinates(documentCoordinates.id, selectedPosition);
        }
        if(mode == "insert"){
          //Fai la chiamata API per inseire le coordinate ad un documento
          await API.setDocumentCoordinates(documentCoordinates.id, selectedPosition);
        }

        // Dopo aver aggiornato, ricarica i documenti
        refreshDocuments();
        refreshDocumentsCoordinates();

        // Chiudi il modal dopo il salvataggio
        onClose();
      } catch (err) {
        setError('An error occurred while saving the georeference.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }else{
      setShowAlert(true);
    }
  };

  // Funzione per gestire il cambio di stato della checkbox
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseMunicipalArea(event.target.checked);
    setSelectedPosition(coordinatesCity);
    if (event.target.checked) {
      setSelectedButton('Entire Area'); // Se l'area municipale è selezionata, resettiamo l'input
    }
  };

  const handleButtonClick = (buttonType: string) => {
    setSelectedButton(buttonType); // Imposta il pulsante selezionato
    setSelectedPosition(null); //reset the position
    setUseMunicipalArea(false);
  };


  // Impostiamo il map component all'interno del modal
  return (
    <div className="size-xl fixed inset-0 z-[1000] bg-gray-500 bg-opacity-75 flex items-center justify-center pt-6 pb-6">
      <div className="bg-white rounded-lg shadow-lg w-full h-[90%] max-w-6xl p-8 flex flex-col">
        <div className="flex justify-between items-center border-b mb-7">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode == "edit" ? "Edit" : "Add new"} the Georeference of <span className="text-blue-600">{documentCoordinates.title}</span>
          </h2>
        </div>

        {showAlert &&
          <Alert
          message={selectedPosition == null 
            ? "No new georeference was added. Please try again." 
            : "Sorry, something went wrong..."}
          onClose={() => {
            setShowAlert(false);
          }}
        />
        }

        <div className="flex mb-4 space-x-3">
          {/* New point */}
          <button
            title='Insert new point'
            className={`px-3 py-1 border-1 border-green-500 text-green-500 text-sm rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 ${
              selectedButton === 'point' ? 'bg-green-100 text-green-500 border-green-500 border-2' : ''
            }`}
            onClick={() => handleButtonClick('point')}
          >
            <MapPinIcon className="w-5 h-5 mr-2 inline" />
            New point
          </button>

          {/* New polygon */}
          <button
            title='Draw new plygon'
            className={`px-3 py-1 border-1 border-blue-500 text-blue-500 text-sm rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-200 ${
              selectedButton === 'polygon' ? 'bg-blue-100 text-blue-500 border-blue-500 border-2' : ''
            }`}
            onClick={() => handleButtonClick('polygon')}
          >
            <Square2StackIcon className="w-5 h-5 mr-2 inline" />
            New polygon
          </button>

          {/* Edit georeference */}

          {mode === 'edit' && 
            <button
              title='Edit the actual georeference'
              className={`px-3 py-1 border-1 border-orange-500 text-orange-500 text-sm rounded-full hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 transition ease-in-out duration-200 ${
                selectedButton === 'edit' ? 'bg-orange-100 text-orange-500 border-orange-500 border-2' : ''
              }`}
              onClick={() => handleButtonClick('edit')}
            >
              <PencilSquareIcon className="w-5 h-5 mr-2 inline" />
              Edit georeference
            </button>
          }

          <div className="flex items-center mb-0">
            <label htmlFor="municipal-area-checkbox" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="municipal-area-checkbox"
                checked={useMunicipalArea}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <span className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></span>
            </label>
            <span className="ml-3 text-sm text-gray-600">The entire municipal area</span>
          </div>
        </div>
        <form className="flex flex-col flex-grow">
          {/* Mappa Leaflet */}
          <div  className={`relative w-full h-full mb-4 ${useMunicipalArea || selectedButton === null ? 'pointer-events-none opacity-50' : ''}`}>
            <MapContainer
              className={`relative w-full ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}
              style={{ height: '100%' }}
            >
              <SetMapViewEdit
                setSelectedPosition={setSelectedPosition}
                selectedButton={selectedButton}
                useMunicipalArea={useMunicipalArea}
                documentCoordinates={documentCoordinates}
              />
            </MapContainer>
          </div>

          {/* Bottoni Back e Update */}
          <div className="mt-auto flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};


export { ModalEditGeoreference };
