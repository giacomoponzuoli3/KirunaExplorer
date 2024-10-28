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

  useEffect(() => {
    //API call to get all the documents so we can display them
    //const docs = API.getAllDocuments();
    //setDocuments(docs)

    //the following lines are temporary until the fronend and back end are not integrated
    const docs = [
      new Document(
          1,
          "Compilation of responses 'So what the people of Kiruna think?'",
          "Kiruna kommun/Residents",
          "Text",
          "2007",
          "Informative document",
          "Swedish",
          null,
          "This document is a compilation of the responses to the survey 'What is your impression of Kiruna?'. From the citizens' responses to this last part of the survey, it is evident that certain buildings, such as the Kiruna Church, the Hjalmar Lundbohmsgården, and the Town Hall, are considered of significant value to the population. The municipality views the experience of this survey positively, to the extent that over the years it will propose various consultation opportunities."
      ),
      new Document(
          2,
          "Detail plan for Bolagsomradet Gruvstadspark",
          "Kiruna kommun",
          "1 : 8.000",
          "20/10/2010",
          "Prescriptive document",
          "Swedish",
          "1-32",
          "This is the first of 8 detailed plans located in the old center of Kiruna, aimed at transforming the residential areas into mining industry zones to allow the demolition of buildings. The area includes the town hall, the Ullspiran district, and the A10 highway, and it will be the first to be dismantled. The plan consists, like all detailed plans, of two documents: the area map that regulates it, and a text explaining the reasons that led to the drafting of the plan with these characteristics. The plan gained legal validity in 2012."
      ),
      new Document(
          3,
          "Construction of Block 1 begins",
          "LKAB",
          "blueprints/effects",
          "06/2019",
          "Material effect",
          null,
          null,
          "Simultaneously with the start of construction on the Aurora Center, work also began on Block 1, another mixed-use building overlooking the main square and the road leading to old Kiruna. These are the first residential buildings in the new town."
      ),
      new Document(
          4,
          "Development Plan",
          "Kiruna kommun/White Arkitekter",
          "1 : 7,500",
          "17/03/2014",
          "Design document",
          "Swedish",
          "111",
          null
      )
  ];
  setDocuments(docs);

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
          <Route index element={<HomePage documents={documents} user={user}/>}/>
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