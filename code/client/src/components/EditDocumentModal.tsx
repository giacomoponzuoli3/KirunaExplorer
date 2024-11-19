import React, { useState,useEffect } from 'react';
import { Container, Modal, Row, Col, Form, Button, Dropdown, ListGroup } from 'react-bootstrap';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';
import '../modal.css'
import Alert from "./Alert";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';
import ISO6391 from 'iso-639-1';
import CreatableSelect from 'react-select/creatable';
import { SingleValue } from 'react-select';

interface RequiredLabelProps {
    text: string; // Explicitly define the type of 'text' as string
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ text }) => (
    <span>
        {text} <span style={{ color: 'red' }}>*</span>
    </span>
);

interface EditDocumentModalProps {
    document: Document;
    show: boolean;
    onHide: () => void;
    refreshSelectedDocument: (doc: Document) => void;
    stakeholders: Stakeholder[]
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

    const scaleOptions = [
        { value: '1:1000', label: '1:1000' },
        { value: '1:2000', label: '1:2000' },
        { value: '1:5000', label: '1:5000' },
        { value: '1:7500', label: '1:7500' },
        { value: '1:10000', label: '1:10000' },
      ];
  
    const handleScale = (selectedOption: SingleValue<{ value: string; label: string }>) => {
    setScale(selectedOption ? selectedOption.value : '');
    };
    
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
                                        <CreatableSelect
                                            isClearable
                                            options={scaleOptions}
                                            value={scale ? { value: scale, label: scale } : null}
                                            onChange={handleScale}
                                            placeholder="Select or type a scale..."
                                            formatCreateLabel={(inputValue) => `Use custom scale: "${inputValue}"`}
                                            styles={{
                                                control: (base) => ({
                                                ...base,
                                                borderColor: 'rgba(0, 0, 0, 0.2)',
                                                }),
                                            }}
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
export {EditDocumentModal}