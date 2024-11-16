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

  // Default coordinate of municipal city
  const coordinatesCity: L.LatLng[] = [
    L.latLng(67.8753332, 20.1841097),
    L.latLng(67.8749453, 20.1866846),
    L.latLng(67.8738462, 20.1880579),
    L.latLng(67.8731996, 20.1878862),
    L.latLng(67.8710012, 20.193551),
    L.latLng(67.8689318, 20.1969843),
    L.latLng(67.8659569, 20.1988725),
    L.latLng(67.8638871, 20.2023058),
    L.latLng(67.8620112, 20.204709),
    L.latLng(67.8603939, 20.205224),
    L.latLng(67.8586471, 20.2011041),
    L.latLng(67.8573531, 20.1971559),
    L.latLng(67.857159, 20.1923494),
    L.latLng(67.8563826, 20.1921778),
    L.latLng(67.8561885, 20.1944093),
    L.latLng(67.8541826, 20.1870279),
    L.latLng(67.8528883, 20.182908),
    L.latLng(67.8534707, 20.1793031),
    L.latLng(67.8552179, 20.1798181),
    L.latLng(67.8567061, 20.1808481),
    L.latLng(67.8577414, 20.1823931),
    L.latLng(67.858259, 20.183938),
    L.latLng(67.8583236, 20.1868562),
    L.latLng(67.857159, 20.1873712),
    L.latLng(67.8577414, 20.1894312),
    L.latLng(67.8588412, 20.1880579),
    L.latLng(67.8596176, 20.185483),
    L.latLng(67.8618171, 20.1880579),
    L.latLng(67.8623993, 20.1875429),
    L.latLng(67.8620759, 20.185483),
    L.latLng(67.8633696, 20.1851396),
    L.latLng(67.8640811, 20.1823931),
    L.latLng(67.8634343, 20.1803331),
    L.latLng(67.8590353, 20.17381),
    L.latLng(67.8598117, 20.1688318),
    L.latLng(67.8602645, 20.163167),
    L.latLng(67.8587765, 20.150464),
    L.latLng(67.8428555, 20.1463442),
    L.latLng(67.8337899, 20.2012758),
    L.latLng(67.8384526, 20.2012758),
    L.latLng(67.8289966, 20.2541475),
    L.latLng(67.8229065, 20.2901964),
    L.latLng(67.8384526, 20.3166323),
    L.latLng(67.8381936, 20.3561144),
    L.latLng(67.851141, 20.3619509),
    L.latLng(67.8604586, 20.3066759),
    L.latLng(67.8781777, 20.2129488),
    L.latLng(67.8753332, 20.1841097)
  ];

  // Determina se le coordinate rappresentano un poligono o un punto
  const isPolygon = documentCoordinates.coordinates && documentCoordinates.coordinates.length > 1;

  console.log(selectedPosition);

  const handleUpdate = async () => {
    console.log("update: " + selectedPosition);
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
              <MapContainer style={{ height: '100%' }}>
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
  const { setSelectedPosition, useMunicipalArea } = props;
  const map = useMap(); // Ottieni l'istanza della mappa

  // Coordinate di esempio (come punto centrale della mappa)
  const position: LatLngTuple = [67.8558, 20.2253];

  // Limiti della mappa per Kiruna
  const kirunaBounds = new LatLngBounds(
    [67.790390, 20.416509],  // Sud-ovest
    [67.889194, 20.050656]   // Nord-est
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
      // Rimuovere il vecchio marker, se presente
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      map.doubleClickZoom.enable();
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      setSelectedPosition(null);
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
