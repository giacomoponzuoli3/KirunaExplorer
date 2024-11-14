import React, { useState,useEffect } from 'react';
import { Container, Modal, Row, Col, Form, Button, Dropdown, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../models/user';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';
import { DocLink } from '../models/document_link';
import '../modal.css'
import { TrashIcon, PencilIcon,ChevronLeftIcon,ChevronRightIcon, MapIcon } from "@heroicons/react/24/outline";
import Link from '../models/link'; 
import Alert from "./Alert";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';
import ISO6391 from 'iso-639-1';  // Utilizziamo ISO 639-1 per ottenere le lingue
import { DocCoordinates } from '../models/document_coordinate';
import Coordinate from '../models/coordinate';
import {ModalEditGeoreference} from "./ModalEditGeoreference"

interface RequiredLabelProps {
    text: string; // Explicitly define the type of 'text' as string
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ text }) => (
    <span>
        {text} <span style={{ color: 'red' }}>*</span>
    </span>
);



/* ------------ Interfaces -------- */

interface AddDocumentModalProps {
    show: boolean;
    onHide: () => void;
    refreshDocuments: () => void;
    stakeholders: Stakeholder[];
    showGeoreferenceNewDocumentModal: (doc: Document) => void;
}

interface EditDocumentModalProps {
  document: Document;
  show: boolean;
  onHide: () => void;
  refreshSelectedDocument: (doc: Document) => void;
  stakeholders: Stakeholder[]
}

interface TruncatedTextProps {
  text: string;
  maxLength: number;
}

interface ShowDocumentInfoModalProps {
  selectedDocument: Document;
  show: boolean;
  onHide: () => void;
  getDocumentIcon: (type: string, size: number) => JSX.Element | null;
  user: User;
  handleEdit: () => void;
  refreshDocuments: () => void;
}

interface AddNewDocumentLinksModalProps {
  document: Document;
  show: boolean;
  onHide: () => void;
  refreshDocuments: () => void;
  docs: Document[];
}


/* ------------ Functions -------- */

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <span className={isExpanded ? '' : 'line-clamp-3'}>
        {text}
      </span>
      <button
        className="text-blue-600 mt-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};




function AddDocumentModal({ show, onHide, refreshDocuments, stakeholders,showGeoreferenceNewDocumentModal}: AddDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
    const [scale, setScale] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [type, setType] = useState('');
    const [language, setLanguage] = useState<string | null>(null);
    const [pages, setPages] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [showAlert, setShowAlert] = useState(false); // alert state

    const resetForm = () => {
        setTitle('');
        setSelectedStakeholders([]);
        setScale('');
        setIssuanceDate('');
        setType('');
        setLanguage(null);
        setPages(null);
        setDescription('');
        setShowAlert(false);
    };

    const handleClose = () => {
        onHide();
        resetForm();
    };

    const toggleSelect = (option: Stakeholder) => {
        setSelectedStakeholders((prevSelectedStakeholders) => {
            const newSelectedStakeholders = prevSelectedStakeholders.includes(option)
                ? prevSelectedStakeholders.filter((item) => item !== option)
                : [...prevSelectedStakeholders, option]; 
            return newSelectedStakeholders; // Return the new state
        });
    };

    const handleSubmit = async () => {
        // Validation check
        if (!title || selectedStakeholders.length===0 || !scale || !issuanceDate || !type 
          || title.trim() === '' || scale.trim() === '' || issuanceDate.trim() === '' || description.trim() === '') {
            setShowAlert(true);
            return; // Exit the function early
        }
        //API call to add a document
        const doc = await API.addDocument(title, selectedStakeholders, scale, issuanceDate, type, language, pages, description).then();
         console.log(doc.id);
        refreshDocuments();
        handleClose();
        refreshDocuments();
        showGeoreferenceNewDocumentModal(doc);
    };

    // Ottieni tutte le lingue disponibili da ISO 639-1
    const languageOptions = ISO6391.getAllCodes().map(code => ({
      value: code,
      label: ISO6391.getName(code),
    }));

    return (
      <Modal size="lg" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
          <Modal.Header closeButton style={{ backgroundColor: 'rgba(167, 199, 231, 0.8)' }}>
            <Modal.Title id="example-modal-sizes-title-lg">Add New Document</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: 'rgba(167, 199, 231, 0.4)' }}>
            <Container>
              {showAlert &&
                <Alert
                    message="Please fill in the mandatory fields marked with the red star (*)."
                    onClose={() => {
                        setShowAlert(false);
                    }}
                />
              }
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Row} controlId="formTitle">
                    <Form.Label column md={2}><RequiredLabel text="Title" /></Form.Label>
                    <Col md={10}>
                      <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Col md={6} className='mt-4 mr-5'>
                    <Form.Group as={Row} controlId="formScale" className="mb-3">
                      <Form.Label column md={5}><RequiredLabel text="Scale" /></Form.Label>
                      <Col md={7}>
                        <Form.Control
                          type="text"
                          value={scale}
                          onChange={(e) => setScale(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formIssuanceDate" className="mb-3">
                      <Form.Label column md={5}><RequiredLabel text="Issuance Date" /></Form.Label>
                      <Col md={7}>
                        <Form.Control
                          type="text"
                          value={issuanceDate}
                          onChange={(e) => setIssuanceDate(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4} className="mt-3">
                    <Row>
                      <Dropdown className="mt-2">
                        <Dropdown.Toggle id="dropdown-basic" 
                          style={{ backgroundColor: 'rgb(164,135,121)', 
                        }}>
                          <span><RequiredLabel text="Choose Stakeholders" /></span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{  width:'200px' }}>
                          {stakeholders.map((option, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => toggleSelect(option)}
                              active={selectedStakeholders.includes(option)}
                            >
                              {option.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Row>
                    <Row>
                      <Dropdown className="w-100 mt-3">
                        <Dropdown.Toggle id="dropdown-button-dark-example1" 
                          style={{ backgroundColor: 'rgb(164,135,121)', width:'200px'}}
                        >
                          {type ? type : <RequiredLabel text="Choose a type" />}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{  width:'200px' }}>
                          <Dropdown.Item onClick={() => setType("Informative document")}>Informative document</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Prescriptive document")}>Prescriptive document</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Design document")}>Design document</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Technical document")}>Technical document</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Material effect")}>Material effect</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Agreement")}>Agreement</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Conflict")}>Conflict</Dropdown.Item>
                          <Dropdown.Item onClick={() => setType("Consultation")}>Consultation</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Row>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="formDescription">
                    <Form.Label><RequiredLabel text="Description" /></Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                  <Col md={6} className='mt-4'>
                  <Form.Group as={Row} controlId="formLanguage" className="mb-3">
                    <Form.Label column md={4}>Language</Form.Label>
                    <Col md={8}>
                      <Select
                        options={languageOptions}
                        value={language ? languageOptions.find(lang => lang.value === language) : null}
                        onChange={(selectedOption) => setLanguage(selectedOption ? selectedOption.label : null)}
                        placeholder="Select Language"
                      />
                    </Col>
                  </Form.Group>
                    <Form.Group as={Row} controlId="formPages" className="mb-3">
                      <Form.Label column md={4}>Pages</Form.Label>
                      <Col md={8}>
                        <Form.Control
                            type="text"
                            value={pages || ''}
                            onChange={(e) => setPages(e.target.value ? e.target.value : null)}
                        />
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Container>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: 'rgba(167, 199, 231,0.8)' }}>
            <Button variant="secondary" className="text-white rounded-md" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleSubmit} style={{ borderColor: 'white' }}>
              Submit
            </Button>
          </Modal.Footer>
      </Modal>
    );
}


function EditDocumentModal({ document, show, onHide, refreshSelectedDocument, stakeholders }: EditDocumentModalProps) {
    const [title, setTitle] = useState(document.title);
    const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>(document.stakeHolders);
    const [scale, setScale] = useState(document.scale);
    const [issuanceDate, setIssuanceDate] = useState(document.issuanceDate);
    const [type, setType] = useState(document.type);
    const [language, setLanguage] = useState<string | null>(document.language);
    const [pages, setPages] = useState<string | null>(document.pages);
    const [description, setDescription] = useState(document.description);
    const [showAlert, setShowAlert] = useState(false); // alert state

    const toggleSelect = (option: Stakeholder) => {
      setSelectedStakeholders((prevSelectedStakeholders) => {
        const isSelected = prevSelectedStakeholders.some((item) => item.id === option.id); // Check if the stakeholder is already selected
        
        const newSelectedStakeholders = isSelected
            ? prevSelectedStakeholders.filter((item) => item.id !== option.id) // Remove by ID
            : [...prevSelectedStakeholders, option]; // Add by ID

        console.log('Updated Stakeholders:', newSelectedStakeholders); // Log the new state
        return newSelectedStakeholders; // Return the new state
    });
    };

    const handleSubmit = async () => {
        // Validation check
        if (!title || selectedStakeholders.length === 0 || !scale || !issuanceDate || !type ||
            title.trim() === '' || scale.trim() === '' || issuanceDate.trim() === ''|| description.trim() === ''
        ) {
            setShowAlert(true);
            return;
        }
        // API call to edit a document
        const doc: Document = await API.editDocument(document.id, title, selectedStakeholders, scale, issuanceDate, type, language, pages,  description).then();
        console.log(doc)
        //doc.stakeHolders = sh;
        refreshSelectedDocument(doc);
        onHide();
    };

    // Ottieni tutte le lingue disponibili da ISO 639-1
    const languageOptions = ISO6391.getAllCodes().map(code => ({
      value: code,
      label: ISO6391.getName(code),
    }));
    
    return (
        <Modal size="lg" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
            <Modal.Header closeButton style={{ backgroundColor: 'rgb(167, 199, 231,0.8)' }}>
                <Modal.Title id="example-modal-sizes-title-lg">Edit Document</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: 'rgb(167, 199, 231,0.4)' }}>
                <Container>
                    {showAlert &&
                        <Alert
                            message="Please fill in the mandatory fields marked with the red star (*)."
                            onClose={() => {
                                setShowAlert(false);
                            }}
                        />
                    }
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Row} controlId="formTitle">
                                <Form.Label column md={2}><RequiredLabel text="Title" /></Form.Label>
                                <Col md={10}>
                                    <Form.Control
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6} className="mt-4 mr-5">
                                <Form.Group as={Row} controlId="formScale" className="mb-3">
                                    <Form.Label column md={5}><RequiredLabel text="Scale" /></Form.Label>
                                    <Col md={7}>
                                        <Form.Control
                                            type="text"
                                            value={scale}
                                            onChange={(e) => setScale(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formIssuanceDate" className="mb-3">
                                    <Form.Label column md={5}><RequiredLabel text="Issuance Date" /></Form.Label>
                                    <Col md={7}>
                                        <Form.Control
                                            type="text"
                                            value={issuanceDate}
                                            onChange={(e) => setIssuanceDate(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={4} className="mt-3">
                                <Row>
                                    <Dropdown className="mt-2">
                                        <Dropdown.Toggle variant="success" id="dropdown-basic"
                                            style={{ backgroundColor: 'rgb(164,135,121)' }}
                                        >
                                            <span><RequiredLabel text="Choose Stakeholders" /></span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu style={{ width: '200px' }}>
                                            {stakeholders.map((option, index) => (
                                                <Dropdown.Item
                                                    key={index}
                                                    onClick={() => toggleSelect(option)}
                                                    active={selectedStakeholders.some(stakeholder => stakeholder.id === option.id)}
                                                >
                                                    {option.name}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Row>
                                <Row>
                                    <Dropdown className="w-100 mt-3">
                                        <Dropdown.Toggle id="dropdown-button-dark-example1"
                                            style={{ backgroundColor: 'rgb(164,135,121)', width: '200px' }}
                                        >
                                            {type ? type : <RequiredLabel text="Choose a type" />}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu style={{ width: '200px' }}>
                                            <Dropdown.Item onClick={() => setType("Informative document")}>Informative document</Dropdown.Item>
                                            <Dropdown.Item onClick={() => setType("Prescriptive document")}>Prescriptive document</Dropdown.Item>
                                            <Dropdown.Item onClick={() => setType("Design document")}>Design document</Dropdown.Item>
                                            <Dropdown.Item onClick={() => setType("Technical document")}>Technical document</Dropdown.Item>
                                            <Dropdown.Item onClick={() => setType("Material effect")}>Material effect</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="formDescription">
                                <Form.Label><RequiredLabel text="Description" /></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                            <Col md={6} className="mt-4">
                                <Form.Group as={Row} controlId="formLanguage" className="mb-3">
                                <Form.Label column md={4}>Language</Form.Label>
                                <Col md={8}>
                                  <Select
                                    options={languageOptions}
                                    value={language ? languageOptions.find(lang => lang.value === language) : null}
                                    onChange={(selectedOption) => setLanguage(selectedOption ? selectedOption.label : null)}
                                    placeholder="Select Language"
                                  />
                                </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formPages" className="mb-3">
                                    <Form.Label column md={4}>Pages</Form.Label>
                                    <Col md={8}>
                                        <Form.Control
                                            type="text"
                                            value={pages || ''}
                                            onChange={(e) => setPages(e.target.value ? e.target.value : null)}
                                        />
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: 'rgb(167, 199, 231,0.8)' }}>
                <Button variant="secondary" className="text-white rounded-md" onClick={onHide}>
                    Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleSubmit} style={{ borderColor: 'white' }}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function ShowDocumentInfoModal({ getDocumentIcon, selectedDocument, show, onHide, user, handleEdit, refreshDocuments }: ShowDocumentInfoModalProps) {
  const navigate = useNavigate();  
  

  const [documentsCoordinates, setDocumentsCoordinates] = useState<Coordinate[] | null>([]); //da mettere null
  const [showModalEditGeoreference, setShowModalEditGeoreference] = useState<boolean>(false);

  const handleEditClick = () => {
      handleEdit();
      //onHide()
  };

  const handleEditGeoreference = () => {
    
    if(documentsCoordinates != null){
      console.log(documentsCoordinates)
      setShowModalEditGeoreference(true);
    }

  };

  const handleDeleteClick = async () => {
    try{
      await API.deleteDocument(selectedDocument.id).then();
      refreshDocuments();
    }catch(err){

    }finally{
      onHide();
    }
      
  };
  
  const getCoordinatesById = async () => {
    try{
      //const coordinates = await API.getCoordinatesById(selectedDocument.id);
      //setDocumentsCoordinates([]);
    } catch{
      
    }   
  }

  useEffect(() => {
    getCoordinatesById().then();
  }, [])

  return (
      <>
          <Modal 
              show={show && !showModalEditGeoreference} 
              onHide={onHide} 
              dialogClassName="custom-modal-width" 
              aria-labelledby="example-custom-modal-styling-title"
          >
              <Modal.Header closeButton style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
                  <Modal.Title 
                      id="example-custom-modal-styling-title"
                      style={{
                          whiteSpace: 'normal',         // Allows text to wrap onto multiple lines
                          wordWrap: 'break-word',       // Breaks long words onto a new line if necessary
                          overflowWrap: 'break-word',   // Ensures that even very long words will break 
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                      }}
                  >
                      {`${selectedDocument.title} (${selectedDocument.id})`}
                  </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                  <Container>
                      <div className="hidden md:block">
                          <Row>
                              <Col xs={3} md={2}>
                                  {getDocumentIcon(selectedDocument.type, 16)}
  
                                  {user.role === "Urban Planner" && (
                                      <div className="flex space-x-2 mt-4">
                                          <button
                                            className="p-2 rounded-full border-2 bg-red-400 text-white hover:bg-red-700 transition-colors duration-200"
                                            onClick={handleDeleteClick}
                                          >
                                              <TrashIcon className="h-5 w-5" />
                                          </button>
                                          <button
                                            className="p-2 rounded-full border-2 bg-blue-400 text-white hover:bg-blue-700 transition-colors duration-200"
                                            onClick={handleEditClick}
                                          >
                                              <PencilIcon className="h-5 w-5" />
                                          </button>
                                          <button
                                            className="p-2 rounded-full border-2 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                                            onClick={handleEditGeoreference}
                                          >
                                            <MapIcon className="h-5 w-5 text-white" />
                                          </button>
                                      </div>
                                  )}
                              </Col>
                              <Col xs={9} md={3}>
                                  <p className="text-sm text-gray-600"><strong>Stakeholders: </strong> 
                                      {selectedDocument.stakeHolders.map(sh => sh.name).join(' / ')}
                                  </p>
                                  <p className="text-sm text-gray-600"><strong>Scale: </strong> 
                                      {selectedDocument.scale}
                                  </p>
                                  <p className="text-sm text-gray-600"><strong>Issuance Date: </strong> 
                                      {selectedDocument.issuanceDate}
                                  </p>
                                  <p className="text-sm text-gray-600"><strong>Type: </strong> 
                                      {selectedDocument.type}
                                  </p>
                                  <p className="text-sm text-gray-600"><strong>Language: </strong> 
                                      {selectedDocument.language ? selectedDocument.language : '-'}
                                  </p>
                                  <p className="text-sm text-gray-600"><strong>Pages:</strong> 
                                      {selectedDocument.pages ? selectedDocument.pages : '-'}
                                  </p>
                                                                    
                              </Col>
                              <Col xs={12} md={7}>
                                  <p><strong>Description:</strong></p>
                                  <p>{selectedDocument.description ? selectedDocument.description : '-'}</p>
                              </Col>
                          </Row>
                      </div>

                  </Container>
              </Modal.Body>
              <Modal.Footer style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                  <button 
                      onClick={() => navigate(`/documents/${selectedDocument.id}/links`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                  >
                      View connections
                  </button>
              </Modal.Footer>
          </Modal>
          
          {showModalEditGeoreference && documentsCoordinates &&
            <ModalEditGeoreference
              document={selectedDocument}
              documentCoordinates={documentsCoordinates}
              
              refreshDocuments={refreshDocuments}

              onClose={() => setShowModalEditGeoreference(false)}
              
            />
          }

      </>
  );
}



function AddNewDocumentLinksModal({ document,show, onHide, refreshDocuments, docs}: AddNewDocumentLinksModalProps) {
    const [typesLink, setTypesLink] = useState<Link[]>([]); // vector of types of links
    const [documents, setDocuments] = useState<Document[]>(docs.filter((d: Document) => d.id != document.id)); // vector of all documents except one

    const [selectedDocument, setSelectedDocument] = useState<number | null>(null); // Selected document
    const [selectedTypeLink, setSelectedTypeLink] = useState<number | null>(null); // Selected type of link

    const [selectedDocumentName, setSelectedDocumentName] = useState<string>(''); // Selected document
    const [selectedTypeLinkName, setSelectedTypeLinkName] = useState<string>(''); // Selected type of link
    const [alertMessage, setAlertMessage] = useState<string>(''); // Selected type of link

    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showDocumentDropdown, setShowDocumentDropdown] = useState(false); // State to show document dropdown
    const [showTypeLinkDropdown, setShowTypeLinkDropdown] = useState(false); // State to show type link dropdown

    type DocumentLink = {
      documentName: string;
      documentId: number | null;
      linkId: number | null;
      linkName: string;
    };
    
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocumentLink[]>([]);
    const itemsPerPage = 3; // Number of items to show per page

    // Calculate total pages
    const totalPages = Math.ceil(documentLinks.length / itemsPerPage);


    // Handle pagination button clicks
    const handleNextPage = () => {
     if (currentPage < totalPages) {
       console.log(paginatedLinks)
       setPaginatedLinks(documentLinks.slice(
        (currentPage) * itemsPerPage, 
        (currentPage + 1) * itemsPerPage
      ))
       setCurrentPage(currentPage + 1);
     }
    };

    const handlePrevPage = () => {
     if (currentPage > 1) {
      setPaginatedLinks(documentLinks.slice(
        (currentPage - 2) * itemsPerPage, 
        (currentPage - 1) * itemsPerPage
      ))
       setCurrentPage(currentPage - 1);
     }
    };

    useEffect(() => {
      const getTypesLink = async () => {
          try {
              const types = await API.getAllLinks();
              setTypesLink(types);
          } catch (err) {
              setShowAlert(true);
          }
      };

      getTypesLink().then();
      
  }, []);

  useEffect(() => {
    // Check if we need to update the current page
    const isLastPage = totalPages < currentPage;

    // If the current page is the last page and we're deleting the last link on it, go to the previous page
    if (isLastPage && currentPage > 1) {
      setPaginatedLinks(documentLinks.slice(
        (currentPage - 2) * itemsPerPage, 
        (currentPage - 1) * itemsPerPage
      ))
      setCurrentPage(prevPage => prevPage - 1); // Decrement the page
    }else{
      setPaginatedLinks(documentLinks.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
      ))
    }
    
  }, [documentLinks]);

  // Handle document selection
  const handleDocumentChange = (id: number,title: string) => {
      setSelectedDocument(id);
      setSelectedDocumentName(title);
      setShowDocumentDropdown(false); // Close dropdown after selection
  };

  // Handle type link selection
  const handleTypeLinkChange = (id: number,typeName: string) => {
      setSelectedTypeLink(id);
      setSelectedTypeLinkName(typeName);
      setShowTypeLinkDropdown(false); // Close dropdown after selection

  };

  const handleAdd = () => {
    if (!selectedDocument || !selectedTypeLink) {
      setShowAlert(true);
      setAlertMessage('Please fill in the mandatory fields marked with the red star (*). ')
      return; // Prevent submission if there are errors
    }
    if(documentLinks.some(link => link.documentId === selectedDocument && link.linkId === selectedTypeLink)){
      setAlertMessage('Sorry, the connection already exists...')
      setShowAlert(true);
      return; // Prevent submission if there are errors
    }
    setDocumentLinks(prevLinks => [
      ...prevLinks,
      {
        documentName: selectedDocumentName,
        documentId: selectedDocument,
        linkId: selectedTypeLink,
        linkName: selectedTypeLinkName
      }
    ]);
    setSelectedDocument(null)
    setSelectedTypeLink(null)
    setSelectedDocumentName('')
    setSelectedTypeLinkName('')
  };

  const handleLink = () => {
    // Check for errors
    if (documentLinks.length === 0) {
      setAlertMessage('Choose documents to link before linking')
      setShowAlert(true);
      return; // Prevent submission if there are errors
    }
     console.log(document)
    try{
      // Implement API call to add link
      documentLinks.forEach(async link => {
        if(link.documentId && link.linkId){
        await API.addLink(document.id, link.documentId, link.linkId);
        }
        console.log(link); // This will log each link object to the console
      });

      onHide();
      refreshDocuments();
      setSelectedDocument(null)
      setSelectedTypeLink(null)
      setSelectedDocumentName('')
      setSelectedTypeLinkName('')
      setDocumentLinks([])
  }catch(err){
      setShowAlert(true);
      setAlertMessage('Something went wrong...')
  }
};

 const confirmDelete = (documentId:number | null, linkId: number | null) => {
  setDocumentLinks(prevLinks => 
    prevLinks.filter(link => !(link.documentId === documentId && link.linkId === linkId))
  );
  console.log(documentLinks);
 };

 const handleClose = () => {

    onHide();
    refreshDocuments();
    setSelectedDocument(null)
    setSelectedTypeLink(null)
    setSelectedDocumentName('')
    setSelectedTypeLinkName('')
    setDocumentLinks([])
   
  };


  return (
      <>
      <Modal show={show} onHide={handleClose}  dialogClassName="custom-modal-width" aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton style={{backgroundColor: 'rgb(148, 137, 121,0.4)'}}>
          <Modal.Title id="example-custom-modal-styling-title">
            Would you like to add links to the new document?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: 'rgb(148, 137, 121,0.2)'}}>
          <Container>
            <Row>
              <Col xs={12} md={4}>
                <div className=" flex items-center justify-center" style={{backgroundColor: 'rgb(148, 137, 121,0.2)'}}>
                  {showAlert &&
                    <Alert
                        message={alertMessage}
                        onClose={() => {
                            setShowAlert(false);
                        }}
                    />
                  }
                  <div className="rounded-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">Add New Link</h2>
                    {/* Separator Line */}
                    <hr className="border-gray-300 my-4" />

                    {/* Document Selection Dropdown */}
                    <div className="relative mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        <b>1.</b> Select Document <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                            onClick={() => {
                                setShowDocumentDropdown(!showDocumentDropdown);
                                setShowTypeLinkDropdown(false); // Close types of link dropdown
                            }}
                            className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none border-gray-300}`}
                        >
                          <span>
                              {selectedDocument
                                  ? documents.find(doc => doc.id === selectedDocument)?.title || 'Select a document'
                                  : 'Select a document'}
                          </span>
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        </button>

                        {showDocumentDropdown && (
                          <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10 animate-dropdown-open">
                            {documents.length === 0 ? (
                              <div className="p-2 text-gray-500">No documents available</div>
                            ) : (
                              documents.map((document) => (
                                <label
                                  key={document.id}
                                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleDocumentChange(document.id,document.title)}
                                >
                                  <span className="text-gray-700">{document.title}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type of Link Selection Dropdown */}
                    <div className="relative mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        <b>2.</b> Select Link Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => {
                              if(selectedDocument){
                                  setShowTypeLinkDropdown(!showTypeLinkDropdown);
                                  setShowDocumentDropdown(false); // Close document dropdown
                              }
                          }}
                          className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none border-gray-300}`}
                          style={{ backgroundColor: !selectedDocument ? 'gray' : 'white' }} // Change background color based on document selection
                        >
                          <span>
                              {selectedTypeLink
                                  ? typesLink.find(type => type.id === selectedTypeLink)?.name || 'Select a type'
                                  : 'Select a type'}
                          </span>
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        </button>

                        {showTypeLinkDropdown && (
                          <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10 animate-dropdown-open">
                            {typesLink.length === 0 ? (
                                <div className="p-2 text-gray-500">No types available</div>
                              ) : (
                                typesLink.map((type) => (
                                    <label
                                      key={type.id}
                                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => handleTypeLinkChange(type.id,type.name)}
                                    >
                                      <span className="text-gray-700">{type.name}</span>
                                    </label>
                                ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="bg-blue-950 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                        onClick={handleAdd}
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={8}>
                {/* Tabella visibile solo su schermi grandi */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-4 text-left text-gray-600 font-semibold">Title</th>
                        <th className="p-4 text-left text-gray-600 font-semibold">Type of Link</th>
                        <th className="p-4 text-center text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLinks.map((doc, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
                          <td className="p-4">{doc.documentName}</td>
                          <td className="p-4">{doc.linkName}</td>
                            <td className="p-4 flex justify-center space-x-4">
                              <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc.documentId, doc.linkId)}>
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card view visibile solo su schermi piccoli */}
                <div className="block md:hidden">
                  {paginatedLinks.map((doc, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{doc.documentName}</h3>
                          <p className="text-sm text-gray-600"><strong>Type of link:</strong> {doc.linkName}</p>
                        </div>
                      </div>
                        <div className="mt-4 flex justify-end">
                          <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc.documentId, doc.linkId)}>
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                      <div className="flex justify-center space-x-4 mt-4">
                       <button onClick={handlePrevPage}
                         className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                         disabled={currentPage === 1}
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-gray-700 mt-2">Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage}
                         className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                         disabled={currentPage === totalPages}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
          <Button variant="secondary" className="text-white rounded-md" onClick={handleClose}>
              Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleLink} style={{borderColor: 'white'}}>
              Link
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export { AddDocumentModal, ShowDocumentInfoModal, EditDocumentModal, AddNewDocumentLinksModal };
