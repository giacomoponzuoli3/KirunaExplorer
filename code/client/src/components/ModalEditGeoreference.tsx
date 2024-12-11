import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polygon } from 'react-leaflet';
import L, { LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import API from '../API/API';
import { DocCoordinates } from "../models/document_coordinate";
import {cityCoords, SetMapViewEdit} from './Map';
import {InformationCircleIcon, Square2StackIcon, MapPinIcon, PencilSquareIcon, CursorArrowRaysIcon} from '@heroicons/react/24/solid'
import Alert from './Alert';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Coordinate from '../models/coordinate';


interface ModalEditGeoreferenceProps {
  documentCoordinates: DocCoordinates;  // Documento con latitudine e longitudine
  onClose: () => void;  // Funzione per chiudere il modal
  refreshDocumentsCoordinates: () => void;  // Funzione per ricaricare la lista dei documenti dopo la modifica
  onBack: () => void;
  mode: string //Variabile che mi dice se sono in modalità di inserimento o update
  geoJsonData: any
}

const ModalEditGeoreference: React.FC<ModalEditGeoreferenceProps> = ({
  documentCoordinates,
  onClose,
  refreshDocumentsCoordinates,
  onBack,
  mode,
  geoJsonData
}) => {
  const [existingGeoRef,setExistingGeoRef] = useState<Coordinate[][]>([])
  const [selectedPosition, setSelectedPosition] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMunicipalArea, setUseMunicipalArea] = useState(documentCoordinates.coordinates.length == 0 ? false :  documentCoordinates.coordinates[0].municipality_area == 1);  // Stato per la checkbox

  //state for the selection
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // Stato per il pulsante selezionato

  //alert
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Default coordinate of municipal city
  const coordinatesCity: L.LatLng[] = cityCoords;

  // Determina se le coordinate rappresentano un poligono o un punto
  const isPolygon = documentCoordinates.coordinates && documentCoordinates.coordinates.length > 1;

  const customIcon = new L.Icon({
    iconUrl: '/img/marker.png',
    iconSize: [25, 41],  // Dimensioni dell'icona
    iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
    popupAnchor: [1, -34], // Punto da cui si apre il popup
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]  // Dimensioni dell'ombra
  });

  const arraysEqual = (arr1: L.LatLng[], arr2: L.LatLng[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((point, index) =>
      point.equals(arr2[index])
    );
  };

  const handleUpdate = async () => {
    if (selectedPosition != null) {
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

        console.log("Entrato1")
        // Dopo aver aggiornato, ricarica i documenti
        refreshDocumentsCoordinates();
        console.log("Entrato1")

        // Chiudi il modal dopo il salvataggio
        onClose();
      } catch (err) {
        setError('An error occurred while saving the georeference.');
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }else{
      console.log(selectedPosition)
      setShowAlert(true);
    }
  };

  // Funzione per gestire il cambio di stato della checkbox
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation(); // Blocca l'evento per impedire interferenze
    console.log("Checkbox changed", event.target.checked);
    setUseMunicipalArea(event.target.checked);
    if (event.target.checked) {
        setSelectedPosition([]);
        setSelectedButton('Entire Area');
    }
  };

  const handleButtonClick = (buttonType: string) => {
    setSelectedButton(buttonType); // Imposta il pulsante selezionato
    setSelectedPosition(null); //reset the position
    setUseMunicipalArea(false);
  };

  useEffect(() => {
    console.log(selectedPosition)
  }, [selectedPosition])

  const getExistingAreasAndPoints = async () => {
    try {
        const allGeoRef: Coordinate[][] = await API.getExistingGeoreferences();
        console.log("tuka sum");
        setExistingGeoRef(allGeoRef);
    } catch (err: any) {
        console.log(err);
    }
  };

  useEffect(() => {
    getExistingAreasAndPoints().then();
  }, []); // Trigger this when the modal visibility (`show`) changes


  // Impostiamo il map component all'interno del modal
  return (
    <div className="size-xl fixed inset-0 z-[1000] bg-gray-500 bg-opacity-75 flex items-center justify-center pt-6 pb-6">
      <div className="bg-white rounded-lg shadow-lg w-full h-[90%] max-w-6xl p-8 flex flex-col">
        <div className="flex justify-between items-center border-b mb-2">
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
        {documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1 && 
        
          <span className='text-sm text-gray-600 mt-1 mb-3 flex items-center'>
            <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-500 t" />
            The "Edit Georeference" and checkbox for "The Entire Municipal Area" are disabled because the document is already associated with the entire municipality.
          </span>
        }
        
        <div className="flex mb-2 space-x-3">
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

          {/* Pick existing area or point */}
          <button
            title='Pick existing area or point'
            className={`px-3 py-2 border-1 border-yellow-500 text-yellow-500 text-sm rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ease-in-out duration-200 ${
              selectedButton === 'existingGeoRef' ? 'bg-yellow-100 text-yellow-500 border-yellow-500 border-2' : ''
            }`}
            onClick={() => handleButtonClick('existingGeoRef')}
          >
            <CursorArrowRaysIcon className="w-5 h-5 mr-2 inline" />
            Pick existing area or point
          </button>

          {/* Edit georeference */}

          {mode === 'edit' && 
            <button
              title={documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1 ? 'Disabled because the document is already associated with the entire municipality area' : 'Edit the actual georeference'}
              className={`px-3 py-1 border-1 border-orange-500 text-orange-500 text-sm rounded-full hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 transition ease-in-out duration-200 ${
                selectedButton === 'edit' ? 'bg-orange-100 text-orange-500 border-orange-500 border-2' : ''
                }
                ${
                  documentCoordinates.coordinates.length == 1 &&documentCoordinates.coordinates[0].municipality_area == 1
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
                `}
              onClick={() => handleButtonClick('edit')}
              disabled={documentCoordinates.coordinates[0].municipality_area == 1}
            >
              <PencilSquareIcon className="w-5 h-5 mr-2 inline" />
              Edit georeference
            </button>
          }

          <div className="flex items-center">
            <label
              htmlFor="municipal-area-checkbox"
              className={`relative inline-flex items-center ${
                documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              title={
                documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1
                  ? "Disabled because the document is already associated with the entire municipality area"
                  : ""
              }
            >
              <input
                type="checkbox"
                disabled={documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1}
                id="municipal-area-checkbox"
                checked={useMunicipalArea}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <span
                className={`w-11 h-6 rounded-full transition ${ documentCoordinates.coordinates.length == 1 &&
                  documentCoordinates.coordinates[0].municipality_area == 1
                    ? "bg-blue-500 opacity-50"
                    : "bg-gray-300 peer-checked:bg-blue-500"
                }`}
              ></span>
              <span
                className={`absolute left-1 top-1 w-4 h-4 rounded-full transition ${
                  documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1
                    ? "bg-white opacity-50 translate-x-5"  // Mantenere la posizione del cerchio
                    : "bg-white peer-checked:translate-x-5"
                }`}
              ></span>
            </label>

            <span className="ml-3 text-sm text-gray-600">The entire municipal area</span>
          </div>
        </div>
        <span className='text-sm text-gray-600 mt-1 mb-3 flex items-center'>
          {selectedButton && <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-500" />}
          {
            selectedButton === 'point' ? 'Click the "Draw a Marker" icon in the top-right corner to place a point on the map' :
            selectedButton === 'polygon' ? 'Click the "Draw a polygon" icon in the top-right corner to draw a polygon by selecting multiple points' :
            selectedButton === 'edit' ? 'Click the "Edit Georeference" icon in the top-right corner to modify the existing georeference' :
            selectedButton === 'existingGeoRef' ? 'Click on one of the points or areas on the map to reference the document to that area or point' :
            ''
          } 
        </span>
        <form className="flex flex-col flex-grow">
          {/* Mappa Leaflet */}
          <div  className={`relative w-full h-full mb-2 ${useMunicipalArea || selectedButton === null ? 'pointer-events-none opacity-50' : ''}`}>
            <MapContainer
              className={`relative w-full `}
              style={{ height: '100%' }}
            >
              <SetMapViewEdit
                setSelectedPosition={setSelectedPosition}
                geoJsonData={geoJsonData}
                selectedButton={selectedButton}
                useMunicipalArea={useMunicipalArea}
                documentCoordinates={documentCoordinates}
              />
              {selectedButton === 'existingGeoRef' && existingGeoRef.map((coordinateArray, index) => {
            if (coordinateArray.length === 1) {
              const { latitude, longitude } = coordinateArray[0];
              return (
                <Marker
                  key={index}
                  position={[latitude, longitude]}
                  eventHandlers={{
                    click: (e) => {
                      setSelectedPosition([new L.LatLng(latitude, longitude)]);
                      e.target
                         .bindPopup("You picked this marker!", {className: "custom-popup",closeButton: false,})
                         .openPopup(); // Open the popup
                    },
                  }}
                  icon={customIcon}
                  ref={(marker) => {
                    if (marker) {
                      const iconElement = marker.getElement();
                      if (iconElement) {
                        iconElement.style.opacity = selectedPosition && selectedPosition?.length > 1
                        ? "0.3" // If a polygon is clicked, dim all markers
                        : selectedPosition && selectedPosition?.length === 1 && !arraysEqual(selectedPosition,[new L.LatLng(latitude, longitude)])
                        ? "0.3"
                        : "1";
                      }
                    }
                  }}
                />
              );
            } else if (coordinateArray.length > 1) {
              const latLngs = coordinateArray.map(coord => new L.LatLng(coord.latitude, coord.longitude) );
              return (
                <Polygon
                  key={index}
                  positions={latLngs}
                  pathOptions={{
                    opacity: 
                    selectedPosition && selectedPosition?.length === 1 ? 0.3 // If a marker is clicked, dim all polygons
                      : selectedPosition && selectedPosition?.length > 1 && !arraysEqual(selectedPosition, latLngs)
                      ? 0.3 : 1,
                  }}
                  eventHandlers={{
                    click: (e) => {
                      setSelectedPosition(latLngs);
                      e.target
                      .bindPopup("You picked this polygon!", {className: "custom-popup",closeButton: false,})
                      .openPopup(); // Open the popup
                 },
                  }}
                />
              );
            }
            return null;
          })}
            </MapContainer>
          </div>

          {/* Bottoni Back e Update */}
          <div className="mt-1 flex justify-between">
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
              {mode == "edit" ? isLoading ? 'Updating...' : 'Update' : ''}
              {mode == "insert" ? isLoading ? 'Inserting...' : 'Insert' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};


export { ModalEditGeoreference };
