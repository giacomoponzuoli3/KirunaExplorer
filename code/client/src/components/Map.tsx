import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';

//coordinates of Kiruna Town Hall
const kiruna_town_hall: LatLngTuple = [67.8558, 20.2253];

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

function areCoordinatesEqual(coord1: any, coord2: L.LatLng): boolean {
  return coord1.latitude === coord2.lat && coord1.longitude === coord2.lng;
}



function SetMapViewHome(props: any) {
  const map = useMap();
  const [showPolygonMessage, setShowPolygonMessage] = useState(false);

  const [occupiedCoordinates, setOccupiedCoordinates] = useState<Set<string>>(new Set());

  // Funzione per generare una chiave unica per una coordinata
  const coordinateKey = (latitude: number, longitude: number): string => {
    return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  };

  // Funzione per trovare la prossima coordinata disponibile
  const findAvailableCoordinate = (latitude: number, longitude: number): [number, number] => {
    let newLat = latitude;
    let newLng = longitude;
    let offset = 0.0001; // Il valore di offset per spostare la coordinata

    // Continua a cercare una nuova posizione finché non trovi una coordinata libera
    while (occupiedCoordinates.has(coordinateKey(newLat, newLng))) {
      newLat = latitude + offset;
      newLng = longitude + offset;
      offset += 0.01; // Incrementa l'offset per evitare la collisione
    }

    return [newLat, newLng];
  };

  // Coordinates of Kiruna town hall means the center of the city
  const position: LatLngTuple = [67.8558, 20.2253];

  const kirunaBounds = new LatLngBounds(
    [67.79039, 20.416509], // Sud-ovest
    [67.889194, 20.050656] // Nord-est
  );

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

    props.documentsCoordinates.filter((d: DocCoordinates) => d.coordinates.length !== 0).forEach((doc: any) => {
      const latitude = doc.coordinates[0].latitude;
      const longitude = doc.coordinates[0].longitude;
      console.log(doc.coordinates[0].latitude);
      console.log(occupiedCoordinates)
      // Verifica se la coordinata è già occupata
      const key = coordinateKey(latitude, longitude);
      if (occupiedCoordinates.has(key)) {
        console.log("entrato");
        // Trova una nuova coordinata disponibile
        const [newLat, newLng] = findAvailableCoordinate(latitude, longitude);
        // Aggiungi la nuova coordinata alla lista delle coordinate occupate
        setOccupiedCoordinates((prev) => new Set(prev).add(coordinateKey(newLat, newLng)));
      } else {
        console.log("Entratos")
        // Aggiungi la coordinata originale alla lista delle coordinate occupate
        setOccupiedCoordinates((prev) => new Set(prev).add(key));
      }

      const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);
      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: `
            <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95">
              ${iconHtml}
            </div>
          `,
          iconSize: [20, 20],
          className: '',
        }),
      }).addTo(map);

      if (doc.coordinates.length > 1) {
        const latLngs = doc.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

        const relatedLayer: L.Polygon = L.polygon(latLngs, {
          color: '#B22222',
          weight: 1,
          opacity: 0.8,
          fillColor: '#FFD700',
          fillOpacity: 0.1,
          smoothFactor: 2,
        });

        marker.on('mouseover', () => {
          if (!map.hasLayer(relatedLayer)) {
            relatedLayer.addTo(map);
            relatedLayer.setStyle({ color: '#8B0000', weight: 2, fillOpacity: 0.2 });
            console.log(doc.coordinates)
            // Controlla se le coordinate corrispondono
            if (doc.coordinates.every((coord: any) => createCityCoordinates().some((cityCoord: L.LatLng) => areCoordinatesEqual(coord, cityCoord)))) {
              setShowPolygonMessage(true); // Mostra il messaggio se le coordinate sono uguali
            }
          }
        });

        marker.on('mouseout', () => {
          if (map.hasLayer(relatedLayer)) {
            map.removeLayer(relatedLayer);

            setShowPolygonMessage(false); // Nascondi il messaggio
          }
        });
      }

      marker.on('click', () => {
        props.onMarkerClick(doc);
      });
    });
  }, [props.documentsCoordinates]);

  return (
    <>
      {showPolygonMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-200 text-black text-sm px-2 py-1 rounded-md shadow-lg border">
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

  // Coordinate di esempio (come punto centrale della mappa)
  const position: LatLngTuple = [67.8558, 20.2253];

  // Limiti della mappa per Kiruna
  const kirunaBounds = new LatLngBounds(
    [67.790390, 20.416509],  // Sud-ovest
    [67.889194, 20.050656]   // Nord-est
  );

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



export {SetMapViewHome, SetMapViewEdit, createCityCoordinates}
  