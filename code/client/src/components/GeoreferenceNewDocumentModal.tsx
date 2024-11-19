import {Button, Container, Form, Modal} from "react-bootstrap"
import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../API/API';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap,  Marker as LeafletMarker, MarkerProps, FeatureGroup } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, LatLngBounds, Icon, LeafletMouseEvent, LatLng, Layer, marker } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Alert from "./Alert";
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Extend the L.MarkerOptions type to include isStandalone
declare module 'leaflet' {
  interface MarkerOptions {
      isStandalone?: boolean;
  }
}

const customIcon = new L.Icon({
  iconUrl: '/img/marker.png',
  iconSize: [25, 41],  // Dimensioni dell'icona
  iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
  popupAnchor: [1, -34], // Punto da cui si apre il popup
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]  // Dimensioni dell'ombra
});
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

const kirunaBounds = new LatLngBounds(
  [67.7758, 20.1003],  // Sud-ovest
  [67.9358, 20.3503]   // Nord-est
);

interface SetMapViewInterface{
  resetForm: () => void;
  setMarkerPosition: (position: LatLng) => void;
  setPolygon: (polygon: LatLng[]) => void;
}
const featureGroup = new L.FeatureGroup();

function SetMapView({resetForm, setMarkerPosition, setPolygon}: SetMapViewInterface) {
    const map = useMap(); // Ottieni l'istanza della mappa
    
    const [zoomLevel, setZoomLevel] = useState(10); // Stato per il livello di zoom
  
    // Funzione per aggiornare dinamicamente il livello di zoom
    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setZoomLevel(Number(event.target.value));
    };
  
    // Coordinate di Kiruna, Svezia
    const position: LatLngTuple = [67.8558, 20.2253];


    // Create the EditControl manually
    const newDrawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        polygon: false,
        /*
        polygon: {
          shapeOptions: {
            color: '#3388ff', // Colore del bordo
            weight: 2,        // Spessore del bordo
            opacity: 0.8,     // Opacità del bordo
            fillColor: '#3388ff', // Colore di riempimento
            fillOpacity: 0.3, // Opacità del riempimento
            dashArray: '5,5', // Linea tratteggiata (opzionale)
          },
        },
        */
        marker: {
          icon: customIcon,
        },
        polyline: false,
      },
      edit: {
        featureGroup: featureGroup, // Group for editable layers
        remove: true, // Enable delete functionality
      },
    });

    const clearOtherLayers = () => {
      map.eachLayer((layer) => { 
        if ( layer instanceof L.Polygon ||                 //can't only delete layer of instance markers because it intercepts
            (layer instanceof L.Marker && layer.options.isStandalone) //with some drawing tools and polygon drawing doesn't work then
        )                                                             //that's why we need to add standalone to destinguish them
        {                                                         
            featureGroup.removeLayer(layer);
        }
      });
    };

    const handleDrawStart = (e: any) => {
          clearOtherLayers();
          resetForm();
    };

    const handleCreated = (e: any) => {
      const { layerType, layer } = e;

      if (layerType === 'marker') {
          layer.options.isStandalone = true;
          setMarkerPosition(layer.getLatLng());
      } 
      else if (layerType === 'polygon') {
          const latLngs = layer.getLatLngs()[0]
          setPolygon(latLngs);
          console.log(latLngs);
      }
      featureGroup.addLayer(layer);
    };

    const handleEdit = (e: any) => {
      // Iterate through each edited layer
      e.layers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker) {
          setMarkerPosition(layer.getLatLng());
          console.log("Edited marker:", layer.getLatLng());
        } else if (layer instanceof L.Polygon) {
          // Handle polygon edits
          const latLngs = (layer.getLatLngs() as LatLng[][])[0]
          setPolygon(latLngs);
          console.log("Edited polygon:", latLngs);
        }
      });
    }

    const handleDelete = (e: any) => {
      resetForm();
    }
  
  
    useEffect(() => {
      if (map.getZoom() === undefined) {
        map.setView(position, 12);
      }
  
      // Imposta i limiti di zoom
      map.setMaxZoom(16);
      map.setMinZoom(12);
  
      // Limita l'area visibile della mappa alla bounding box di Kiruna
      map.setMaxBounds(kirunaBounds);
  
      // Aggiungi il layer satellitare alla mappa
      const satelliteLayer = L.tileLayer(
        'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 
        { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
      );
      satelliteLayer.addTo(map);
      map.addLayer(featureGroup);

      // Add the EditControl to the map
      map.addControl(newDrawControl);

      // Bind event listeners for draw events
      map.on(L.Draw.Event.DRAWSTART, handleDrawStart); // For drawing start
      map.on(L.Draw.Event.CREATED, handleCreated); // For created shape (marker or polygon)
      map.on(L.Draw.Event.EDITED, handleEdit);
      map.on(L.Draw.Event.DELETED,handleDelete);
  
  
      // Pulizia dei listener e degli elementi aggiunti quando il componente viene smontato
      return () => {
        map.removeControl(newDrawControl);
        map.off(L.Draw.Event.DRAWSTART, handleDrawStart);
        map.off(L.Draw.Event.CREATED, handleCreated);
        map.off(L.Draw.Event.EDITED, handleEdit);
        map.off(L.Draw.Event.DELETED,handleDelete);
        map.removeLayer(satelliteLayer);
      };
    }, []); // Dipendenze vuote per assicurarsi che il codice venga eseguito solo una volta al montaggio

    
  
  return null
}

interface GeoreferenceNewDocumentModalProps {
    show: boolean;
    onHide: () => void;
    document: Document;
    showAddNewDocumentLinks: (doc: Document) => void;
    refreshDocumentsCoordinates: () => void;
}

function GeoreferenceNewDocumentModal({
  show,
  onHide,
  document,
  showAddNewDocumentLinks,
  refreshDocumentsCoordinates
}: GeoreferenceNewDocumentModalProps) {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [isEnterCoordinatesMode, setIsEnterCoordinatesMode] = useState(false);
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [wholeMapPolygon, setWholeMapPolygon] = useState<L.Polygon | null>(null); // Track the whole map polygon
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [showAlert, setShowAlert] = useState(false); // alert state
  const [alertMessage, setAlertMessage] = useState('');
  const mapRef = useRef<L.Map>(null);

  const resetForm = () => {
    setLatitude('');
    setLongitude('');
    setIsEnterCoordinatesMode(false);
    setMarkerPosition(null);
    setPolygon([]);
    setWholeMapPolygon(null);
    setShowAlert(false);
    setAlertMessage('');
  };

    const handleClose = () => {
        onHide();
        showAddNewDocumentLinks(document)
        clearOtherLayers();
        resetForm();
    };

  const handleSubmit = async () => {
    if (polygon.length === 0 && markerPosition !== null) {
      await API.setDocumentCoordinates(document.id, markerPosition);
    } else if (polygon.length !== 0 && markerPosition === null) {
      await API.setDocumentCoordinates(document.id, polygon);
    }
    refreshDocumentsCoordinates();
    handleClose();
  };

  const clearOtherLayers = () => {
    mapRef.current?.eachLayer((layer) => {
      if (
        layer instanceof L.Polygon || 
        (layer instanceof L.Marker && layer.options.isStandalone) 
      ) {
        featureGroup.removeLayer(layer);
      }
    });
  };

    // Function to handle selecting the whole map
    // Function to handle selecting the whole map
    const handleSelectWholeMap = () => {
      if (!mapRef.current) return; // Ensure mapRef.current is not null
      
      // If the whole map polygon is already selected, remove it
      if (wholeMapPolygon) {
        featureGroup.removeLayer(wholeMapPolygon);
        setWholeMapPolygon(null); // Update state to reflect no selection
      } else {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
            // Get the corners of the current map view
            const KnorthWest = kirunaBounds.getNorthWest();
            const KnorthEast = kirunaBounds.getNorthEast();
            const KsouthEast = kirunaBounds.getSouthEast();
            const KsouthWest = kirunaBounds.getSouthWest();

            const northWest = bounds.getNorthWest();
            const northEast = bounds.getNorthEast();
            const southEast = bounds.getSouthEast();
            const southWest = bounds.getSouthWest();

            // Define a polygon that covers the map bounds
            const newPolygon = L.polygon([
              [KsouthWest.lat, southWest.lng],
              [KnorthWest.lat, northWest.lng],
              [KnorthEast.lat, northEast.lng],
              [KsouthEast.lat, southEast.lng],
              [KsouthWest.lat, southWest.lng],
            ]);

            // Clear any existing polygons or markers, if needed
            clearOtherLayers();

            // Save the coordinates of the whole map polygon
            setPolygon(coordinatesCity); // First array in LatLngs represents the outer boundary

            // Add the new polygon to the map
            //newPolygon.addTo(mapRef.current);
            featureGroup.addLayer(newPolygon);
            setWholeMapPolygon(newPolygon); // Update state to store the polygon
        }
      }
    };

    // Handle form submission or Enter key press
    const handleCoordinatesSubmit = (e: React.FormEvent) => {
      e.preventDefault(); // Prevent form submission
      
      if (latitude.trim() !== '' && longitude.trim() !== '') {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
          
        if (!isNaN(lat) && !isNaN(lng)) {
          const newPosition = new L.LatLng(lat, lng);

        if (kirunaBounds.contains(newPosition)) {
          setMarkerPosition(newPosition);
          if (mapRef.current) {
            featureGroup.addLayer(L.marker(newPosition, { isStandalone: true, icon: customIcon }));
            setIsEnterCoordinatesMode(false);
            setLatitude('');
            setLongitude('');
          }
        } else {
          setShowAlert(true);
          setAlertMessage("Coordinates are out of bounds for Kiruna.");
        }
      } else {
        setShowAlert(true);
        setAlertMessage("Invalid coordinates entered");
      }
    } else {
      setShowAlert(true);
      setAlertMessage("Please enter coordinates");
    }
  };

  useEffect(() => {
    if (show && mapRef.current) {
      // Trigger a re-render of the map when modal is shown
      mapRef.current.invalidateSize();
    }
  }, [show]); // Trigger this when the modal visibility (`show`) changes

  return (
    <Modal 
      size="xl" 
      aria-labelledby="example-modal-sizes-title-lg"
      show={show} 
      onHide={handleClose} 
    >
      <Modal.Header closeButton className="bg-gray-100">
        <Modal.Title id="example-modal-sizes-title-lg" className="text-2xl font-bold text-gray-800">
          Would you like to georeference the new document?
        </Modal.Title>
      </Modal.Header>

      <Modal.Body 
        className="bg-white overflow-auto relative h-[calc(100vh-200px)]" // Prevent vertical scrollbar, ensure content fits
      >
        <Container>
          {showAlert && (
            <Alert
              message={alertMessage}
              onClose={() => {
                setShowAlert(false);
                setAlertMessage('');
              }}

            />
          )}

          <p className="text-sm text-gray-600 mt-2">
            This step is optional. You can skip it if you don't wish to georeference the document at this time.
          </p>

          {/* Map Container */}
          <MapContainer 
            ref={mapRef} 
            style={{ height: "calc(100vh - 250px)", width: "100%" }} // Ensure the map takes available height
          >
            <SetMapView
              resetForm={resetForm} 
              setMarkerPosition={(position: LatLng) => setMarkerPosition(position)}
              setPolygon={(polygon: LatLng[]) => setPolygon(polygon)}
            />
          </MapContainer>

          {/* Button for selecting whole area */}
          <Button title="Select the whole area"
            style={{
              position: 'absolute',
              top: '200px',  // Adjust based on position under zoom controls
              right: '40px', // Adjust for placement on map
              zIndex: 1000,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              
            }}
            variant={wholeMapPolygon ? "primary" : "secondary"}
            onClick={() => {
                setLatitude('');
                setLongitude('');
                setPolygon([])
                setMarkerPosition(null);
                setIsEnterCoordinatesMode(false);
                handleSelectWholeMap();
            }}
          >
            <i className="bi bi-arrows-fullscreen fs-8"></i>
          </Button>

          {/* Display the selected area label */}
          {wholeMapPolygon && (
            <div 
              className="absolute top-1/2 left-1/2 z-[1002] transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-lg pointer-events-none"
            >
              Selected area: The whole municipality of Kiruna
            </div>
          )}

          {/* A button for the possibility of manually adding coordinates*/}
          <Button title="Enter coordinates"
            style={{
            position: 'absolute',
            top: '235px',  // Adjust based on position under zoom controls
            right: '40px', // Adjust for placement on map
            zIndex: 1000,
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',   
            }}
            variant={isEnterCoordinatesMode ? "primary" : "secondary"}
            onClick={() => {
              setLatitude('');
              setLongitude('');
              setWholeMapPolygon(null)
              setPolygon([])
              setMarkerPosition(null);
              setIsEnterCoordinatesMode((prev) => !prev);
              clearOtherLayers();
            }}
          >
            <i className="bi bi-card-text fs-8"></i>
          </Button>

          {/* Coordinates input form */}
          {isEnterCoordinatesMode && (
            <div 
              className="absolute top-36 right-24 z-[1002] flex flex-col bg-white p-4 rounded-lg shadow-lg"
            >
              <Form onSubmit={handleCoordinatesSubmit}>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit">Place Marker</Button>
              </Form>
            </div>
          )}
        </Container>
      </Modal.Body>

      <Modal.Footer className="bg-gray-100 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={handleClose}
          >
            Skip
          </button>
          <button
            className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
            onClick={handleSubmit}
          >
            Next
          </button>
        </Modal.Footer>
    </Modal>

  );
}

export {GeoreferenceNewDocumentModal}