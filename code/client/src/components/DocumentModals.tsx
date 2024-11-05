import { ChangeEvent, useState } from 'react';
import { Container, Modal, Row, Col, Form, Button, Dropdown, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../models/user';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';
import { DocLink } from '../models/document_link';
import '../modal.css'
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface RequiredLabelProps {
    text: string; // Explicitly define the type of 'text' as string
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ text }) => (
    <span>
        {text} <span style={{ color: 'red' }}>*</span>
    </span>
);

interface AddDocumentModalProps {
    show: boolean;
    onHide: () => void;
    refreshDocuments: () => void;
    stakeholders: Stakeholder[];
}

function AddDocumentModal({ show, onHide, refreshDocuments, stakeholders}: AddDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [selectedStakeholders, setSelectedStakeholders] = useState<number[]>([]);
    const [scale, setScale] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [type, setType] = useState('');
    const [language, setLanguage] = useState<string | null>(null);
    const [pages, setPages] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); // State for error messages

    const resetForm = () => {
        setTitle('');
        setSelectedStakeholders([]);
        setScale('');
        setIssuanceDate('');
        setType('');
        setLanguage(null);
        setPages(null);
        setDescription(null);
        setError(null);
    };

    const handleClose = () => {
        onHide();
        resetForm();
    };

    console.log(stakeholders);
    const toggleSelect = (option: Stakeholder) => {
        setSelectedStakeholders((prevSelectedStakeholders) => {
            const newSelectedStakeholders = prevSelectedStakeholders.includes(option.id)
                ? prevSelectedStakeholders.filter((item) => item !== option.id) // Remove the ID
                : [...prevSelectedStakeholders, option.id]; // Add the ID
    
            console.log('Updated Stakeholders:', newSelectedStakeholders); // Log the new state
            return newSelectedStakeholders; // Return the new state
        });
    };

    const handleSubmit = () => {
        console.log("Title: " + title + " Stakeholders: " + selectedStakeholders + " Issuance Date: " + issuanceDate)
        console.log("Scale: "+ scale + " Type: " + type + " Language: " + language + " Pages: " + pages)
        console.log("Description: " + description)
        // Validation check
        if (!title || !selectedStakeholders || !scale || !issuanceDate || !type) {
            setError('Please fill in the mandatory fields marked with the red star (*).'); // Set error message
            return; // Exit the function early
        }
        //API call to add a document
        API.addDocument(title, selectedStakeholders, scale, issuanceDate, type, language, pages, description);
        refreshDocuments();
        handleClose();
        refreshDocuments();
    };

    return (
        <Modal size="lg" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
            <Modal.Header closeButton style={{ backgroundColor: 'rgba(167, 199, 231, 0.8)' }}>
        <Modal.Title id="example-modal-sizes-title-lg">Add New Document</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'rgba(167, 199, 231, 0.4)' }}>
      <Container>
          {error && <Alert variant="danger">{error}</Alert>}
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
              <Col md={6} className='mt-4'>
                 <Form.Group as={Row} controlId="formScale" className="mb-3">
                 <Form.Label column md={5}><RequiredLabel text="Scale" /></Form.Label>
                 <Col md={7}>
                   <Form.Control
                      type="text"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      style={{ width: '100%' }}/>
                  </Col>
                  </Form.Group>
                 <Form.Group as={Row} controlId="formIssuanceDate" className="mb-3">
                 <Form.Label column md={5}><RequiredLabel text="Issuance Date" /></Form.Label>
                  <Col md={7}>
                    <Form.Control
                    type="text"
                    value={issuanceDate}
                    onChange={(e) => setIssuanceDate(e.target.value)}
                    style={{ width: '100%' }}/>
                  </Col>
                  </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mt-3 ml-5">
              <Row>
                <Dropdown className="mt-2">
                  <Dropdown.Toggle variant="success" id="dropdown-basic" 
                    style={{ backgroundColor: 'rgb(164,135,121)', 
                   }}>
                    <span><RequiredLabel text="Choose Stakeholders" /></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{  width:'200px' }}>
                    {stakeholders.map((option, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => toggleSelect(option)}
                        active={selectedStakeholders.includes(option.id)}
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
                  style={{ backgroundColor: 'rgb(164,135,121)', width:'200px'}}>
                    {type ? type : <RequiredLabel text="Choose a type" />}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{  width:'200px' }}>
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
        <Form.Label>Description</Form.Label>
        <Form.Control
            as="textarea"
            rows={3}
            value={description || ''}
            onChange={(e) => setDescription(e.target.value ? e.target.value : null)}
        />
    </Form.Group>
    <Col md={6} className='mt-4'>
        <Form.Group as={Row} controlId="formLanguage" className="mb-3">
            <Form.Label column md={4}>Language</Form.Label>
            <Col md={8}>
                <Form.Control
                    type="text"
                    value={language || ''}
                    onChange={(e) => setLanguage(e.target.value ? e.target.value : null)}
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

interface EditDocumentModalProps {
    document: Document;
    show: boolean;
    onHide: () => void;
    refreshSelectedDocument: (doc: Document) => void;
    stakeholders: Stakeholder[]
}

function EditDocumentModal({ document, show, onHide, refreshSelectedDocument, stakeholders }: EditDocumentModalProps) {
    const [title, setTitle] = useState(document.title);
    const [selectedStakeholders, setSelectedStakeholders] = useState<number[]>(document.stakeHolders.map(stakeholder => stakeholder.id));
    const [scale, setScale] = useState(document.scale);
    const [issuanceDate, setIssuanceDate] = useState(document.issuanceDate);
    const [type, setType] = useState(document.type);
    const [language, setLanguage] = useState<string | null>(document.language);
    const [pages, setPages] = useState<string | null>(document.pages);
    const [description, setDescription] = useState<string | null>(document.description);
    const [error, setError] = useState<string | null>(null); // State for error messages

    const toggleSelect = (option: Stakeholder) => {
        setSelectedStakeholders((prevSelectedStakeholders) => {
            const newSelectedStakeholders = prevSelectedStakeholders.includes(option.id)
                ? prevSelectedStakeholders.filter((item) => item !== option.id) // Remove the ID
                : [...prevSelectedStakeholders, option.id]; // Add the ID
    
            console.log('Updated Stakeholders:', newSelectedStakeholders); // Log the new state
            return newSelectedStakeholders; // Return the new state
        });
    };

    const handleSubmit = () => {
        console.log("Title: " + title + " Stakeholders: " + selectedStakeholders + " Issuance Date: " + issuanceDate)
        console.log("Scale: "+ scale + " Type: " + type + " Language: " + language + " Pages: " + pages)
        console.log("Description: " + description)
        // Validation check
        if (!title || !selectedStakeholders || !scale || !issuanceDate || !type) {
            setError('Please fill in the mandatory fields marked with the red star (*).'); // Set error message
            return;
        }
        const sh: Stakeholder[] = stakeholders.filter(stakeholder =>
            selectedStakeholders.includes(stakeholder.id)
        );
        //API call to edit a document
        API.editDocument(document.id, title, selectedStakeholders, scale, issuanceDate, type, language, pages, description);

        refreshSelectedDocument(new Document(document.id, title, sh, scale, issuanceDate, type, language, pages, description));
        onHide();
    };

    return (
        <Modal size="lg" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
            <Modal.Header closeButton style={{ backgroundColor: 'rgb(167, 199, 231,0.8)' }}>
                <Modal.Title id="example-modal-sizes-title-lg">Edit Document</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: 'rgb(167, 199, 231,0.4)' }}>
            <Container>
          {error && <Alert variant="danger">{error}</Alert>}
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
              <Col md={6} className='mt-4'>
                 <Form.Group as={Row} controlId="formScale" className="mb-3">
                 <Form.Label column md={5}><RequiredLabel text="Scale" /></Form.Label>
                 <Col md={7}>
                   <Form.Control
                      type="text"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      style={{ width: '100%' }}/>
                  </Col>
                  </Form.Group>
                 <Form.Group as={Row} controlId="formIssuanceDate" className="mb-3">
                 <Form.Label column md={5}><RequiredLabel text="Issuance Date" /></Form.Label>
                  <Col md={7}>
                    <Form.Control
                    type="text"
                    value={issuanceDate}
                    onChange={(e) => setIssuanceDate(e.target.value)}
                    style={{ width: '100%' }}/>
                  </Col>
                  </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mt-3 ml-5">
              <Row>
                <Dropdown className="mt-2">
                  <Dropdown.Toggle variant="success" id="dropdown-basic" 
                    style={{ backgroundColor: 'rgb(164,135,121)', 
                   }}>
                    <span><RequiredLabel text="Choose Stakeholders" /></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{  width:'200px' }}>
                    {stakeholders.map((option, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => toggleSelect(option)}
                        active={selectedStakeholders.includes(option.id)}
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
                  style={{ backgroundColor: 'rgb(164,135,121)', width:'200px' }}>
                    {type ? type : <RequiredLabel text="Choose a type" />}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{  width:'200px' }}>
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
        <Form.Label>Description</Form.Label>
        <Form.Control
            as="textarea"
            rows={3}
            value={description || ''}
            onChange={(e) => setDescription(e.target.value ? e.target.value : null)}
        />
    </Form.Group>
    <Col md={6} className='mt-4'>
        <Form.Group as={Row} controlId="formLanguage" className="mb-3">
            <Form.Label column md={4}>Language</Form.Label>
            <Col md={8}>
                <Form.Control
                    type="text"
                    value={language || ''}
                    onChange={(e) => setLanguage(e.target.value ? e.target.value : null)}
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleSubmit} style={{borderColor: 'white'}}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

interface ShowDocumentInfoModalProps {
    selectedDocument: Document;
    show: boolean;
    onHide: () => void;
    getDocumentIcon: (type: string) => JSX.Element | null;
    user: User;
    handleEdit: () => void;
    refreshDocuments: () => void;
    documentLinks: DocLink[];
}

function ShowDocumentInfoModal({ getDocumentIcon,selectedDocument,show, onHide, user, handleEdit, refreshDocuments, documentLinks}: ShowDocumentInfoModalProps) {
    const handleEditClick = () => {
        handleEdit();
        //onHide()
    };

    const handleDeleteClick = () => {
        API.deleteDocument(selectedDocument.id);
        refreshDocuments();
        onHide()
        refreshDocuments();
    };

    return (
        <>
        <Modal show={show} onHide={onHide}  dialogClassName="custom-modal-width" aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton style={{backgroundColor: 'rgb(148, 137, 121,0.4)'}}>
          <Modal.Title id="example-custom-modal-styling-title">
            {`${selectedDocument.title} (${selectedDocument.id})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: 'rgb(148, 137, 121,0.2)'}}>
        <Container>
          <Row>
          <Col xs={3} md={2}>
                                {getDocumentIcon(selectedDocument.type)}
                                {user.role === "Urban Planner" ? (
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
                                    </div>
                                ) : null}
                            </Col>
            <Col xs={9} md={3}>
            <p>Stakeholders: {selectedDocument.stakeHolders.map(sh => sh.name).join(' / ')}</p>
            <p>Scale: {selectedDocument.scale}</p>
            <p>Issuance Date: {selectedDocument.issuanceDate}</p>
            <p>Type: {selectedDocument.type}</p>
            <p>Conections: {documentLinks.length!=0 ? documentLinks.length : '-'}</p>
            <p>Language: {selectedDocument.language ? selectedDocument.language : '-'}</p>
            <p>Pages: {selectedDocument.pages ? selectedDocument.pages : '-'}</p>
            </Col>
            <Col xs={12} md={7}>
              <p>Description:</p>
              <p>{selectedDocument.description ? selectedDocument.description : '-'}</p>
            </Col>
          </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer style={{backgroundColor: 'rgb(148, 137, 121,0.2)'}}>
        <Link to={`documents/${selectedDocument.id}/links`}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium no-underline"
              >View connections
              </Link>
        </Modal.Footer>
      </Modal>
      </>
    );
}

export { AddDocumentModal, ShowDocumentInfoModal, EditDocumentModal };
