import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { useMap } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, ControlOptions, map, polygon, Polygon } from 'leaflet'; // Import del tipo corretto
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { DocCoordinates } from "../models/document_coordinate";
import ReactDOMServer from 'react-dom/server';
import API from '../API/API';
import LatLng from '../interfaces';

// Coordinates of Kiruna Town Hall
const kiruna_town_hall: LatLngTuple = [67.8558, 20.2253];

function SetMapViewHome(props: any) {
  const map = useMap();
  const [showPolygonMessage, setShowPolygonMessage] = useState(false);
  const [coordinates, setCoordinates] = useState<L.LatLng[]>([]);


  // Fetch municipality area coordinates
  useEffect(() => {
    const getMunicipalityArea = async () => {
      try {
        const coord = await API.getMunicipalityArea();
        setCoordinates(coord);
      } catch (err) {
        console.log("Error getting municipality area");
      }
    };
    getMunicipalityArea();
  }, []);

  function createCityCoordinates(): L.LatLng[] {
    console.log(coordinates);
    return coordinates.map(coord => L.latLng(coord.lat, coord.lng));
  }

  function areCoordinatesInCityArea(docCoordinates: any[]): boolean {
    const cityCoords = createCityCoordinates();
    return docCoordinates.every((coord: any) =>
      cityCoords.some((cityCoord: L.LatLng) =>
        cityCoord.lat === coord.latitude && cityCoord.lng === coord.longitude
      )
    );
  }

  // Map setup and adding layers
  useEffect(() => {
    const position: LatLngTuple = [67.8558, 20.2253];
    const kirunaBounds = new LatLngBounds(
      [67.79039, 20.416509], // Southwest
      [67.889194, 20.050656] // Northeast
    );

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

  // Marker and polygon handling
  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    const occupiedPositions: Set<string> = new Set();

    props.documentsCoordinates
      .filter((d: DocCoordinates) => d.coordinates.length !== 0)
      .forEach((doc: any) => {
        const latLngs = doc.coordinates.map((coord: any) => [coord.latitude, coord.longitude]);

        if (latLngs.length > 1) {
          const relatedLayer: L.Polygon = L.polygon(latLngs, {
            color: '#B22222',
            weight: 1,
            opacity: 0.8,
            fillColor: '#FFD700',
            fillOpacity: 0.1,
            smoothFactor: 2,
          });

          const centralCoord = latLngs[0];
          let adjustedPosition: LatLngTuple = [centralCoord[0], centralCoord[1]];

          const zoom = map.getZoom();
          const offset = (18 - zoom) * 0.0001;

          let attempts = 0;
          while (occupiedPositions.has(adjustedPosition.toString()) && attempts < 10) {
            adjustedPosition = [
              centralCoord[0] + offset * (Math.random() > 0.5 ? 1 : -1),
              centralCoord[1] + offset * (Math.random() > 0.5 ? 1 : -1),
            ];
            attempts++;
          }

          occupiedPositions.add(adjustedPosition.toString());

          const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);

          const marker = L.marker(adjustedPosition, {
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

          marker.on('mouseover', () => {
            relatedLayer.setStyle({ color: '#8B0000', weight: 2, fillOpacity: 0.2 }).addTo(map);
            if (areCoordinatesInCityArea(doc.coordinates)) {
              setShowPolygonMessage(true);
            }
          });

          marker.on('mouseout', () => {
            relatedLayer.setStyle({ color: '#B22222', weight: 1, fillOpacity: 0.1 }).removeFrom(map);
            setShowPolygonMessage(false);
          });

          marker.on('click', () => {
            props.onMarkerClick(doc);
          });
        } else {
          const coord = doc.coordinates[0];
          const marker = L.marker([coord.latitude, coord.longitude]).addTo(map);

          const iconHtml = ReactDOMServer.renderToString(props.getDocumentIcon(doc.type, 5) || <></>);

          marker.setIcon(L.divIcon({
            html: `
              <div class="custom-marker flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-white transition duration-200 transform hover:scale-110 active:scale-95 border-1 border-blue-950">
                ${iconHtml}
              </div>
            `,
            iconSize: [20, 20],
            className: '',
          }));

          marker.on('click', () => {
            props.onMarkerClick(doc);
          });
        }
      });
  }, [props.documentsCoordinates]);

  return (
    <>
      {showPolygonMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-200 text-black text-sm px-2 py-1 rounded-md shadow-lg border">
          Area: <strong>the entire municipality of Kiruna</strong>
        </div>
      )}
    </>
  );
}

// Map component for the modal edit
function SetMapViewEdit(props: any) {
  const { setSelectedPosition, useMunicipalArea } = props;
  const map = useMap(); // Get map instance

  // Coordinates for the initial view
  const position: LatLngTuple = [67.8558, 20.2253];

  // Bounds for Kiruna area
  const kirunaBounds = new LatLngBounds(
    [67.790390, 20.416509],  // Southwest
    [67.889194, 20.050656]   // Northeast
  );

  const defaultIcon = new L.Icon({
    iconUrl: '/img/marker.png',
    iconSize: [41, 41],  // Icon size
    iconAnchor: [12, 41], // Anchor point of the icon
    popupAnchor: [1, -34], // Popup anchor point
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]  // Shadow size
  });

  let currentMarker: L.Marker | null = null;

  useEffect(() => {
    if (map.getZoom() === undefined) {
      map.setView(position, 12);
    }

    map.setMaxZoom(18);
    map.setMinZoom(3);
    map.setMaxBounds(kirunaBounds);

    const drawControl = new L.Control.Draw({
      draw: {
        marker: { icon: defaultIcon }, // Enable custom icon for markers
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
    ).addTo(map);

    const classicLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
    ).addTo(map);

    L.control.layers({ Classic: classicLayer, Satellite: satelliteLayer }, {}, { position: 'topleft' }).addTo(map);

    map.on(L.Draw.Event.CREATED, (e) => {
      const { layer } = e;
      currentMarker = layer;

      setSelectedPosition({
        latitude: layer.getLatLng().lat,
        longitude: layer.getLatLng().lng
      });
    });

    return () => {
      map.eachLayer((layer) => {
        if (layer !== satelliteLayer && layer !== classicLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map]);

  return null;
}

export { SetMapViewHome, SetMapViewEdit };
