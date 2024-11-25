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
import { DocCoordinates } from '../models/document_coordinate';

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
    refreshSelectedDocument: (doc: DocCoordinates) => void;
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
    
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showAlertErrorDate, setShowAlertErrorDate] = useState<boolean>(false);

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

        // Validate Issuance Date formats: "mm/yyyy", "dd/mm/yyyy", or "yyyy"
        const issuanceDateRegex = /^(0[1-9]|1[0-2])\/\d{4}$|^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}$/;
      
        if (!issuanceDateRegex.test(issuanceDate)) {
            setShowAlertErrorDate(true);
            return; // Exit the function early if the format is invalid
        }
        // API call to edit a document
        const doc: DocCoordinates = await API.editDocument(document.id, title, selectedStakeholders, scale, issuanceDate, type, language, pages,  description).then();
        console.log(doc)
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
        <Modal size="xl" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
            <Modal.Header closeButton className="bg-gray-100">
                <Modal.Title id="example-modal-sizes-title-lg" className="text-2xl font-bold text-gray-800">
                    Edit Document
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-white">
                <Container>
                    {/* Alerts */}
                    {showAlert &&
                        <Alert
                            message="Please fill in the mandatory fields marked with the red star (*)."
                            onClose={() => {
                                setShowAlert(false);
                            }}
                        />
                    }
                    {!showAlert && showAlertErrorDate && (
                        <Alert
                            message="Invalid date format. Please use one of the following formats: mm/yyyy, dd/mm/yyyy, or yyyy."
                            onClose={() => setShowAlertErrorDate(false)}
                        />
                    )}
                    <form className="space-y-6">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title Field */}
                            <div className="flex items-center">
                                <label htmlFor="formTitle" className="w-1/4 font-medium">
                                <RequiredLabel text="Title" />
                                </label>
                                <input
                                id="formTitle"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-2"
                                />
                            </div>

                            {/* Issuance Date Field */}
                            <div className="flex items-center">
                                <label htmlFor="formIssuanceDate" className="w-1/3 font-medium">
                                    <RequiredLabel text="Issuance Date" />
                                </label>
                                <input
                                id="formIssuanceDate"
                                type="text"
                                value={issuanceDate}
                                onChange={(e) => setIssuanceDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-2"
                                />
                            </div>
                            </div>
                        </div>
                        {/* Section 2: Classification */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Classification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Scale Field */}
                                <div className="flex items-center">
                                    <label htmlFor="formScale" className="w-1/4 font-medium">
                                        <RequiredLabel text="Scale" />
                                    </label>
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
                                </div>

                                {/* Type Field */}
                                <div>
                                    <div className="flex items-center">
                                        <label htmlFor="formIssuanceDate" className="w-1/3 font-medium">
                                            <RequiredLabel text="Type of document" />
                                        </label>
                                        <Dropdown className='w-2/3'>
                                            <Dropdown.Toggle
                                                id="dropdown-button-dark-example1"
                                                className="custom-dropdown-toggle"
                                            >
                                                {type ? type : <RequiredLabel text="Choose a type" />}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="w-full">
                                                {[
                                                'Informative document',
                                                'Prescriptive document',
                                                'Design document',
                                                'Technical document',
                                                'Material effect',
                                                'Agreement',
                                                'Conflict',
                                                'Consultation',
                                                ].map((option, index) => (
                                                <Dropdown.Item
                                                    key={index}
                                                    onClick={() => setType(option)}
                                                >
                                                    {option}
                                                </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Stakeholders */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Stakeholders</h3>
                            <div className="flex items-start gap-4">
                                {/* Dropdown compatto */}
                                <div className="w-1/2">
                                    <Dropdown
                                    show={dropdownOpen}
                                    onToggle={(isOpen) => setDropdownOpen(isOpen)}
                                    >
                                        <Dropdown.Toggle
                                            id="dropdown-basic"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="custom-dropdown-toggle"
                                        >
                                            <span>
                                            <RequiredLabel text="Choose one or more Stakeholders" />
                                            </span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="w-full">
                                            {stakeholders.map((option, index) => (
                                            <Dropdown.Item
                                                key={index}
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelect(option);
                                                }}
                                            >
                                                {option.name}
                                            </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                {/* Stakeholders selezionati, visualizzati a destra */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedStakeholders.map((stakeholder, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm shadow-sm"
                                    >
                                        {stakeholder.name}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevenire la propagazione
                                                toggleSelect(stakeholder);
                                            }}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                        > 
                                            ✕
                                        </button>
                                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Section 4: Additional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Classification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Description Field */}
                                <div className="space-y-2">
                                    <label htmlFor="formDescription" className="block text-sm font-medium text-gray-600">
                                    <RequiredLabel text="Description" />
                                    </label>
                                    <textarea
                                    id="formDescription"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 px-2 py-2"
                                    />
                                </div>

                                {/* Language and Pages */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                    <label htmlFor="formLanguage" className="block text-sm font-medium text-gray-600">
                                        Language
                                    </label>
                                    <Select
                                        options={languageOptions}
                                        value={language ? languageOptions.find((lang) => lang.value === language) : null}
                                        onChange={(selectedOption) => setLanguage(selectedOption ? selectedOption.label : null)}
                                        placeholder="Select Language"
                                        className="shadow-sm"
                                    />
                                    </div>
                                    <div className="space-y-2">
                                    <label htmlFor="formPages" className="block text-sm font-medium text-gray-600">
                                        Pages
                                    </label>
                                    <input
                                        id="formPages"
                                        type="text"
                                        value={pages || ''}
                                        onChange={(e) => setPages(e.target.value ? e.target.value : null)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 px-2 py-2"
                                    />
                                    </div>
                                </div>
                            
                            </div>
                        </div>  
                    </form>
                </Container>
            </Modal.Body>
            <Modal.Footer  className="bg-gray-100 flex justify-end space-x-4">
                <button 
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md" 
                    onClick={handleSubmit} 
                >
                    Update
                </button>
            </Modal.Footer>
        </Modal>
    );
}
export {EditDocumentModal}