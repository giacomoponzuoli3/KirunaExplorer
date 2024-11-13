import {Button, Container, Modal} from "react-bootstrap"
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
    const [showAlert, setShowAlert] = useState(false); // alert state
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

    const handleDrawStart = (e: any) => {
      const { layerType } = e;
      //console.log(polygon);
      
      if ( layerType === 'marker') {
          mapRef.current?.eachLayer((layer) => {
              if (layer instanceof L.Marker || layer instanceof L.Polygon) {
                  mapRef.current?.removeLayer(layer);
              }
          });
          setMarkerPosition(null); // Reset marker position
          setPolygon([]);          // Reset polygon
      }else if(layerType === 'polygon'){
        console.log("tuka sun")
        mapRef.current?.eachLayer((layer) => { 
          if ( layer instanceof L.Polygon ||                 //can't only delete layer of instance markers because it intercepts
            (layer instanceof L.Marker && layer.options.isStandalone) //with some drawing tools and polygon drawing doesn't work then
          ) {                                                         //that's why we need to add standalone to destinguish them
              mapRef.current?.removeLayer(layer);
          }
        });
        setMarkerPosition(null); // Reset marker position
        setPolygon([]);          // Reset polygon
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

   
    return (
      <Modal size="lg" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
          <Modal.Header closeButton style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
            <Modal.Title id="example-modal-sizes-title-lg">Would u like to georeference the new document?</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
            <Container>
              {showAlert &&
                <Alert
                    message="Please fill in the mandatory fields marked with the red star (*)."
                    onClose={() => {
                        setShowAlert(false);
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
                
                {/* A button for the possibility of manually adding coordinates*/}
                <Button
                 style={{
                    position: 'absolute',
                    top: '260px',  // Adjust based on position under zoom controls
                    left: '40px', // Adjust for placement on map
                    zIndex: 1000,
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    
                 }}
                    variant={isEnterCoordinatesMode ? "primary" : "secondary"}
                    onClick={() => {
                      setIsEnterCoordinatesMode((prev) => !prev);
                    }}
                >
                    <i className="bi bi-card-text fs-8"></i>
                </Button>
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