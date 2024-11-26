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
import {ArrowsPointingOutIcon, InformationCircleIcon} from '@heroicons/react/24/solid'

function decimalToDMS(decimal: number) {
  const degrees = Math.floor(decimal);
  const minutesDecimal = Math.abs((decimal - degrees) * 60);
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);

  // Handle edge case for rounding up seconds
  if (seconds === 60) {
      return `${degrees + Math.sign(degrees)}° ${minutes + 1}' 0"`;
  }

  return `${degrees}° ${minutes}' ${seconds}"`;
}

interface ModalEditGeoreferenceProps {
  documentCoordinates: DocCoordinates;  // Documento con latitudine e longitudine
  onClose: () => void;  // Funzione per chiudere il modal
  refreshDocuments: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  refreshDocumentsCoordinates: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  onBack: () => void;
}

const ModalEditGeoreference: React.FC<ModalEditGeoreferenceProps> = ({
  documentCoordinates,
  onClose,
  refreshDocuments,
  refreshDocumentsCoordinates,
  onBack
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMunicipalArea, setUseMunicipalArea] = useState(false);  // Stato per la checkbox

  // Default coordinate of municipal city
  const coordinatesCity: L.LatLng[] = createCityCoordinates();

  // Determina se le coordinate rappresentano un poligono o un punto
  const isPolygon = documentCoordinates.coordinates && documentCoordinates.coordinates.length > 1;

  const handleUpdate = async () => {
    if (selectedPosition != null && selectedPosition.length !== 0) {
      setIsLoading(true);
      setError(null);

      try {
        // Fai la chiamata API per aggiornare le coordinate del documento
        await API.updateDocumentCoordinates(documentCoordinates.id, selectedPosition);

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
    }
  };

  // Funzione per gestire il cambio di stato della checkbox
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseMunicipalArea(event.target.checked);
    setSelectedPosition(coordinatesCity);
  };

  // Impostiamo il map component all'interno del modal
  return (
    <div className="size-xl fixed inset-0 z-[1000] bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full h-[90%] max-w-6xl p-8 flex flex-col">
        <div className="flex justify-between items-center border-b mb-7">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit the Georeference of <span className="text-blue-600">{documentCoordinates.title}</span>
          </h2>
        </div>
  
        {error && (
          <div className="mb-4 text-red-600">
            <strong>{error}</strong>
          </div>
        )}


        <form>
          {/* Cambia il contenuto del modal */}
          <div className="mb-4">

            {/* Mappa Leaflet */}
            <div className={`h-80 ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}>
              <MapContainer
                className={`relative w-full ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}
                style={{ height: '100%' }} // Impostiamo l'altezza della mappa al 100% dello spazio disponibile
              >
                <button
                  onClick={() => {}}
                  className="relative left-2 top-20 bg-gray-50 text-blue-600 p-2 rounded-full border-gray-50 border-1 shadow-lg hover:text-blue-950 hover:border-blu-600 z-[1000]"
                >
                  <InformationCircleIcon className="w-6 h-6" />
                </button>
                {/* TileLayer per visualizzare la mappa */}
                <SetMapViewEdit
                  setSelectedPosition={setSelectedPosition}
                  useMunicipalArea={useMunicipalArea}  // Passa lo stato per disabilitare la mappa
                />
                {/* Button for selecting whole area */}
                <button
                  title="Select the whole area"
                  className="absolute right-3 top-[160px] z-[1000] w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-blue-200 rounded"
                  onClick={() => {}}
                >
                  <ArrowsPointingOutIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
                </button>
              </MapContainer>
          
            </div>
    
            {/* Toggle switch per l'area municipale */}
            <div className="mt-2 flex items-center mb-4">
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
    
            {/* Bottoni di azione */}
            <div className="flex justify-between  mb-3">
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
          </div>
        </form>
      </div>
    </div>
  );
  
};


export { ModalEditGeoreference };
