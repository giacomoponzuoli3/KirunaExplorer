import {Button, Col, Form, Row} from "react-bootstrap"
import React, { useState, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from "react";
import { MapContainer, Marker, Polygon, useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, LatLng } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Alert from "./Alert";
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { decimalToDMS } from '../utility/utilities'
import API from "../API/API";
import Coordinate from "../models/coordinate";
import {CursorArrowRaysIcon} from '@heroicons/react/24/solid'

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

const popup = L.popup({
  closeButton: false, // Disable the close button
  autoClose: false,   // Prevent automatic closing
  closeOnClick: false, // Prevent closing on click
  offset: [10, -5],   // Adjust the position above the marker
  className: "custom-popup"
})

const kirunaBounds = new LatLngBounds(
  [67.3556, 17.8994],  // Sud-ovest
  [69.0592, 23.2858]   // Nord-est
);

const DMSStringToDecimal = (dmsString: string, regex : RegExp) => {
  // Regular expression to match DMS format: "57° 24' 4''"
  const match = dmsString.match(regex);
  
  if (match) {
    const degrees = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const direction = match[4];
    
    // Convert DMS to decimal degrees
    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    
    // Adjust for direction (N/S/E/W)
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;  // Make negative for South or West
    }
    
    return decimal;
  } else {
    return null;
  }
};

interface SetMapViewInterface{
  resetForm: () => void;
  setCoordinates: (position: LatLng | LatLng[]) => void;
}
const featureGroup = new L.FeatureGroup();

function SetMapView({resetForm, setCoordinates}: SetMapViewInterface) {
    const map = useMap(); // Ottieni l'istanza della mappa

    // Coordinate di Kiruna, Svezia
    const position: LatLngTuple = [67.8558, 20.2253];

    // Create the EditControl manually
    const newDrawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
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
            map.removeLayer(layer);
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
          setCoordinates(layer.getLatLng());
          
          popup
            .setLatLng(layer.getLatLng()) // Set popup position to the marker's coordinates
            .setContent(
              `<p>Coordinates: 
                ${decimalToDMS(layer.getLatLng().lat)} ${layer.getLatLng().lat >= 0 ? "N" : "S"}, 
                ${decimalToDMS(layer.getLatLng().lng)} ${layer.getLatLng().lng >= 0 ? "E" : "W"}
              </p>`
            );
            layer.bindPopup(popup);
          layer.on('mouseover', () => {
            map.openPopup(popup)
          });
  
          layer.on('mouseout', () => {
              map.closePopup(popup)
          });
      } 
      else if (layerType === 'polygon') {
          const latLngs = layer.getLatLngs()[0]
          setCoordinates(latLngs);
          console.log(latLngs);
      }
      featureGroup.addLayer(layer);
    };

    const handleEdit = (e: any) => {
      // Iterate through each edited layer
      e.layers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker) {
          setCoordinates(layer.getLatLng());
          popup
            .setLatLng(layer.getLatLng()) // Update the popup's position
            .setContent(
              `<p>Coordinates: 
                ${decimalToDMS(layer.getLatLng().lat)} ${layer.getLatLng().lat >= 0 ? "N" : "S"}, 
                ${decimalToDMS(layer.getLatLng().lng)} ${layer.getLatLng().lng >= 0 ? "E" : "W"}
              </p>`
            ); // Update popup content

        } else if (layer instanceof L.Polygon) {
          // Handle polygon edits
          const latLngs = (layer.getLatLngs() as LatLng[][])[0]
          setCoordinates(latLngs);
          console.log("Edited polygon:", latLngs);
        }
      });
    }

    const handleDelete = (e: any) => {
      clearOtherLayers()
      resetForm();
    }
  
  
    useEffect(() => {
      if (map.getZoom() === undefined) {
        map.setView(position, 10);
      }
  
      map.setMaxZoom(18);
      map.setMinZoom(3);
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
    setMode: (mode: string) => void;
    setNewDocumentCoordinates: (coordinates: LatLng | LatLng[] | null) => void;
    handleNextStep: () => void;
    handlePrevStep: () => void;
}

function GeoreferenceNewDocumentModal({setMode,setNewDocumentCoordinates, handleNextStep, handlePrevStep}: GeoreferenceNewDocumentModalProps) {
  const [isEnterCoordinatesMode, setIsEnterCoordinatesMode] = useState(false);
  const [isPickExistingMode, setIsPickExistingMode] = useState(false);
  const [isInfoMode, setIsInfoMode] = useState(false);

  const [existingGeoRef,setExistingGeoRef] = useState<Coordinate[][]>([])
  const [coordinates, setCoordinates] = useState<LatLng | LatLng[] | null>(null);
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
    setIsPickExistingMode(false);
    setIsInfoMode(false);
    setCoordinates(null);
    setWholeMapPolygon(null);
    setShowAlert(false);
    setAlertMessage('');
  };

    const handleClose = () => {
        clearOtherLayers();
        resetForm();
    };

  const handleSubmit = async () => {
    setNewDocumentCoordinates(coordinates! || []);
    handleClose();
    setMode('links');
    handleNextStep();
  };

  const clearOtherLayers = () => {
    mapRef.current?.eachLayer((layer) => {
      if (
        layer instanceof L.Polygon || 
        (layer instanceof L.Marker && layer.options.isStandalone) 
      ) {
        featureGroup.removeLayer(layer);
        mapRef.current?.removeLayer(layer);
      }
    });
  };

    // Function to handle selecting the whole map
    const handleSelectWholeMap = () => {
      if (!mapRef.current) return; // Ensure mapRef.current is not null
      
      // If the whole map polygon is already selected, remove it
      if (wholeMapPolygon) {
        //featureGroup.removeLayer(wholeMapPolygon);
        mapRef.current?.removeLayer(wholeMapPolygon);
        setWholeMapPolygon(null); // Update state to reflect no selection
      } else {
        const bounds = mapRef.current.getBounds();
        if (bounds) {

          // Define the entire world as the outer boundary
          const worldCoordinates: LatLngTuple[] = [
           [-90, -180], // Bottom-left corner of the world
           [-90, 180],  // Bottom-right corner of the world
           [90, 180],   // Top-right corner of the world
           [90, -180],  // Top-left corner of the world
           [-90, -180], // Closing the loop
          ];

           const newPolygon = L.polygon(worldCoordinates);


            // Clear any existing polygons or markers, if needed
            clearOtherLayers();

            // Save the coordinates of the whole map polygon
            setCoordinates([]); // First array in LatLngs represents the outer boundary

            // Add the new polygon to the map
            newPolygon.addTo(mapRef.current);
            //featureGroup.addLayer(newPolygon);
            setWholeMapPolygon(newPolygon); // Update state to store the polygon
        }
      }
    };

    // Handle form submission or Enter key press
    const handleCoordinatesSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        console.log(latitude.trim().replace(/\s+/g, ''));
        console.log(longitude.trim().replace(/\s+/g, ''))

        if (latitude.trim() == '' || longitude.trim() == '') {
            setShowAlert(true);
            setAlertMessage("Please enter coordinates");

            return
        }

        const regexLat = /(\d{1,2}(?:\.\d+)?)°(\d{1,2}(?:\.\d+)?)'(\d{1,2}(?:\.\d+)?)''([NS])$/;
        const regexLng = /(\d{1,3}(?:\.\d+)?)°(\d{1,2}(?:\.\d+)?)'(\d{1,2}(?:\.\d+)?)''([EW])$/;

        const lat = DMSStringToDecimal(latitude.trim().replace(/\s+/g, ''),regexLat)
        const lng = DMSStringToDecimal(longitude.trim().replace(/\s+/g, ''),regexLng)
        console.log("Latitude: " + lat)
        console.log("Longitude: " + lng)

        if (!(lat && lng)) {
            setShowAlert(true);
            setAlertMessage("Invalid coordinates entered. The format should be: DMS (° ' '') with direction (N/S/E/W).");

            return;
        }

        const newPosition = new L.LatLng(lat, lng);

        if (!kirunaBounds.contains(newPosition)) {
            setShowAlert(true);
            setAlertMessage("Coordinates are out of bounds for Kiruna.");

            return;
        }

        setCoordinates(newPosition);
        if (mapRef.current) {
            const marker = L.marker(newPosition, { isStandalone: true, icon: customIcon }); // Create marker
            featureGroup.addLayer(marker); // Add marker to the feature group
            popup
                .setLatLng(newPosition) // Set popup position to the marker's coordinates
                .setContent(
                    `<p>Coordinates: 
                  ${decimalToDMS(newPosition.lat)} ${newPosition.lat >= 0 ? "N" : "S"}, 
                  ${decimalToDMS(newPosition.lng)} ${newPosition.lng >= 0 ? "E" : "W"}
                </p>`
                );

            marker.bindPopup(popup);

            marker.on('mouseover', () => {
                mapRef.current?.openPopup(popup)
            });

            marker.on('mouseout', () => {
                mapRef.current?.closePopup(popup);
            });
            setIsEnterCoordinatesMode(false);
            setLatitude('');
            setLongitude('');
        }
  };


  const arraysEqual = (arr1: L.LatLng[], arr2: L.LatLng[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((point, index) =>
      point.equals(arr2[index])
    );
  };

  function calculateArea(latLngs: LatLng[]) {
    let area = 0;
  
    for (let i = 0; i < latLngs.length; i++) {
      const p1 = latLngs[i];
      const p2 = latLngs[(i + 1) % latLngs.length]; // Wrap around
      area += (p2.lng - p1.lng) * (p2.lat + p1.lat);
    }
  
    return Math.abs(area / 2);
  }

  const getExistingAreasAndPoints = async () => {
    try {
        const allGeoRef: Coordinate[][] = await API.getExistingGeoreferences();
        const sortedGeoRef: Coordinate[][] = allGeoRef
        .map((coordinateArray) => {
          if (coordinateArray.length > 1) {
            const latLngs = coordinateArray.map(coord => new L.LatLng(coord.latitude, coord.longitude));
            const area = calculateArea(latLngs);
            return { coordinates: coordinateArray, area }; // Add area for sorting
          }
          return { coordinates: coordinateArray, area: 0 }; // Mark single points with area 0
        })
        .sort((a, b) => b.area - a.area) // Sort smallest to largest
        .map(({ coordinates }) => coordinates); // Extract only the coordinates
        console.log(sortedGeoRef)
        setExistingGeoRef(sortedGeoRef);
    } catch (err: any) {
        console.log(err);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      // Trigger a re-render of the map when modal is shown
      mapRef.current.invalidateSize();
    }
    getExistingAreasAndPoints().then();
  }, []); // Trigger this when the modal visibility (`show`) changes

  return (
        <>
        <div className="flex-grow">
          {showAlert && (
            <Alert
              message={alertMessage}
              onClose={() => {
                setShowAlert(false);
                setAlertMessage('');
              }}

            />
          )}

          <label className="text-sm text-gray-600 mt-2 p-2"
          style={{
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: "#A7C7E7"
          }}>
            If u need more information on how to <b style={{ marginLeft: '4px' }}>select a point</b>,
            <b style={{ marginLeft: '4px' }}>draw an area</b>, 
            <b style={{ marginLeft: '4px', marginRight: '4px' }}>pick the whole area </b> 
            or <b style={{ marginLeft: '4px', marginRight: '4px'}}>enter coordinates</b>, 
            click on the <b style={{ marginLeft: '4px' }}> Info Button</b>
            <i className="bi bi-info-square fs-8" style={{ marginLeft: '4px' }}></i>
          </label>

          {/* Map Container */}
          <MapContainer ref={mapRef} style={{ height: "65vh",width: "100%"}}
          >
            <SetMapView
              resetForm={resetForm} 
              setCoordinates={(position: LatLng | LatLng[]) => setCoordinates(position)}
            />
            {isPickExistingMode && existingGeoRef.map((coordinateArray, index) => {
            if (coordinateArray.length === 1) {
              const { latitude, longitude } = coordinateArray[0];
              return (
                <Marker
                  key={index}
                  position={[latitude, longitude]}
                  eventHandlers={{
                    click: (e) => {
                      setCoordinates(new L.LatLng(latitude, longitude));
                      e.target
                         .bindPopup("You picked this point!", {className: "custom-popup",closeButton: false,})
                         .openPopup(); // Open the popup
                    },
                  }}
                  icon={customIcon}
                  ref={(marker) => {
                    if (marker) {
                      const iconElement = marker.getElement();
                      if (iconElement) {
                        iconElement.style.opacity = coordinates instanceof Array
                        ? "0.3" // If a polygon is clicked, dim all markers
                        : coordinates instanceof L.LatLng && !coordinates.equals(new L.LatLng(latitude, longitude))
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
                    coordinates instanceof L.LatLng
                                  ? 0.3 // If a marker is clicked, dim all polygons
                                  : coordinates instanceof Array && !arraysEqual(coordinates, latLngs)
                                  ? 0.3
                                  : 1,
                    fillColor: coordinates instanceof Array && arraysEqual(coordinates, latLngs) ? "yellow" : "", // Default fill color
                  }}
                  eventHandlers={{
                    click: (e) => {
                      setCoordinates(latLngs);
                      e.target
                      .bindPopup("You picked this area!", {className: "custom-popup",closeButton: false,})
                      .openPopup(); // Open the popup
                      L.DomEvent.stopPropagation(e); // Stop propagation to larger areas
                    },
                  }}
                />
              );
            }
            return null;
          })}
          </MapContainer>

          {/* Button for selecting whole area */}
          <Button title="Select the whole area"
            style={{
              position: 'absolute',
              top: '265px',  // Adjust based on position under zoom controls
              right: '28px', // Adjust for placement on map
              zIndex: 1000,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: wholeMapPolygon ? "#0d6efd" : "white", 
              color: wholeMapPolygon ? "white" : "#4a4a4a", // Text color adjusts based on mode   
              borderColor: wholeMapPolygon ? "#0d6efd" : "black",
              
            }}
            onClick={() => {
                setIsInfoMode(false);
                setIsPickExistingMode(false);
                setLatitude('');
                setLongitude('');
                setCoordinates([]);
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
            top: '300px',  // Adjust based on position under zoom controls
            right: '28px', // Adjust for placement on map
            zIndex: 1000,
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isEnterCoordinatesMode ? "#0d6efd" : "white", 
            color: isEnterCoordinatesMode ? "white" : "#4a4a4a", // Text color adjusts based on mode   
            borderColor: isEnterCoordinatesMode ? "#0d6efd" : "black",
            }}
            onClick={() => {
              setIsInfoMode(false);
              setIsPickExistingMode(false);
              setLatitude('');
              setLongitude('');
              setWholeMapPolygon(null)
              setCoordinates(null);
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
            <p className="text-sm text-gray-600 mt-2">
             Note: Enter coordinates in DMS (° ' '') with direction (N/S/E/W).
            </p> 
              <Form onSubmit={handleCoordinatesSubmit}>
                <Form.Group as={Row} className="mb-2">
                  <Form.Label column sm="3">
                     Latitude
                  </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    placeholder="e.g., 67° 51' 27'' N"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2">
                 <Form.Label column sm="3">
                     Longitude
                  </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    placeholder="e.g., 20° 12' 24'' E"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                  </Col>
                </Form.Group>
                <Button type="submit">Place Marker</Button>
              </Form>
            </div>
          )}

          {/* A button for the possibility of choosing an existing area or point*/}
          <Button title="Pick existing area or point"
            style={{
            position: 'absolute',
            top: '335px',  // Adjust based on position under zoom controls
            right: '28px', // Adjust for placement on map
            zIndex: 1000,
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isPickExistingMode ? "#0d6efd" : "white", 
            color: isPickExistingMode ? "white" : "#4a4a4a", // Text color adjusts based on mode   
            borderColor: isPickExistingMode ? "#0d6efd" : "black",
            padding: 0
            }}
            onClick={() => {
              setIsInfoMode(false);
              setIsPickExistingMode((prev) => !prev);
              setLatitude('');
              setLongitude('');
              setWholeMapPolygon(null)
              setCoordinates(null);
              setIsEnterCoordinatesMode(false);
              clearOtherLayers();
            }}
          >
            <CursorArrowRaysIcon className="h-5 w-5"/>
          </Button>

          {/** Info button */}
          <Button title="Info"
            style={{
            position: 'absolute',
            top: '200px',  // Adjust based on position under zoom controls
            left: '30px', // Adjust for placement on map
            zIndex: 1000,
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',   
            }}
            variant={isInfoMode ? "primary" : "secondary"}
            onClick={() => {
              setLatitude('');
              setLongitude('');
              setIsEnterCoordinatesMode(false);
              setIsInfoMode(!isInfoMode)
            }}
          >
            <i className="bi bi-info-square fs-8"></i>
          </Button>

          {/* Coordinates input form */}
          {isInfoMode && (
            <div 
              className="absolute top-36 left-24 z-[1002] flex flex-col bg-white p-4 rounded-lg shadow-lg"
            >

            <h3 className="text-lg font-semibold mb-2">Map Control Information</h3>
            <ul className="list-disc pl-4 text-sm text-gray-600">
            <li>
            <i className="bi bi-info-square fs-8"></i>
            <strong> Info Button:</strong> Toggles this info panel.
            </li>
            <li>
              <i className="bi bi-geo-alt-fill fs-8"></i>
              <strong> Draw a Marker Button:</strong> Lets you select a
              specific coordinate on the map by placing a point.
            </li>
            <li>
              <i className="bi bi-pentagon-fill fs-8"></i>
              <strong> Draw a Polygon Button:</strong> Enables drawing a custom area on the map.
            </li>
            <li>
              <i className="bi bi-arrows-fullscreen fs-8"></i>
              <strong> Select the whole area Button:</strong> Gives you the option to
               select the whole municipality of Kiruna.
            </li>
            <li>
              <i className="bi bi-card-text fs-8"></i>
              <strong> Enter Coordinates Button:</strong> Allows you to input
              latitude and longitude to place a point on the map.
            </li>
            <li>
              <CursorArrowRaysIcon className="h-4 w-4 inline"/>
              <strong> Pick existing area or point button:</strong> When clicking this button 
              all the existing areas and points <br/> will be shown on the map.
              You can pick an existing area or point by clicking on it.
            </li>
            <li>
              <i className="bi bi-pencil-square fs-8"></i>
              <strong> Edit Layers Button:</strong> Lets you edit the point or the area you drew on the map.
            </li>
            <li>
            <i className="bi bi-trash3 fs-8"></i>
              <strong> Delete Layers Button:</strong> Allows you to delete the point or the area you drew on the map.
            </li>
            </ul>  
            </div>
          )}
        </div>

            <div className="flex justify-end space-x-4">
                <p className="text-sm text-gray-600 mt-2">This step is optional. If you skip it, the document will be assigned to the entire Kiruna municipality.</p>
                <button
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                    onClick={() => {
                        setMode('resources');
                        handlePrevStep();
                    }}
                >
                    Back
                </button>
                <button
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
                    onClick={handleSubmit}
                >
                    Next
                </button>
            </div>
        </>

  );
}

export {GeoreferenceNewDocumentModal}