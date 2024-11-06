import {Button} from "react-bootstrap"
import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../API/API';
import { Link } from 'react-router-dom';
import { Document } from "../models/document";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from "../models/user";
import { AddDocumentModal, ShowDocumentInfoModal, EditDocumentModal, AddNewDocumentLinksModal } from "./DocumentModals";
import { Stakeholder } from "../models/stakeholder";
import { DocLink } from "../models/document_link";
import { title } from "process";


interface HomepageProps {
    documents: Document[];
    user: User;
    refreshDocuments: () => void;
    stakeholders: Stakeholder[];
}

function HomePage({documents, user, refreshDocuments, stakeholders} : HomepageProps) {

const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
const [documentLinks, setDocumentLinks] = useState<DocLink[]>([]);
const [showDetails, setShowDetails] = useState<boolean>(false);
const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);
const [showAddLinks, setShowAddLinks] = useState<boolean>(false);

const handleEdit = () => {
  setShowEditDocumentModal(true);
};

const handleCloseDetailsModal = () => {
    setShowDetails(false);
    setSelectedDocument(null);
};

const handleDocumentClick = async (doc: Document) => {
    const document = await API.getDocumentById(doc.id);
    setSelectedDocument(document);
    const docLinks = await API.getDocumentLinksById(doc.id);
    setDocumentLinks(docLinks);
    setShowDetails(true);

}

function refreshSelectedDocument(doc: Document) {
  setSelectedDocument(doc)
}

function getDocumentIcon(type: string) {
    switch (type) {
        case 'Informative document':
          return <img src="kiruna/img/informativeDocument.png" alt="Informative Document" />;
        case 'Prescriptive document':
          return <img src="/kiruna/img/prescriptiveDocument.png" alt="Prescriptive Document" />;
        case 'Material effect':
          return <img src="/kiruna/img/construction.png" alt="Material Effect" />;
        case 'Design document':
          return <img src="/kiruna/img/designDocument.png" alt="Design Document" />;
        case 'Technical document':
          return <img src="/kiruna/img/technicalDocument.png" alt="Technical Document" />;
        case 'Agreement':
          return <img src="/kiruna/img/agreement.png" alt="Technical Document" />;
        case 'Conflict':
          return <img src="/kiruna/img/conflict.png" alt="Technical Document" />;
        case 'Consultation':
          return <img src="/kiruna/img/consultation.png" alt="Technical Document" />;
        default:
          return null; // Return null if no matching type
      }
}

return (
<>
 {/* div to show the documents (this will change once the map is implemented) */}
 <div style={{ 
  display: 'flex',
  justifyContent: 'center', // Center horizontally
  alignItems: 'center', // Center vertically
  paddingTop: '100px',
  boxSizing: 'border-box'
}}>
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center', // Center items horizontally within the row
    alignItems: 'stretch', // Stretch items to match tallest card in each row
    maxWidth: '80%', // Optional: limits width to prevent cards from stretching too wide
  }}>
    {documents.map((doc, index) => (
      <div key={index} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        textAlign: 'center',
        width: '150px',
        minHeight: '100%', // Make each card stretch to fill the row
        boxSizing: 'border-box',
      }}
      onClick={() => handleDocumentClick(doc)}
      >
        <span style={{
          marginBottom: '8px',
          fontSize: '24px',
        }}>{getDocumentIcon(doc.type)}</span>
        <span style={{
          fontWeight: 'bold',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          width: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}>
          {doc.title}
        </span>
      </div>
    ))}
  </div>
</div>





{/* Modal to show the document info */}
{selectedDocument && ( <ShowDocumentInfoModal 
                          selectedDocument={selectedDocument} show={showDetails} 
                          onHide={handleCloseDetailsModal} getDocumentIcon={getDocumentIcon} 
                          user={user} handleEdit={handleEdit} refreshDocuments={refreshDocuments}
                          documentLinks={documentLinks}
                        />
                      )}
                      
{/* Add Document Button */}
      {user.role==="Urban Planner" ?(<Button className="bg-blue-600"
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
                <img src="kiruna/img/addDocument.png" alt="addDocument icon" />
            </Button>
            ):null}

<AddDocumentModal show={showAddDocumentModal} 
onHide={() => setShowAddDocumentModal(false)} refreshDocuments={refreshDocuments} 
stakeholders={stakeholders} showAddNewDocumentLinksModal={() => setShowAddLinks(true)}/>

{selectedDocument && (<EditDocumentModal 
                         document={selectedDocument} show={showEditDocumentModal} 
                         onHide={() => setShowEditDocumentModal(false)} refreshSelectedDocument={refreshSelectedDocument}
                         stakeholders={stakeholders}
                         />
)}

<AddNewDocumentLinksModal document={documents[documents.length-1]} show={showAddLinks} 
onHide={() => setShowAddLinks(false)} refreshDocuments={refreshDocuments}
docs={documents}/>
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