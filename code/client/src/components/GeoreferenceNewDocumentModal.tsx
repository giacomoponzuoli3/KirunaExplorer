import {Button, Container, Form, Modal} from "react-bootstrap"
import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../API/API';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap,  Marker as LeafletMarker, MarkerProps, FeatureGroup } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, LatLngBounds, Icon, LeafletMouseEvent, LatLng, Layer } from 'leaflet'; // Import del tipo corretto
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

function SetMapView() {
    const map = useMap(); // Ottieni l'istanza della mappa
    
    const [zoomLevel, setZoomLevel] = useState(10); // Stato per il livello di zoom
  
    // Funzione per aggiornare dinamicamente il livello di zoom
    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setZoomLevel(Number(event.target.value));
    };
  
    // Coordinate di Kiruna, Svezia
    const position: LatLngTuple = [67.8558, 20.2253];
  
    const kirunaBounds = new LatLngBounds(
      [67.7758, 20.1003],  // Sud-ovest
      [67.9358, 20.3503]   // Nord-est
    );
  
  
    useEffect(() => {
      // Imposta la vista iniziale una sola volta senza fare reset durante lo zoom
      map.setView(position, 12);
  
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

      // Add click event listener to the map
      //map.on('click', onMapClick);
  
  
      // Pulizia dei listener e degli elementi aggiunti quando il componente viene smontato
      return () => {
       // map.off('click', onMapClick);
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
}

function GeoreferenceNewDocumentModal({ show, onHide, document, showAddNewDocumentLinks }: GeoreferenceNewDocumentModalProps) {
    
    const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
    const [isEnterCoordinatesMode, setIsEnterCoordinatesMode] = useState(false);
    const [polygon, setPolygon] = useState<LatLng[]>([]);
    const [wholeMapPolygon, setWholeMapPolygon] = useState<L.Polygon | null>(null); // Track the whole map polygon
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [alertMessage, setAlertMessage] = useState('');
    const drawControlRef = useRef<any>(null);
    const mapRef = useRef<L.Map>(null);

    const customIcon = new L.Icon({
        iconUrl: '/kiruna/img/marker.png',
        iconSize: [25, 41],  // Dimensioni dell'icona
        iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
        popupAnchor: [1, -34], // Punto da cui si apre il popup
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]  // Dimensioni dell'ombra
      });

    const resetForm = () => {
        setMarkerPosition(null);
        setPolygon([]);
        setWholeMapPolygon(null);
        setShowAlert(false);
    };

    const handleClose = () => {
        onHide();
        showAddNewDocumentLinks(document)
        resetForm();
    };

    const handleSubmit = async () => {
        //API call to georeference the document
        console.log(polygon);
        console.log(markerPosition);
        handleClose();
    };

    const clearOtherLayers = () => {
      mapRef.current?.eachLayer((layer) => { 
        if ( layer instanceof L.Polygon ||                 //can't only delete layer of instance markers because it intercepts
            (layer instanceof L.Marker && layer.options.isStandalone) //with some drawing tools and polygon drawing doesn't work then
        ) {                                                         //that's why we need to add standalone to destinguish them
            mapRef.current?.removeLayer(layer);
        }
      });
    };

    const handleDrawStart = (e: any) => {
      const { layerType } = e;
      
      if ( layerType === 'marker') {
          clearOtherLayers();
          setLatitude('');
          setLongitude('');
          setIsEnterCoordinatesMode(false);
          setMarkerPosition(null); // Reset marker position
          setPolygon([]);          // Reset polygon
          setWholeMapPolygon(null);
      }else if(layerType === 'polygon'){
        clearOtherLayers();
        setLatitude('');
        setLongitude('');
        setIsEnterCoordinatesMode(false);
        setMarkerPosition(null); // Reset marker position
        setPolygon([]);          // Reset polygon
        setWholeMapPolygon(null);
      }
    };

    const handleCreated = (e: any) => {
      const { layerType, layer } = e;

      if (layerType === 'marker') {
          layer.options.isStandalone = true;
          setMarkerPosition(layer.getLatLng());
      } 
      else if (layerType === 'polygon') {
          const latLngs = layer.getLatLngs()[0].map((latLng: L.LatLng) => ({
              lat: latLng.lat,
              lng: latLng.lng,
          }));
          setPolygon(latLngs);
          console.log(latLngs);
        }
    };

    // Function to handle selecting the whole map
    const handleSelectWholeMap = () => {
      if (!mapRef.current) return; // Ensure mapRef.current is not null
      
      // If the whole map polygon is already selected, remove it
      if (wholeMapPolygon) {
        mapRef.current.removeLayer(wholeMapPolygon);
        //setPolygon([]);
        setWholeMapPolygon(null); // Update state to reflect no selection
      } else {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
            // Get the corners of the current map view
            const northWest = bounds.getNorthWest();
            const northEast = bounds.getNorthEast();
            const southEast = bounds.getSouthEast();
            const southWest = bounds.getSouthWest();

            // Define a polygon that covers the map bounds
            const newPolygon = L.polygon([
                northWest,
                northEast,
                southEast,
                southWest,
            ]);

            // Clear any existing polygons or markers, if needed
            clearOtherLayers();

            // Save the coordinates of the whole map polygon
            setPolygon(newPolygon.getLatLngs()[0] as L.LatLng[]); // First array in LatLngs represents the outer boundary

            // Add the new polygon to the map
            newPolygon.addTo(mapRef.current);
            setWholeMapPolygon(newPolygon); // Update state to store the polygon
        }
      }
    };

    // Handle form submission or Enter key press
    const handleCoordinatesSubmit = (e: React.FormEvent) => {
      e.preventDefault(); // Prevent form submission
      const kirunaBounds = new LatLngBounds(
        [67.7758, 20.1003],  // Sud-ovest
        [67.9358, 20.3503]   // Nord-est
      );
      if (latitude.trim() !== '' && longitude.trim() !== '') {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
          
        if (!isNaN(lat) && !isNaN(lng)) {
          const newPosition = new L.LatLng(lat, lng);

          // Check if coordinates are within the bounds of Kiruna
          if (kirunaBounds.contains(newPosition)) {
            setMarkerPosition(newPosition);
            // Add the marker to the map (make sure mapRef is defined in your code)
            if (mapRef.current) {
                L.marker(newPosition,{isStandalone: true, icon: customIcon}).addTo(mapRef.current);
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
      }else{
        setShowAlert(true);
        setAlertMessage("Please enter coordinates");
      }
    };

   
    return (
      <Modal size="lg" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
          <Modal.Header closeButton style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
            <Modal.Title id="example-modal-sizes-title-lg">Would u like to georeference the new document?</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
            <Container>
              {showAlert &&
                <Alert
                    message= {alertMessage}
                    onClose={() => {
                      setShowAlert(false);
                      setAlertMessage('')
                    }}
                />
              }
              {/* Container to show the map */}
              <MapContainer  ref={mapRef} style={{ height: "100vh", width: "100%" }}>
                 <SetMapView />
                 
                 {/* Leaflet Draw control for polyline */}
                 <FeatureGroup>
                   <EditControl
                     ref={drawControlRef}
                     position="topright"
                     onDrawStart={handleDrawStart}
                     onCreated={handleCreated}
                     draw={{
                       rectangle: false,
                       circle: false,
                       circlemarker: false,
                       polygon: true,
                       marker: {
                        icon: customIcon
                       },
                       polyline: false,
                      }}
                    />
                  </FeatureGroup>
                </MapContainer>
                
                {/* A button for the possibility of selecting the whole area*/}
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

                {wholeMapPolygon && (
                 <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  zIndex: 1000,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  pointerEvents: "none" // Prevent interaction with the label
                 }}>
                  Selected area: The whole municipality of Kiruna
                 </div>
                )}
                <div>
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
                  <div style={{
                    position: 'absolute',
                    top: '235px',
                    right: '80px', // Position next to the button
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                  }}>
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
                </div> 
             </Container>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
            <Button variant="secondary" className="text-white rounded-md" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleSubmit} style={{ borderColor: 'white' }}>
              Submit
            </Button>
          </Modal.Footer>
      </Modal>
    );
}
export {GeoreferenceNewDocumentModal}