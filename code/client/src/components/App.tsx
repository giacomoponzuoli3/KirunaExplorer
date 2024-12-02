import { useEffect, useState } from 'react';
import {Navbar} from "./Navbar"
import API from '../API/API';
import { Routes, Route, Outlet, BrowserRouter } from 'react-router-dom';
import {Login} from './Login';
import { HomePage } from './HomePage';
import { NotFoundLayout } from './NotFoundLayout';
import { Document } from '../models/document';
import { LinksDocument } from './LinksDocument';
import { Stakeholder } from '../models/stakeholder';
import { DocumentsTable } from './DocumentsTable';
import { DocCoordinates } from '../models/document_coordinate';
import { MapView } from './Map';
import { ResourcesTable } from './ResourcesTable';

function getDocumentIcon(type: string, size: number = 16): JSX.Element | null {
  const sizeClass = `w-${size} h-${size} m-0 p-0`;
  switch (type) {
      case 'Informative document':
        return <img src="/img/informativeDocument-icon.png" alt="Informative Document" className={sizeClass}/>;
      case 'Prescriptive document':
        return <img src="/img/prescriptiveDocument-icon.png" alt="Prescriptive Document" className={sizeClass}/>;
      case 'Material effect':
        return <img src="/img/construction-icon.png" alt="Material Effect" className={sizeClass}/>;
      case 'Design document':
        return <img src="/img/designDocument-icon.png" alt="Design Document" className={sizeClass}/>;
      case 'Technical document':
        return <img src="/img/technicalDocument-icon.png" alt="Technical Document" className={sizeClass}/>;
      case 'Agreement':
        return <img src="/img/agreement-icon.png" alt="Technical Document" className={sizeClass}/>;
      case 'Conflict':
        return <img src="/img/conflict-icon.png" alt="Technical Document" className={sizeClass}/>;
      case 'Consultation':
        return <img src="/img/consultation-icon.png" alt="Technical Document" className={sizeClass}/>;
      default:
        return null; // Return null if no matching type
    }
}



function App() {
  const [user, setUser] = useState<any>('');

  const [isLogged, setIsLogged] = useState<any>(false);
  const [message, setMessage] = useState<any>('');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  //API call to get all the documents so we can display them
  const getAllDocuments = async () => {
    try {
        const docs = await API.getAllDocuments();
        setDocuments(docs);
    } catch (err: any) {
        console.log(err);
    }
  };

  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    // Carica il file GeoJSON da 'public/'
    fetch('/KirunaMunicipality.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  const getAllDocumentsCoordinates = async () => {
    try {
        const docs: DocCoordinates[] = await API.getAllDocumentsCoordinates();
        setDocumentsCoordinates(docs);
    } catch (err: any) {
        console.log(err);
    }
  };

  const getAllStakeholders = async () => {
    try {
        const stakeholders = await API.getAllStakeholders();
        setStakeholders(stakeholders);
    } catch (err: any) {
        console.log(err);
    }
  };

  useEffect(() => {
      getAllDocuments().then();
      getAllDocumentsCoordinates().then()
      getAllStakeholders().then();
  }, []);

  const handleBack = () => {
    setMessage('');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setMessage('');
        const user = await API.getUserInfo();
        setIsLogged(true);
        setUser(user);
      } catch (err) {
        setIsLogged(false);
      }
    };
    checkAuth().then();
  }, []);

  //gestione del login
  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await API.login(username, password);

      setIsLogged(true);
      setMessage(''); //resetto il messaggio
      setUser(user);
    }catch(err) {
      setMessage({msg: "Incorrect username and/or password", type: 'danger'});
    }
  };

  // gestione del logout
  const handleLogout = async () => {
    await API.logOut();
    setIsLogged(false);
    // clean up everything
    setMessage('');
    setUser('')
  };



  return (
    <>
      <Routes>
      <Route element={
          <>
            <Navbar isLogged={isLogged} user={user} logout={handleLogout}></Navbar>
            <Outlet/>
          </>
        }>
          <Route index element={<HomePage geoJsonData={geoJsonData} documentsCoordinates={documentsCoordinates} documents={documents} user={user} refreshDocuments={getAllDocuments} refreshDocumentsCoordinates={getAllDocumentsCoordinates} stakeholders={stakeholders} getDocumentIcon={getDocumentIcon}/>}/>
          <Route path="/login" element={<Login message={message} isLogged={isLogged} login={handleLogin} handleBack={handleBack}/>} />
          <Route path="*" element={<NotFoundLayout/>} />
          {/* Aggiungi altre route come la dashboard */}
          <Route path="/:idDocument/links" element={<LinksDocument user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} />} />
          <Route path="/documents" element={<DocumentsTable user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} refreshDocuments={getAllDocuments} refreshDocumentsCoordinates={getAllDocumentsCoordinates}/>} />
          <Route path="documents/:idDocument/links" element={<LinksDocument user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} />} />
          <Route path="documents/:idDocument/map" element={<MapView user={user} geoJsonData={geoJsonData} isLogged={isLogged} getDocumentIcon={getDocumentIcon} documentsCoordinates={documentsCoordinates}/>} />
          <Route path="documents/:idDocument/resources" element={<ResourcesTable user={user} isLogged={isLogged} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App
