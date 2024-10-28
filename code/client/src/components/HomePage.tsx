import {Container, Modal, Row, Col, Button} from "react-bootstrap"
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../API/API'; // Make sure the path is correct
import { Link } from 'react-router-dom';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User, Role } from "../models/user";
import { AddDocumentModal, ShowDocumentInfoModal } from "./DocumentModals";


interface HomepageProps {
    documents: Document[];
    user: User;
}

function HomePage({documents, user} : HomepageProps) {

const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
const [showDetails, setShowDetails] = useState<boolean>(false);
const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);

const handleCloseDetailsModal = () => {
    setShowDetails(false);
    setSelectedDocument(null);
};

const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetails(true);

}
function getDocumentIcon(type: string) {
    switch (type) {
        case 'Informative document':
          return <img src="kiruna/img/list.png" alt="Informative Document" />;
        case 'Prescriptive document':
          return <img src="/kiruna/img/sending.png" alt="Prescriptive Document" />;
        case 'Material effect':
          return <img src="/kiruna/img/work-in-progress.png" alt="Material Effect" />;
        case 'Design document':
          return <img src="/kiruna/img/blueprint.png" alt="Design Document" />;
        case 'Technical document':
          return <img src="/kiruna/img/tecnical-service.png" alt="Technical Document" />;
        default:
          return <span>Icon Not Found</span>; // Return null if no matching type
      }
}


return (
<>
 {/* div to show the documents (this will change once the map is implemented) */}
<div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '16px', 
      justifyContent: 'center', // Center items horizontally
      alignItems: 'center', // Center items vertically
      height: '100vh' // Optional: makes the container fill the viewport height for vertical centering
    }}
>
{documents.map((doc, index) => (
  <div key={index} style={{
    display: 'flex',
    flexDirection: 'column', // Stack items vertically
    alignItems: 'center',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    textAlign: 'center', // Center text inside the item
    width: '150px',
    height: '200px',
  }}
  onClick={() => handleDocumentClick(doc)} // Add click handler
  >
    <span style={{
      marginRight: '8px',
      fontSize: '24px',
    }}>{getDocumentIcon(doc.type)}</span>
    <span style={{
      fontWeight: 'bold',
    }}>{doc.title}</span>
  </div>
))}
</div>

{/* Modal to show the document info */}
{selectedDocument && ( <ShowDocumentInfoModal selectedDocument={selectedDocument} show={showDetails} onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon}/>)}
      {/* Add Document Button */}
      {user.role==="Urban Planner" ?(<Button className="bg-gradient-to-r from-orange-400 to-yellow-500"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    borderColor: 'white'
                }}
                onClick={() => setShowAddDocumentModal(true)}
            >
                +
            </Button>
            ):null}

<AddDocumentModal show={showAddDocumentModal} onHide={() => setShowAddDocumentModal(false)}/>
</>
  
);

      
}

function ButtonHomePage(){
  const location = useLocation();
  const isLoginPath = location.pathname === '/';
  return (
    <>
      { !isLoginPath ? (
        <Link 
          to={`/`}
          className="inline-flex mr-4 items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md px-4 py-2 text-sm font-medium no-underline"
        >
          <i className="bi bi-house-door-fill"></i> 
          Back Home
        </Link>
      ) : null }
    </>
  );
}

export { HomePage, ButtonHomePage };