import React, { useState, useEffect } from 'react';
import Coordinate from '../models/coordinate';
import { Document } from '../models/document';
import API from '../API/API';

import { MapContainer, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';

interface ModalEditGeoreferenceProps {
  document: Document;  // Documento con latitudine e longitudine
  documentCoordinates: Coordinate[];  // Le coordinate del documento
  onClose: () => void;  // Funzione per chiudere il modal
  refreshDocuments: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
}

const ModalEditGeoreference: React.FC<ModalEditGeoreferenceProps> = ({
  document, 
  onClose, 
  documentCoordinates,
  refreshDocuments
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLngTuple>([
    documentCoordinates[0]?.latitude || 0, 
    documentCoordinates[0]?.longitude || 0
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mappa figlio: Usa useMap per ottenere il contesto della mappa
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fai la chiamata API per aggiornare le coordinate del documento
      //await API.updateDocumentCoordinates(document.id, selectedPosition[0], selectedPosition[1]);
      
      // Dopo aver aggiornato, ricarica i documenti
      refreshDocuments();

      // Chiudi il modal dopo il salvataggio
      onClose();
    } catch (err) {
      setError('An error occurred while saving the georeference.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  // Impostiamo il map component all'interno del modal
  return (
    <div className="fixed inset-0 z-[1000] bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full  max-w-4xl p-8"> {/* Modal più grande */}
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Actual latitude {}
            </label>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Actual longitude {}
            </label>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Select New Georeference
            </label>
            {/* Mappa Leaflet */}
            <div className="h-80">
              <MapContainer style={{ height: '100%' }}>
                {/* TileLayer per visualizzare la mappa */}
                <SetMapViewEdit selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition} />
              </MapContainer>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
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

// Componente per la costruzione dell mappa
function SetMapViewEdit(props: any) {
    const { selectedPosition, setSelectedPosition } = props;
    const map = useMap(); // Ottieni l'istanza della mappa
  
    // Coordinate di esempio (come punto centrale della mappa)
    const position: LatLngTuple = [67.8558, 20.2253];
  
    // Limiti della mappa per Kiruna
    const kirunaBounds = new LatLngBounds(
      [67.3556, 17.8994], // Sud-ovest
      [69.0592, 23.2858]  // Nord-est
    );
  
    // Icona personalizzata per il marker
    const defaultIcon = L.icon({
      iconUrl: '/kiruna/img/pinMap.png', // URL dell'icona predefinita
      iconSize: [40, 40], // Dimensioni dell'icona
      iconAnchor: [15, 30], // Punto di ancoraggio
      popupAnchor: [1, -34], // Punto popup
    });
  
    useEffect(() => {
        // Imposta la vista iniziale solo una volta
        // Impostare la vista iniziale solo al primo rendering
    if (map.getZoom() === undefined) {
        map.setView(position, 12);
      }
  
      // Imposta i limiti di zoom
      map.setMaxZoom(18);
      map.setMinZoom(3);
  
        // Limita la mappa alla zona di Kiruna
        map.setMaxBounds(kirunaBounds);
  
        // Aggiungi i controlli per il disegno
        const drawControl = new L.Control.Draw({
          draw: {
            marker: { icon: defaultIcon }, // Abilita i marker con l'icona personalizzata
            polygon: false,
            polyline: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
          },
        });
        map.addControl(drawControl);
  
        // Layer satellitare
        const satelliteLayer = L.tileLayer(
          'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
        );
        satelliteLayer.addTo(map);
  
        // Pulizia del componente (rimuovi i controlli e layer)
        return () => {
          map.removeControl(drawControl);
          map.removeLayer(satelliteLayer);
        };

    }, [map]);
  
    // Gestione dell'evento di creazione del marker
    map?.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
  
      if (event.layerType === 'marker') {
        const newPosition = layer.getLatLng();
        setSelectedPosition([newPosition.lat, newPosition.lng]);
      }
  
      // Aggiungi il layer alla mappa
      layer.addTo(map);
    });
  
    return null;
  }
  

export { ModalEditGeoreference };
