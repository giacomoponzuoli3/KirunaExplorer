import { useEffect, useState } from 'react';
import {Navbar} from "./Navbar"
import API from '../API/API';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import {Login} from './Login'; // Assicurati che il percorso sia corretto
import { HomePage } from './HomePage';
import { NotFoundLayout } from './NotFoundLayout';
import { Container } from 'react-dom';
import { Document } from '../models/document';
import { LinksDocument } from './LinksDocument';

function App() {
  const [user, setUser] = useState<any>('');
  const [isLogged, setIsLogged] = useState<any>(false);
  const [message, setMessage] = useState<any>('');
  const [documents, setDocuments] = useState<Document[]>([]);

    //API call to get all the documents so we can display them
  const getAllDocuments = async () => {
    try {
        const docs = await API.getAllDocuments();
        setDocuments(docs);
    } catch (err: any) {
        console.log(err);
    }
  };

  useEffect(() => {
      getAllDocuments().then();
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
    checkAuth();
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
          <Route index element={<HomePage documents={documents} user={user} refreshDocuments={getAllDocuments}/>}/>
          <Route path="/login" element={<Login message={message} isLogged={isLogged} login={handleLogin} handleBack={handleBack}/>} />
          <Route path="*" element={<NotFoundLayout/>} />
          {/* Aggiungi altre route come la dashboard */}
          <Route path="documents/:idDocument/links" element={<LinksDocument />} />
        </Route>
      </Routes>
    </>
    
  );
}

export default App