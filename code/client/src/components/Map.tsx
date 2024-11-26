import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { useMap, MapContainer } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions, map, polygon, Polygon, popup } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';
import 'leaflet.markercluster';
import { useParams } from 'react-router-dom';
import Alert from './Alert';
import API from '../API/API';

//coordinates of Kiruna Town Hall
const kiruna_town_hall: LatLngTuple = [67.8558, 20.2253];

// Limiti della mappa per Kiruna
const kirunaBounds = new LatLngBounds(
  [67.790390, 20.416509],  // Sud-ovest
  [67.889194, 20.050656]   // Nord-est
);

const position: LatLngTuple = [67.8558, 20.2253];

function createCityCoordinates(): L.LatLng[] {
  return [
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
}

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

// Funzione che verifica se le coordinate di un documento sono dentro l'area definita
function isPolygonMunicipal(coordinates: any[]): boolean {
  const cityCoords = createCityCoordinates();  // Ottieni le coordinate dell'area della città

  // Verifica se tutte le coordinate del documento sono all'interno dell'area
  return coordinates.every((coord: any) => {
    // Confronta ogni coordinata con quelle dell'area della città
    return cityCoords.some((cityCoord: L.LatLng) => 
      cityCoord.lat === coord.latitude && cityCoord.lng === coord.longitude
    );
  });
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
      map.setView(position, 12);
    }

    map.setMaxZoom(18);
    map.setMinZoom(12);
    map.setMaxBounds(kirunaBounds);
    map.options.maxBoundsViscosity = 1.0;

    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
    ).addTo(map);

    const classicLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
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
        const latLngs = doc.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);
  
        if (latLngs.length > 1) {
          const relatedLayer: L.Polygon = L.polygon(latLngs, {
            color: '#B22222',
            weight: 2,
            opacity: 0.8,
            fillColor: '#FFD700',
            fillOpacity: 0.2,
            smoothFactor: 2,
          });
  
          const centralCoord = calculateCentroid(latLngs);; // Punto centrale del poligono
  
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

            if (isPolygonMunicipal(doc.coordinates)) {
              setShowPolygonMessage(true);  // Mostra il messaggio
            }
          });
  
          marker.on('mouseout', () => {
            relatedLayer.removeFrom(map);
            activePolygons.delete(relatedLayer);

            if (isPolygonMunicipal(doc.coordinates)) {
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
  const { setSelectedPosition, useMunicipalArea } = props;
  const map = useMap(); // Ottieni l'istanza della mappa

  // Icona personalizzata per il marker
  const defaultIcon = new L.Icon({
    iconUrl: '/img/marker.png',
    iconSize: [41, 41],  // Dimensioni dell'icona
    iconAnchor: [12, 41], // Punto di ancoraggio dell'icona
    popupAnchor: [1, -34], // Punto da cui si apre il popup
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]  // Dimensioni dell'ombra
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


const SetViewDocumentCoordinates = (props: any) => {
  const map = useMap();

  console.log(props.documentCoordinates.coordinates);

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    if (map.getZoom() === undefined) {
      map.setView(position, 12);
    }

    map.setMaxZoom(18);
    map.setMinZoom(3);
    map.setMaxBounds(kirunaBounds);

    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>' }
    );
    satelliteLayer.addTo(map);
    

    if(props.documentCoordinates.coordinates.length !== 0){
      //get the icon of the document
      const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(props.documentCoordinates.type, 5) || <></>);
      //get the coordinates
      const latLngs = props.documentCoordinates.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

      // centre point of the polygon/point
      const centralCoord = calculateCentroid(latLngs);

      //marker of the document
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
      }).addTo(map);

      if(props.documentCoordinates.coordinates.length === 1){ //if it is a point
        
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


      } else { //it is a polygon

        //polygon of the document
        L.polygon(latLngs, {
          color: '#B22222',
          weight: 2,
          opacity: 0.8,
          fillColor: '#FFD700',
          fillOpacity: 0.2,
          smoothFactor: 2,
          interactive: false
        }).addTo(map);
      }
      
    }


  }, [map, position, kirunaBounds]);

  return null;
};

function MapView(props: any) {
  const { idDocument } = useParams(); 

  //modal alert
  const [showAlert, setShowAlert] = useState<boolean>(false);

  //document Coordinates
  const [documentCoordinates, setDocumentCoordinates] = useState<DocCoordinates | null>(null);

  const position = [67.8558, 20.2253]; // Coordinate di esempio (Kiruna)

  const getDocument = async () => {
    try{
      if(idDocument){
        console.log("id: "+ idDocument )
        const doc = props.documentsCoordinates.filter((d: DocCoordinates) => d.id === Number(idDocument))
        setDocumentCoordinates(doc[0]);
        console.log(doc);
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
              <SetViewDocumentCoordinates position={position} documentCoordinates={documentCoordinates} getDocumentIcon={props.getDocumentIcon}/>
            </MapContainer>
          </div>
        </div>
      }
    </>
  );
};


export {SetMapViewHome, SetMapViewEdit, createCityCoordinates, MapView}
  