import { useEffect, useState } from 'react';
import {Navbar} from "./Navbar"
import API from '../API/API';
import { Routes, Route, Outlet } from 'react-router-dom';
import {Login} from './Login';
import { HomePage } from './HomePage';
import { NotFoundLayout } from './NotFoundLayout';
import { LinksDocument } from './LinksDocument';
import { Stakeholder } from '../models/stakeholder';
import { DocumentsTable } from './DocumentsTable';
import { DocCoordinates } from '../models/document_coordinate';
import { MapView } from './Map';
import { ResourcesTable } from './ResourcesTable';
import { Diagram } from './Diagram';
import KirunaLandingPage from './KirunaLandingPage';


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
        return <img src="/img/agreement-icon.png" alt="Agreement" className={sizeClass}/>;
      case 'Conflict':
        return <img src="/img/conflict-icon.png" alt="Conflict" className={sizeClass}/>;
      case 'Consultation':
        return <img src="/img/consultation-icon.png" alt="Consultation" className={sizeClass}/>;
      default:
        return <img src="/img/customTypeDocument.png" alt="Custom Document" className={sizeClass}/>; // Return null if no matching type
    }
}



function App() {
  const [user, setUser] = useState<any>('');

  const [isLogged, setIsLogged] = useState<any>(false);
  const [message, setMessage] = useState<any>('');

  const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  const [scaleOptions, setScaleOptions] = useState<{ value: string; label: string }[]>([]);

  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);



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
      //getAllDocuments().then();
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

  useEffect(() => {
    const fetchScaleOptions = async () => {
      try {
        const response = await API.getScales();
        const options = response.map((scale: {name: string}) => ({value: scale.name, label: scale.name}));
        setScaleOptions(options);
      } catch (err: any) {
        console.error("Failed to fetch scales", err);
      }
    };
    fetchScaleOptions().then();
  }, [])

  const handleCreateScale = async (inputValue: string) => {
    try {
      await API.addScale(inputValue);
      const newOption = { value: inputValue, label: inputValue };
      setScaleOptions((prevOptions) => [...prevOptions, newOption]);
    } catch (error) {
      console.error("Error adding new Scale: ", error);
    }
  }


  useEffect(() => {
    const fetchTypeOptions = async () => {
      try {
        const response = await API.getTypes();
        const options = response.map((type: {name: string}) => ({value: type.name, label: type.name}));
        setTypeOptions(options);
      } catch (err: any) {
        console.error("Failed to fetch types", err);
      }
    };
    fetchTypeOptions().then();
  }, [])

  const handleCreateType = async (inputValue: string) => {
    try {
      await API.addType(inputValue);
      const newOption = { value: inputValue, label: inputValue };
      setTypeOptions((prevOptions) => [...prevOptions, newOption]);
    } catch (error) {
      console.error("Error adding new Type: ", error);
    }
  }
  


  return (
    <>
      <Routes>
      <Route element={
          <>
            <Navbar isLogged={isLogged} user={user} logout={handleLogout}></Navbar>
            <Outlet/>
          </>
        }>
          <Route index element={<KirunaLandingPage/>}/>
          <Route path="/map" element={<HomePage geoJsonData={geoJsonData} documentsCoordinates={documentsCoordinates} user={user} refreshDocumentsCoordinates={getAllDocumentsCoordinates} stakeholders={stakeholders} getDocumentIcon={getDocumentIcon} scaleOptions={scaleOptions} onCreateScale={handleCreateScale} typeOptions={typeOptions} onCreateType={handleCreateType}/>}/>
          <Route path="/login" element={<Login message={message} isLogged={isLogged} login={handleLogin} handleBack={handleBack}/>} />
          <Route path="*" element={<NotFoundLayout/>} />
          {/* Aggiungi altre route come la dashboard */}
          <Route path="/:idDocument/links" element={<LinksDocument user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} />} />
          <Route path="/documents/:idDocument?" element={<DocumentsTable user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} refreshDocumentsCoordinates={getAllDocumentsCoordinates} scaleOptions={scaleOptions} onCreateScale={handleCreateScale} typeOptions={typeOptions} onCreateType={handleCreateType}/>} />
          <Route path="documents/:idDocument/links" element={<LinksDocument user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} />} />
          <Route path="documents/:idDocument/map" element={<MapView user={user} geoJsonData={geoJsonData} isLogged={isLogged} getDocumentIcon={getDocumentIcon} documentsCoordinates={documentsCoordinates}/>} />
          <Route path="documents/:idDocument/resources" element={<ResourcesTable user={user} isLogged={isLogged} />} />
          <Route path="/diagram" element={<Diagram user={user} isLogged={isLogged} getDocumentIcon={getDocumentIcon} refreshDocumentsCoordinates={getAllDocumentsCoordinates} documentsCoordinates={documentsCoordinates} stakeholders={stakeholders} scaleOptions={scaleOptions} onCreateScale={handleCreateScale} typeOptions={typeOptions} onCreateType={handleCreateType}/>} />
          
        </Route>
      </Routes>
    </>
  );
}

export default App
