import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { useMap, MapContainer } from 'react-leaflet';
import { LatLngTuple, LatLngBounds} from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';
import 'leaflet.markercluster';
import { useParams } from 'react-router-dom';
import Alert from './Alert';
import geoJson from '../utility/KirunaMunicipality.json'

// Limiti della mappa per Kiruna
const kirunaBounds = new LatLngBounds(
  [67.790390, 20.416509],  // Sud-ovest
  [67.889194, 20.050656]   // Nord-est
);

const position: LatLngTuple = [67.8558, 20.2253];

// Funzione per convertire GeoJSON in un array di L.LatLng
function createCityCoordinates(geoJson: any): L.LatLng[] {
  const latLngs: L.LatLng[] = [];

  for (const feature of geoJson.features) {
    if (feature.geometry.type !== 'MultiPolygon') {
      continue;
    }

    feature.geometry.coordinates.forEach((polygon: any) =>
        polygon.forEach((ring: any) =>
            ring.forEach((coord: [number, number]) => {
              const latLng = L.latLng(coord[1], coord[0]); // [latitude, longitude]
              latLngs.push(latLng);
            })));
  }

  return latLngs;
}

const cityCoords = createCityCoordinates(geoJson);  // Ottieni le coordinate dell'area della città



//function that calculates the centre of polygon
function calculateCentroid(latLngs: [number, number][]): [number, number] {
  if(latLngs.length > 1){
    let centroidLat = 0;
    let centroidLng = 0;
    let signedArea = 0;
    
    for (let i = 0; i < latLngs.length; i++) {
      const [x0, y0] = latLngs[i];
      const [x1, y1] = latLngs[(i + 1) % latLngs.length];

      const a = x0 * y1 - x1 * y0;
      signedArea += a;

      centroidLat += (x0 + x1) * a;
      centroidLng += (y0 + y1) * a;
    }

    signedArea *= 0.5;
    centroidLat /= (6 * signedArea);
    centroidLng /= (6 * signedArea);

    return [centroidLat, centroidLng];
  }else{
    return latLngs[0];
  }
}


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


function SetMapViewHome(props: any) {
  const map = useMap();

  const [showPolygonMessage, setShowPolygonMessage] = useState(false);

  useEffect(() => {
    if (map.getZoom() === undefined) {
      map.setView(position, 7);
    }

    map.setMaxZoom(18);
    map.setMinZoom(2);
    //map.setMaxBounds(kirunaBounds);
    map.options.maxBoundsViscosity = 1.0;

    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: '&copy;' }
    ).addTo(map);

    const classicLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy;' }
    ).addTo(map);

    L.control.layers({ Classic: classicLayer, Satellite: satelliteLayer }, {}, { position: 'topleft' }).addTo(map);

    return () => {
      map.eachLayer((layer) => {
        if (layer !== satelliteLayer && layer !== classicLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map]);

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });
    
    // Inizializza un set per tenere traccia dei poligoni attivi
    const activePolygons: Set<L.Polygon> = new Set();

    const markersCluster = L.markerClusterGroup({
      maxClusterRadius: 25, // Raggio per il clustering generale
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        const samePoint = cluster
          .getAllChildMarkers()
          .every((marker) => marker.getLatLng().equals(cluster.getLatLng()));

        // Cluster per documenti nello stesso punto
        if (samePoint) {
          return L.divIcon({
            html: `
              <div class="cluster-icon flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-lg font-bold rounded-full border-1 border-red-800 shadow-lg hover:scale-110 transform transition duration-200 ease-out">
                ${childCount}
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: [20, 20],
          });
        }
    
        // Cluster standard per documenti vicini
        return L.divIcon({
          html: `
          <div class="cluster-icon flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white text-lg font-bold rounded-full border-1 border-blue-800 shadow-lg hover:scale-110 transform transition duration-200 ease-out">
          ${childCount}
        </div>
          `,
          className: 'custom-cluster-icon',
          iconSize: [20, 20],
        });
      },
    });
    

    // Rimuovi poligoni quando i marker vengono raggruppati in un cluster
    markersCluster.on('clusterclick', () => {
      setShowPolygonMessage(false)
      activePolygons.forEach((polygon) => polygon.removeFrom(map));
      activePolygons.clear();
    });

    // Listener per gestire il termine dell'animazione del clustering
    markersCluster.on('animationend', () => {
      setShowPolygonMessage(false)
      // Nascondi tutti i poligoni attualmente attivi
      activePolygons.forEach((polygon) => {
        polygon.removeFrom(map);
      });
      activePolygons.clear();
    });
    

    //for each Document
    props.documentsCoordinates
      .filter((d: DocCoordinates) => d.coordinates.length !== 0)
      .forEach((doc: any) => {
        const latLngs = doc.coordinates[0].municipality_area == 1 ? cityCoords.map((coord: any) => [coord.lat, coord.lng]) : doc.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

        if (latLngs.length > 1 || (doc.coordinates.length == 1 && doc.coordinates[0].municipality_area == 1) ) {
          
          const centralCoord = calculateCentroid(latLngs);
          //polygon of the document
          let relatedLayer: any;

          if (doc.coordinates[0].municipality_area == 1) {
            relatedLayer = L.geoJSON(props.geoJsonData, {
              style: {
                color: "#B22222",
                weight: 2,
                opacity: 0.8,
                fillColor: '#FFD700',
                fillOpacity: 0.2,
              },
              onEachFeature: (feature, layer) => {
                if (feature.properties) {
                  layer.bindPopup(`Municipality: ${feature.properties.pnm}`);
                }
              },
            });
            
          }else {
            relatedLayer = L.polygon(latLngs, {
              color: '#B22222',
              weight: 2,
              opacity: 0.8,
              fillColor: '#FFD700',
              fillOpacity: 0.2,
              smoothFactor: 2,
            });
          }
        
          const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);
  
          const marker = L.marker(centralCoord, {
            icon: L.divIcon({
              html: `
                <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
                  ${iconHtml}
                </div>
              `,
              iconSize: [20, 20],
              className: '',
            }),
          });
  
          marker.on('mouseover', () => {

            relatedLayer.addTo(map);
            
            activePolygons.add(relatedLayer);

            if (doc.coordinates[0].municipality_area == 1) {
              setShowPolygonMessage(true);  // Mostra il messaggio
            }
          });
  
          marker.on('mouseout', () => {
            relatedLayer.removeFrom(map);
            activePolygons.delete(relatedLayer);

            if (doc.coordinates[0].municipality_area == 1) {
              setShowPolygonMessage(false); //nascondi il messaggio
            }

          });
  
          marker.on('click', () => {
            props.onMarkerClick(doc);
          });

          // Aggiungi il marker al cluster
          markersCluster.addLayer(marker);

        } else {
          // Nel caso di documenti con una sola coordinata
          const coord = doc.coordinates[0];

          const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);

          const marker = L.marker([coord.latitude, coord.longitude], {
            icon: L.divIcon({
              html: `
                <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
                  ${iconHtml}
                </div>
              `,
              iconSize: [20, 20],
              className: '',
            })

          });

          const popup = L.popup({
            closeButton: false, // Disable the close button
            autoClose: false,   // Prevent automatic closing
            closeOnClick: false, // Prevent closing on click
            offset: [10, -5],   // Adjust the position above the marker
            className: "custom-popup"
          })
            .setLatLng([coord.latitude, coord.longitude]) // Set popup position to the marker's coordinates
            .setContent(`<p>Coordinates: ${decimalToDMS(coord.latitude)} ${coord.latitude >= 0 ? "N" : "S"} , ${decimalToDMS(coord.longitude)} ${coord.longitude >= 0 ? "E" : "W"}</p>`)

          marker.on('mouseover', () => {
              map.openPopup(popup)
              
          });
  
          marker.on('mouseout', () => {
            map.closePopup(popup);
            if(doc.coordinates[0].municipality_area == 1){
              setShowPolygonMessage(true);
            }
          });
  
          marker.on('click', () => {
            props.onMarkerClick(doc);
          });

          // Aggiungi il marker al cluster
          markersCluster.addLayer(marker);
        }
      });

      // Aggiungi il gruppo di cluster alla mappa
      map.addLayer(markersCluster);

  }, [props.documentsCoordinates]);
  
  
  
  return (
    <>
      {showPolygonMessage && (
        <div className="fixed top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-200 text-black text-sm px-2 py-1 rounded-md shadow-lg border">
          area: <strong>the entire municipality of Kiruna</strong>
        </div>
      )}
      {null}
    </>
  );
}


// Componente per la costruzione della mappa nel modal edit
function SetMapViewEdit(props: any) {
  const { setSelectedPosition, useMunicipalArea, selectedButton, documentCoordinates } = props;
  const map = useMap(); // Ottieni l'istanza della mappa

  // Icona personalizzata per il marker
  const defaultIcon = new L.Icon({
    iconUrl: '/img/marker.png',
    iconSize: [41, 41], // Dimensioni dell'icona
    iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
    popupAnchor: [1, -34], // Punto da cui si apre il popup
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41], // Dimensioni dell'ombra
  });

  //layer staellitare
  const satelliteLayer = L.tileLayer(
    'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    { attribution: '&copy; ' }
  );

  const drawnItems = new L.FeatureGroup(); // Gruppo di elementi disegnati
  let currentMarker: L.Marker | null = null;

  useEffect(() => {
    if (map.getZoom() === undefined) {
      map.setView(position, 10);
    }

    map.setMaxZoom(18);
    map.setMinZoom(3);
    //map.setMaxBounds(kirunaBounds);

    map.addLayer(drawnItems); // Aggiungi il gruppo alla mappa

    //add the polygon or point of the current document only if selected "edit"
    if (!documentCoordinates) return;

    const latLngs = documentCoordinates.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

    // Aggiungi poligono o punto dall'attuale documento
    if (documentCoordinates.coordinates.length === 1 && documentCoordinates.coordinates[0].municipality_area == 0) { //if it is a point
      const marker = L.marker(latLngs[0], {icon: defaultIcon});

      const popup = L.popup({
        closeButton: false, // Disable the close button
        autoClose: false,   // Prevent automatic closing
        closeOnClick: false, // Prevent closing on click
        offset: [10, -5],   // Adjust the position above the marker
        className: "custom-popup"
      })
          .setLatLng(latLngs[0]) // Set popup position to the marker's coordinates
          .setContent(`
            <p>
                Coordinates: ${decimalToDMS(latLngs[0][0])} ${latLngs[0][0] >= 0 ? "N" : "S"} , ${decimalToDMS(latLngs[0][1])} ${latLngs[0][1] >= 0 ? "E" : "W"}
            </p>
          `)

      marker.on('mouseover', () => {
        map.openPopup(popup)
      });

      marker.on('mouseout', () => {
        map.closePopup(popup);
      });

      marker.bindPopup(popup); // Associa il nuovo popup

      drawnItems.addLayer(marker);
      setSelectedPosition(); // Imposta la posizione selezionata
    } else {
      let polygon;

      if (documentCoordinates.coordinates.length > 1) {
        polygon = L.polygon(latLngs, {
          color: '#ff0000',
          weight: 3,
          opacity: 0.8,
          fillColor: '#3388ff',
          fillOpacity: 0.3,
        });
        drawnItems.addLayer(polygon);
      }
      if (documentCoordinates.coordinates.length == 1 && documentCoordinates.coordinates[0].municipality_area == 1) {
        polygon = L.geoJSON(props.geoJsonData, {
          style: {
            color: "#B22222",
            weight: 2,
            opacity: 0.8,
            fillColor: '#FFD700',
            fillOpacity: 0.2,
          },
          onEachFeature(feature, layer) {
            if (feature.properties) {
              layer.bindPopup(`Municipality: ${feature.properties.pnm}`);
            }
          },
        });
        drawnItems.addLayer(polygon);
      }
      // Converte latLngs in formato compatibile con setSelectedPosition
      const formattedCoordinates = latLngs.map(([latitude, longitude]: [number, number]) => ({
        lat: latitude,
        lng: longitude
      }));
      setSelectedPosition(formattedCoordinates); // Imposta le coordinate del poligono
    }


    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: selectedButton === 'point' ? { icon: defaultIcon } : false,
        polygon: selectedButton === 'polygon' ? {
          shapeOptions: {
            color: '#ff0000',
            weight: 3,
            opacity: 0.8,
            fillColor: '#3388ff',
            fillOpacity: 0.3,
          },
        } : false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems, // Gruppo modificabile
        remove: selectedButton != 'edit', // Abilita cancellazione solo se `edit` è selezionato
      },
    });

    map.addControl(drawControl);

    //event create
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer); // Aggiungi il nuovo elemento al gruppo
    
      // Quando viene aggiunto un nuovo elemento, rimuoviamo i vecchi elementi (marker o poligoni)
      drawnItems.eachLayer((existingLayer: any) => {
        if (existingLayer !== layer) {
          drawnItems.removeLayer(existingLayer); // Rimuovi tutti i layer tranne quello appena creato
        }
      });

      if (event.layerType === 'marker') {
        // Aggiungi il nuovo marker sulla mappa
        currentMarker = layer;

        layer.unbindPopup();

        layer.addTo(map);
        //popup of the coordinates 
        const popup = new L.Popup({
          closeButton: false, // Disable the close button
          autoClose: false,   // Prevent automatic closing
          closeOnClick: false, // Prevent closing on click
          offset: [10, -5],   // Adjust the position above the marker
          className: "custom-popup"
        })
          .setLatLng(layer.getLatLng()) // Set popup position to the marker's coordinates
          .setContent(`<p>Coordinates: ${decimalToDMS(layer.getLatLng().lat)} ${layer.getLatLng().lng >= 0 ? "N" : "S"} , ${decimalToDMS(layer.getLatLng().lng)} ${layer.getLatLng().lng >= 0 ? "E" : "W"}</p>`)
        
        layer.on('mouseover', () => {
            map.openPopup(popup)
        });

        layer.on('mouseout', () => {
          map.closePopup(popup);
        });

        layer.bindPopup(popup); // Associa il popup al marker
        setSelectedPosition([{ lat: layer.getLatLng().lat, lng: layer.getLatLng().lng }]);
      } else if (event.layerType === 'polygon') {
        // Ottenere le coordinate del poligono e verificare il tipo
        const latLngs = layer.getLatLngs();
        if (Array.isArray(latLngs) && Array.isArray(latLngs[0])) {
          const polygonCoordinates = (latLngs[0] as L.LatLng[]).map((latLng) => ({
            lat: latLng.lat,
            lng: latLng.lng,
          }));
          setSelectedPosition(polygonCoordinates); // Salva tutte le coordinate
        }
      }
    });
    
    //event edit
    map.on(L.Draw.Event.EDITED, (event: any) => {
      const layers = event.layers;
    
      // Rimuovi tutti i popup esistenti dalla mappa
      map.eachLayer((layer) => {
        if (layer instanceof L.Popup) {
          map.removeLayer(layer); // Elimina il popup dalla mappa
        }
      });

      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          const newPosition = layer.getLatLng();

          layer.unbindPopup(); // Elimina eventuali popup associati al marker

          console.log('Marker spostato a:', newPosition);
          
          //popup of the coordinates 
          const popup = new L.Popup({
            closeButton: false, // Disable the close button
            autoClose: false,   // Prevent automatic closing
            closeOnClick: false, // Prevent closing on click
            offset: [10, -5],   // Adjust the position above the marker
            className: "custom-popup"
          })
            .setLatLng(newPosition) // Set popup position to the marker's coordinates
            .setContent(`<p>Coordinates: ${decimalToDMS(newPosition.lat)} ${newPosition.lat >= 0 ? "N" : "S"} , ${decimalToDMS(newPosition.lng)} ${newPosition.lng >= 0 ? "E" : "W"}</p>`)

          layer.on('mouseover', () => {
              map.openPopup(popup)
          });

          layer.on('mouseout', () => {
            map.closePopup(popup);
          });

          layer.bindPopup(popup); // Associa il nuovo popup
          setSelectedPosition([{ lat: newPosition.lat, lng: newPosition.lng }]);
        } else if (layer instanceof L.Polygon) {
          const latLngs = layer.getLatLngs();
          if (Array.isArray(latLngs) && Array.isArray(latLngs[0])) {
            const newCoordinates = (latLngs[0] as L.LatLng[]).map((latLng) => ({
              lat: latLng.lat,
              lng: latLng.lng,
            }));
            console.log('Polygon aggiornato:', newCoordinates);
            setSelectedPosition(newCoordinates); // Salva le nuove coordinate
          }
        }
      });
    });
    
    //event delete
    map.on(L.Draw.Event.DELETED, (event: any) => {
      const layers = event.layers;

      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          console.log('Marker eliminato:', layer.getLatLng());
          setSelectedPosition(null);
        } else if (layer instanceof L.Polygon) {
          console.log('Polygon eliminato:', layer.getLatLngs());
          setSelectedPosition(null); // Nessuna posizione selezionata dopo l'eliminazione
        }
      });
    });
    
    satelliteLayer.addTo(map);

    return () => {
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.EDITED);
      map.off(L.Draw.Event.DELETED);

      map.removeLayer(drawnItems);
      map.removeControl(drawControl);
      map.removeLayer(satelliteLayer);
      map.removeControl(drawControl);
    };
  }, [map, setSelectedPosition, props.selectedButton, documentCoordinates]);

  useEffect(() => {

    if (useMunicipalArea) {
      map.doubleClickZoom.disable();
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polygon) {
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

  return null;
}



const SetViewDocumentCoordinates = (props: any) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    //get the coordinates
    const latLngs = props.documentCoordinates.coordinates[0].municipality_area == 1 ? cityCoords.map((coord: any) => [coord.lat, coord.lng]) : props.documentCoordinates.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);
    const centralCoord = calculateCentroid(latLngs);

    if (map.getZoom() === undefined) {
      map.setView(centralCoord, 7);
    }

    map.setMaxZoom(18);
    map.setMinZoom(3);
    //map.setMaxBounds(kirunaBounds);

    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
    );
    satelliteLayer.addTo(map);


    if(props.documentCoordinates.coordinates.length !== 0){
      //get the icon of the document
      const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(props.documentCoordinates.type, 5) || <></>);
      //get the coordinates
      const latLngs = props.documentCoordinates.coordinates[0].municipality_area == 1 ? cityCoords.map((coord: any) => [coord.lat, coord.lng]) : props.documentCoordinates.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

      const centralCoord = calculateCentroid(latLngs);

      //marker of the document
      const marker =  L.marker(centralCoord, {
        icon: L.divIcon({
          html: `
            <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
              ${iconHtml}
            </div>
          `,
          iconSize: [20, 20],
          className: '',
        }),
      }).addTo(map);

      if(props.documentCoordinates.coordinates.length === 1 && props.documentCoordinates.coordinates[0].municipality_area == 0){ //if it is a point

        //popup of the coordinates
        const popup = L.popup({
          closeButton: false, // Disable the close button
          autoClose: false,   // Prevent automatic closing
          closeOnClick: false, // Prevent closing on click
          offset: [10, -5],   // Adjust the position above the marker
          className: "custom-popup"
        })
          .setLatLng(centralCoord) // Set popup position to the marker's coordinates
          .setContent(`<p>Coordinates: ${decimalToDMS(centralCoord[0])} ${centralCoord[0] >= 0 ? "N" : "S"} , ${decimalToDMS(centralCoord[1])} ${centralCoord[1] >= 0 ? "E" : "W"}</p>`)

        marker.on('mouseover', () => {
          map.openPopup(popup)
        });

        marker.on('mouseout', () => {
          map.closePopup(popup);
        });

        marker.bindPopup(popup); // Associa il nuovo popup


      } else { //it is a polygon

        //polygon of the document
        let polygon: any;

        if (props.documentCoordinates.coordinates[0].municipality_area == 1) {
          polygon = L.geoJSON(props.geoJsonData, {
            style: {
              color: "#B22222",
              weight: 2,
              opacity: 0.8,
              fillColor: '#FFD700',
              fillOpacity: 0.2,
            },
            onEachFeature: (feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(`Municipality: ${feature.properties.pnm}`);
              }
            },
          }).addTo(map);

          props.setShowPolygonMessage(true);


        }else {
          polygon = L.polygon(latLngs, {
            color: '#B22222',
            weight: 2,
            opacity: 0.8,
            fillColor: '#FFD700',
            fillOpacity: 0.2,
            smoothFactor: 2,
          });
        }

        polygon.addTo(map);

      }

    }
  }, [map, position, kirunaBounds]);

  return null;
};

function MapView(props: any) {
  const { idDocument } = useParams(); 

  //set show message of polygon
  const [showPolygonMessage, setShowPolygonMessage] = useState<boolean>(false)

  //modal alert
  const [showAlert, setShowAlert] = useState<boolean>(false);

  //document Coordinates
  const [documentCoordinates, setDocumentCoordinates] = useState<DocCoordinates | null>(null);

  const position = [67.8558, 20.2253]; // Coordinate di esempio (Kiruna)

  const getDocument = async () => {
    try{
      if(idDocument){
        const doc = props.documentsCoordinates.filter((d: DocCoordinates) => d.id === Number(idDocument))
        setDocumentCoordinates(doc[0]);
      }
      
    }catch(err: any){
      setShowAlert(true);
    }
  }

  useEffect(() => {
    getDocument().then();
  }, []);

  
  return (
    <>
      {showAlert &&
        <Alert
            message="Sorry, something went wrong..."
            onClose={() => {
                setShowAlert(false);
            }}
        />
      }

      {documentCoordinates && 
        <div className="flex flex-col h-screen">
          <div className="flex-1">
            <MapContainer
              style={{ height: 'calc(100vh - 65px)', width: '100%' }}
            >
              <SetViewDocumentCoordinates position={position} documentCoordinates={documentCoordinates} getDocumentIcon={props.getDocumentIcon} geoJsonData={props.geoJsonData} setShowPolygonMessage={setShowPolygonMessage}/>
              {showPolygonMessage && (
                <div className="fixed top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-200 text-black text-sm px-2 py-1 rounded-md shadow-lg border">
                  area: <strong>the entire municipality of Kiruna</strong>
                </div>
              )}
            </MapContainer>
          </div>
        </div>
      }
    </>
  );
}


export {SetMapViewHome, SetMapViewEdit, cityCoords, MapView}
  