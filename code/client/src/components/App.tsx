import { useEffect, useState } from 'react';
import {Navbar} from "./Navbar"
import API from '../API/API';
import { Routes, Route, Outlet } from 'react-router-dom';
import {Login} from './Login';
import { HomePage } from './HomePage';
import { NotFoundLayout } from './NotFoundLayout';
import { Document } from '../models/document';
import { LinksDocument } from './LinksDocument';
import { Stakeholder } from '../models/stakeholder';

function App() {
  const [user, setUser] = useState<any>('');
  const [isLogged, setIsLogged] = useState<any>(false);
  const [message, setMessage] = useState<any>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  //API call to get all the documents so we can display them
  const getAllDocuments = async () => {
    try {
        const docs = await API.getAllDocuments();
        setDocuments(docs);
        //console.log(docs)
    } catch (err: any) {
        console.log(err);
    }
  };

  const getAllStakeholders = async () => {
    try {
        const stakeholders = await API.getAllStakeholders();
        console.log(stakeholders);
        setStakeholders(stakeholders);
        //console.log(stakeholders)
    } catch (err: any) {
        console.log(err);
    }
  };

  useEffect(() => {
      getAllDocuments().then();
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
          <Route index element={<HomePage documents={documents} user={user} refreshDocuments={getAllDocuments} stakeholders={stakeholders}/>}/>
          <Route path="/login" element={<Login message={message} isLogged={isLogged} login={handleLogin} handleBack={handleBack}/>} />
          <Route path="*" element={<NotFoundLayout/>} />
          {/* Aggiungi altre route come la dashboard */}
          <Route path="documents/:idDocument/links" element={<LinksDocument user={user} isLogged={isLogged} />} />
        </Route>
      </Routes>
    </>
    
  );
}

export default App