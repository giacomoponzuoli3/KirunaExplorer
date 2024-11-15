import React, { useState, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions, LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import API from '../API/API';
import { DocCoordinates } from "../models/document_coordinate";

interface ModalEditGeoreferenceProps {
  documentCoordinates: DocCoordinates;  // Documento con latitudine e longitudine
  onClose: () => void;  // Funzione per chiudere il modal
  refreshDocuments: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  refreshDocumentsCoordinates: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
}

const ModalEditGeoreference: React.FC<ModalEditGeoreferenceProps> = ({
  documentCoordinates, 
  onClose, 
  refreshDocuments, 
  refreshDocumentsCoordinates
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMunicipalArea, setUseMunicipalArea] = useState(false);  // Stato per la checkbox

  // Mappa figlio: Usa useMap per ottenere il contesto della mappa
  const handleUpdate = async () => {
    if (selectedPosition != null) {
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-800 mb-2 hover:text-blue-500">
              <span className="text-gray-600">Actual latitude: </span>
              <span className="font-semibold text-blue-600">{documentCoordinates.coordinates[0].latitude}</span>
            </label>

            <label htmlFor="location" className="block text-sm font-medium text-gray-800 mb-4 hover:text-blue-500">
              <span className="text-gray-600">Actual longitude: </span>
              <span className="font-semibold text-blue-600">{documentCoordinates.coordinates[0].longitude}</span>
            </label>

            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Select New Georeference
            </label>

            {/* Mappa Leaflet */}
            <div className={`h-80 ${useMunicipalArea ? 'pointer-events-none opacity-50' : ''}`}>
              <MapContainer style={{ height: '100%' }}>
                {/* TileLayer per visualizzare la mappa */}
                <SetMapViewEdit
                  selectedPosition={selectedPosition}
                  setSelectedPosition={setSelectedPosition}
                  useMunicipalArea={useMunicipalArea}  // Passa lo stato per disabilitare la mappa
                />
              </MapContainer>
            </div>
          </div>

          {/* Toggle switch per l'area municipale */}
          <div className="mt-4 flex items-center mb-5">
            {/* Checkbox a sinistra della scritta */}
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
            {/* Scritta accanto al toggle */}
            <span className="ml-3 text-sm text-gray-600">The entire municipal area</span>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={onClose}
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

// Componente per la costruzione della mappa
function SetMapViewEdit(props: any) {
  const { selectedPosition, setSelectedPosition, useMunicipalArea } = props;
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

  // Marker per il punto selezionato
  let currentMarker: L.Marker | null = null;

  useEffect(() => {
    // Imposta la vista iniziale solo una volta
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

  // Se la checkbox è selezionata, disabilita la mappa
  useEffect(() => {
    if (useMunicipalArea) {
      map.doubleClickZoom.disable();
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.doubleClickZoom.enable();
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
    }
  }, [map, useMunicipalArea]);

  // Gestione dell'evento di creazione del marker
  map?.on(L.Draw.Event.CREATED, (event: any) => {
    const layer = event.layer;

    if (event.layerType === 'marker') {
      const newPosition = layer.getLatLng();
      
      // Rimuovere il vecchio marker, se presente
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      // Aggiungi il nuovo marker sulla mappa
      currentMarker = layer;
      layer.addTo(map);

      // Aggiorna la posizione selezionata
      setSelectedPosition([{lat: newPosition.lat, lng: newPosition.lng}]);
    }
  });

  return null;
}

export { ModalEditGeoreference };
