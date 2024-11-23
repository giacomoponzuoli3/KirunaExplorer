import React, { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import API from '../API/API';
import { DocCoordinates } from "../models/document_coordinate";
import { SetMapViewEdit } from './Map';

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
  const [coordinates, setCoordinates] = useState<L.LatLng[]>([]);

  // Fetch municipality area coordinates
  useEffect(() => {
    const getMunicipalityArea = async () => {
      try {
        const coord = await API.getMunicipalityArea();
        setCoordinates(coord);
      } catch (err) {
        console.log("Error getting municipality area");
      }
    };
    getMunicipalityArea();
  }, []);

  function createCityCoordinates(): L.LatLng[] {
    console.log(coordinates);
    return coordinates.map(coord => L.latLng(coord.lat, coord.lng));
  }

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
    setSelectedPosition(coordinates);
  };

  // Impostiamo il map component all'interno del modal
  return (
    <div className="fixed inset-0 z-[1000] bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full h-5/6 max-w-4xl p-8">
        <div className="flex justify-between items-center border-b mb-7">
          <h2 className="text-lg font-semibold text-gray-900">Edit Document Georeference</h2>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            <strong>{error}</strong>
          </div>
        )}

        <form>
          {/* Cambia il contenuto del modal */}
          <div className="mb-4">
            {isPolygon ? (
              <div className="flex items-center text-blue-600 mb-3">
              <span className="font-semibold">This document is associated with an area of the city, and not a single point.</span>
            </div>
            ) : (
              <>
                <label htmlFor="location" className="block text-sm font-medium text-gray-800 mb-2 hover:text-blue-500">
                  <span className="text-gray-600">Actual latitude: </span>
                  <span className="font-semibold text-blue-600">{documentCoordinates.coordinates[0].latitude}</span>
                </label>

                <label htmlFor="location" className="block text-sm font-medium text-gray-800 mb-4 hover:text-blue-500">
                  <span className="text-gray-600">Actual longitude: </span>
                  <span className="font-semibold text-blue-600">{documentCoordinates.coordinates[0].longitude}</span>
                </label>
              </>
            )}

            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Select New Georeference
            </label>

            {/* Mappa Leaflet */}
            <div className={`h-80 ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}>
            <MapContainer
              className={`relative w-full ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}
              style={{ height: '100%' }} // Regola in base alla tua esigenza
            >
                {/* TileLayer per visualizzare la mappa */}
                <SetMapViewEdit
                  setSelectedPosition={setSelectedPosition}
                  useMunicipalArea={useMunicipalArea}  // Passa lo stato per disabilitare la mappa
                />
              </MapContainer>
            </div>
          </div>

          {/* Toggle switch per l'area municipale */}
          <div className="mt-4 flex items-center mb-5">
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

          <div className="mt-6 flex justify-between">
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
