import {Container, Modal, Row, Col} from "react-bootstrap"
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../API/API'; // Make sure the path is correct
import { Link } from 'react-router-dom';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';


interface HomepageProps {
    documents: Document[];
}

function HomePage({documents} : HomepageProps) {

const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
const [showDetails, setShowDetails] = useState<boolean>(false);

const handleCloseModal = () => {
    setShowDetails(false);
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
{selectedDocument && (
<Modal size="lg" show={showDetails} onHide={handleCloseModal} aria-labelledby="example-modal-sizes-title-lg">
        <Modal.Header closeButton style={{backgroundColor: 'rgb(250, 250, 210, 0.8)'}}>
          <Modal.Title id="example-modal-sizes-title-lg">
            {`${selectedDocument.title} (${selectedDocument.id})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: 'rgb(250, 250, 210, 0.2)'}}>
        <Container>
          <Row>
            <Col xs={3} md={2}>
            {getDocumentIcon(selectedDocument.type)}
            </Col>
            <Col xs={9} md={5}>
            <p>Stakeholders: {selectedDocument.stakeHolders}</p>
            <p>Scale: {selectedDocument.scale}</p>
            <p>Issuance Date: {selectedDocument.issuanceDate}</p>
            <p>Type: {selectedDocument.type}</p>
            <p>Language: {selectedDocument.language ? selectedDocument.language : '-'}</p>
            <p>Pages: {selectedDocument.pages ? selectedDocument.pages : '-'}</p>
            </Col>
            <Col xs={12} md={5}>
              <p>{selectedDocument.description ? selectedDocument.description : '-'}</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <Link to={`documents/${selectedDocument.id}/links`}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium no-underline"
              >
                View connections
              </Link>
            </Col>
          </Row>
          </Container>
        </Modal.Body>
      </Modal>
      )}
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
          <span className="hidden md:inline">Back Home</span>
        </Link>
      ) : null }
    </>
  );
}

export { HomePage, ButtonHomePage };