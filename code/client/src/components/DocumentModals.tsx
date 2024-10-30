import { ChangeEvent, useState } from 'react';
import { Container, Modal, Row, Col, Form, Button, Dropdown, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../models/user';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';

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
            <Modal.Header closeButton style={{ backgroundColor: 'rgb(250, 250, 210, 0.8)' }}>
                <Modal.Title id="example-modal-sizes-title-lg">Add New Document</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: 'rgb(250, 250, 210, 0.2)' }}>
                <Container>
                {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
                    <Form>
                        <Row className="mb-3">
                        <Col sm="8">
                            <Form.Group as={Col} controlId="formTitle">
                                <Form.Label><RequiredLabel text="Title" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>
                            </Col>
                            <Col className="mt-4" sm="4"> 
                              <Dropdown className="mt-2">
                                <Dropdown.Toggle variant="success" id="dropdown-basic"><RequiredLabel text="Choose Stakeholders" /></Dropdown.Toggle>
                                   <Dropdown.Menu>
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
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formScale">
                                <Form.Label><RequiredLabel text="Scale" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={scale}
                                    onChange={(e) => setScale(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formIssuanceDate">
                                <Form.Label> <RequiredLabel text="Issuance Date" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={issuanceDate}
                                    onChange={(e) => setIssuanceDate(e.target.value)}
                                />
                            </Form.Group>
                            <Col className="mt-4">
                            <Dropdown className="mt-2">
                              <Dropdown.Toggle id="dropdown-button-dark-example1" className="bg-gradient-to-r from-orange-400 to-yellow-500" style={{borderColor: 'white'}}>
                                  {type ? type : <RequiredLabel text="Choose a type" />}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                  <Dropdown.Item key={0} eventKey={"Informative document"} onClick={() => {setType("Informative document")}}>
                                      Informative document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={1} eventKey={"Prescriptive document"} onClick={() => {setType("Prescriptive document")}}>
                                      Prescriptive document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={2} eventKey={"Design document"} onClick={() => {setType("Design document")}}>
                                      Design document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={3} eventKey={"Technical document"} onClick={() => {setType("Technical document")}}>
                                      Technical document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={4} eventKey={"Material effect"} onClick={() => {setType("Material effect")}}>
                                       Material effect
                                  </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description || ''}
                                    onChange={(e) => setDescription(e.target.value ? e.target.value : null)}
                                />
                            </Form.Group>
                            <Col>
                            <Form.Group as={Row} controlId="formLanguage" className="mb-3 mt-4">
                                <Form.Label column sm="3">Language</Form.Label>
                                <Col sm="9">
                                <Form.Control
                                    type="text"
                                    value={language || ''}
                                    onChange={(e) => setLanguage(e.target.value ? e.target.value : null)}
                                />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPages" className="mb-3">
                                <Form.Label column sm="3">Pages</Form.Label>
                                <Col sm="9">
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
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button className="bg-gradient-to-r from-orange-400 to-yellow-500" onClick={handleSubmit} style={{borderColor: 'white'}}>
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
}

function EditDocumentModal({ document, show, onHide, refreshSelectedDocument }: EditDocumentModalProps) {
    const [title, setTitle] = useState(document.title);
    const [stakeHolders, setStakeHolders] = useState(document.stakeHolders);
    const [scale, setScale] = useState(document.scale);
    const [issuanceDate, setIssuanceDate] = useState(document.issuanceDate);
    const [type, setType] = useState(document.type);
    const [language, setLanguage] = useState<string | null>(document.language);
    const [pages, setPages] = useState<string | null>(document.pages);
    const [description, setDescription] = useState<string | null>(document.description);
    const [error, setError] = useState<string | null>(null); // State for error messages

    const handleSubmit = () => {
        console.log("Title: " + title + " Stakeholders: " + stakeHolders + " Issuance Date: " + issuanceDate)
        console.log("Scale: "+ scale + " Type: " + type + " Language: " + language + " Pages: " + pages)
        console.log("Description: " + description)
        // Validation check
        if (!title || !stakeHolders || !scale || !issuanceDate || !type) {
            setError('Please fill in the mandatory fields marked with the red star (*).'); // Set error message
            return;
        }
        //API call to edit a document
        //API.editDocument(document.id, title, stakeHolders, scale, issuanceDate, type, language, pages, description);
        refreshSelectedDocument(new Document(document.id, title, stakeHolders, scale, issuanceDate, type, language, pages, description));
        onHide();
    };

    return (
        <Modal size="lg" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
            <Modal.Header closeButton style={{ backgroundColor: 'rgb(250, 250, 210, 0.8)' }}>
                <Modal.Title id="example-modal-sizes-title-lg">Edit Document</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: 'rgb(250, 250, 210, 0.2)' }}>
                <Container>
                {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formTitle">
                                <Form.Label><RequiredLabel text="Title" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>
                            {/*<Form.Group as={Col} controlId="formStakeholders">
                                <Form.Label><RequiredLabel text="Stakeholders" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={stakeHolders}
                                    onChange={(e) => setStakeHolders(e.target.value)}
                                />
                            </Form.Group>*/}
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formScale">
                                <Form.Label><RequiredLabel text="Scale" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={scale}
                                    onChange={(e) => setScale(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formIssuanceDate">
                                <Form.Label> <RequiredLabel text="Issuance Date" /></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={issuanceDate}
                                    onChange={(e) => setIssuanceDate(e.target.value)}
                                />
                            </Form.Group>
                            <Col className="mt-4">
                            <Dropdown className="mt-2">
                              <Dropdown.Toggle id="dropdown-button-dark-example1" className="bg-gradient-to-r from-orange-400 to-yellow-500" style={{borderColor: 'white'}}>
                                  {type ? type : <RequiredLabel text="Choose a type" />}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                  <Dropdown.Item key={0} eventKey={"Informative document"} onClick={() => {setType("Informative document")}}>
                                      Informative document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={1} eventKey={"Prescriptive document"} onClick={() => {setType("Prescriptive document")}}>
                                      Prescriptive document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={2} eventKey={"Design document"} onClick={() => {setType("Design document")}}>
                                      Design document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={3} eventKey={"Technical document"} onClick={() => {setType("Technical document")}}>
                                      Technical document
                                  </Dropdown.Item>
                                  <Dropdown.Item key={4} eventKey={"Material effect"} onClick={() => {setType("Material effect")}}>
                                       Material effect
                                  </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description || ''}
                                    onChange={(e) => setDescription(e.target.value ? e.target.value : null)}
                                />
                            </Form.Group>
                            <Col>
                            <Form.Group as={Row} controlId="formLanguage" className="mb-3 mt-4">
                                <Form.Label column sm="3">Language</Form.Label>
                                <Col sm="9">
                                <Form.Control
                                    type="text"
                                    value={language || ''}
                                    onChange={(e) => setLanguage(e.target.value ? e.target.value : null)}
                                />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPages" className="mb-3">
                                <Form.Label column sm="3">Pages</Form.Label>
                                <Col sm="9">
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
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button className="bg-gradient-to-r from-orange-400 to-yellow-500" onClick={handleSubmit} style={{borderColor: 'white'}}>
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
}

function ShowDocumentInfoModal({ getDocumentIcon,selectedDocument,show, onHide, user, handleEdit, refreshDocuments}: ShowDocumentInfoModalProps) {
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
        <Modal size="lg" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
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
            {user.role==="Urban Planner" ?(
                <>
                    <Button className="bg-gradient-to-r from-orange-400 to-yellow-500 mt-4" onClick={handleEditClick} style={{borderColor: 'white'}}>
                        Edit
                    </Button>
                    <Button className="bg-gradient-to-r from-red-600 to-red-400 mt-4" onClick={handleDeleteClick} style={{borderColor: 'white'}}>
                        Delete
                    </Button>
                </>
            ): null}
            </Col>
            <Col xs={9} md={5}>
            <p>Stakeholders: {selectedDocument.stakeHolders.map(sh => sh.name).join(' / ')}</p>
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
      </>
    );
}

export { AddDocumentModal, ShowDocumentInfoModal, EditDocumentModal };
