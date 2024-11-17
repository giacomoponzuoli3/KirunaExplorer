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
import { TrashIcon, PencilIcon,ChevronLeftIcon,ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from '../models/link'; 
import Alert from "./Alert";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';
import ISO6391 from 'iso-639-1';  // Utilizziamo ISO 639-1 per ottenere le lingue
import { DocCoordinates } from '../models/document_coordinate';
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



/* ------------ Interfaces -------- */

interface AddDocumentModalProps {
    show: boolean;
    onHide: () => void;
    refreshDocuments: () => void;
    stakeholders: Stakeholder[];
    showGeoreferenceNewDocumentModal: (doc: Document) => void;
}

interface TruncatedTextProps {
  text: string;
  maxLength: number;
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


export { AddDocumentModal };
