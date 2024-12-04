import React, { useState } from 'react';
import { Modal, Dropdown } from 'react-bootstrap';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';
import '../modal.css'
import { TrashIcon, DocumentIcon } from "@heroicons/react/24/outline";
import Alert from "./Alert";
import Select from 'react-select';
import ISO6391 from 'iso-639-1';  // Utilizziamo ISO 639-1 per ottenere le lingue
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
    showGeoreferenceNewDocumentModal: (doc: Document, files: File[]) => void;
    scaleOptions: { value: string; label: string }[];
    //setScaleOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
    onCreateScale: (inputValue: string) => Promise<void>;
}


function AddDocumentModal({ show, onHide, refreshDocuments, stakeholders,showGeoreferenceNewDocumentModal, scaleOptions, onCreateScale}: AddDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
    //const [scaleOptions, setScaleOptions] = useState<{ value: string; label: string }[]>([]);
    const [scale, setScale] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [type, setType] = useState('');
    const [language, setLanguage] = useState<string | null>(null);
    const [pages, setPages] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    const [files, setFiles] = useState<File[]>([]);//resources

    const [addingOther, setAddingOther] = useState(false); 
    const [newStakeholderName, setNewStakeholderName] = useState(''); 


    const [showAlert, setShowAlert] = useState(false); // alert state
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlertErrorDate, setShowAlertErrorDate] = useState<boolean>(false);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const resetForm = () => {
        setTitle('');
        setSelectedStakeholders([]);
        setScale('');
        //setScaleOptions([]);
        setIssuanceDate('');
        setType('');
        setLanguage(null);
        setPages(null);
        setDescription('');
        setShowAlert(false);
        setFiles([]); // Clear selected files
        (document.getElementById("formFile") as HTMLInputElement).value = ""; // Reset input field
    };

    const handleClose = () => {
        onHide();
        resetForm();
    };

    const toggleSelect = (option: Stakeholder) => {
      setSelectedStakeholders((prevSelectedStakeholders) => {
        const alreadySelected = prevSelectedStakeholders.some(
          (item) => item.name === option.name
        );
        return alreadySelected
          ? prevSelectedStakeholders.filter((item) => item.name !== option.name) // Rimuovi se già selezionato
          : [...prevSelectedStakeholders, option]; // Aggiungi altrimenti
      });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files; // HTMLInputElement.files can be FileList or null
      //validation for uploadedfile
      if (fileList) {
       const oversizedFiles = Array.from(fileList).filter(file => file.size > 50 * 1024 * 1024); // 50 MB //validation for size
       const notOversizedFiles = Array.from(fileList).filter(file => file.size < 50 * 1024 * 1024);
       if (oversizedFiles.length > 0) {
        setAlertMessage(
          `The following files exceed 50 MB: ${oversizedFiles
            .map(file => file.name)
            .join(', ')}`
        );
        setShowAlert(true);
       }
        setFiles((prevFiles) =>  [...prevFiles, ...notOversizedFiles]);
      }
      
      event.target.value = '';
    };

    const handleDeleteFile = (index: number) => {
      setFiles((prevFiles) => 
        prevFiles.filter((_, i) => i !== index)
      );
    };

    const truncateFileName = (fileName: string, maxLength = 35) => {
      if (fileName.length > maxLength) {
        return fileName.substring(0, maxLength) + '...';
      }
      return fileName;
    };
  
    const handleSubmit = async () => {
      // Validation check
      if (!title || selectedStakeholders.length === 0 || !scale || !issuanceDate || !type 
          || title.trim() === '' || scale.trim() === '' || description.trim() === '') {
          setAlertMessage("Please fill in the mandatory fields marked with the red star (*).")
          setShowAlert(true);
          return; // Exit the function early
      }
  
      // Validate Issuance Date formats: "mm/yyyy", "dd/mm/yyyy", or "yyyy"
      const issuanceDateRegex = /^(0[1-9]|1[0-2])\/\d{4}$|^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}$/;
      
      if (!issuanceDateRegex.test(issuanceDate)) {
          setAlertMessage("Invalid date format. Please use one of the following formats: mm/yyyy, dd/mm/yyyy, or yyyy.")
          setShowAlert(true);
          return; // Exit the function early if the format is invalid
      }
  
      const pagesRegex = /^\d+(-\d+)?$/;

      if(pages){
        if (!pagesRegex.test(pages)) {
         setAlertMessage("Invalid pages format. Please use a single number or a page range in the format: number-number.");
         setShowAlert(true);
         return; // Exit the function early if the format is invalid
        }

        // Additional validation for range order
        const [start, end] = pages.split("-").map(Number);

        if (end !== undefined && start >= end) {
          setAlertMessage("Invalid page range. When you enter a range the first number must be less than the second.");
          setShowAlert(true);
          return; // Exit the function early if the range is invalid
        }
      }

     
      const fileNames = files.map(file => file.name);//validation for duplication file name
      const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        setAlertMessage(
          `Duplicate file names detected: ${[...new Set(duplicates)].join(', ')}. Please remove duplicates.`
        );
        setShowAlert(true);
        return; // Exit early
      }

      refreshDocuments();
      handleClose();
      refreshDocuments();
      showGeoreferenceNewDocumentModal(new Document(0,title,selectedStakeholders,scale,issuanceDate,type, language, pages, description), files);
  };

    // Ottieni tutte le lingue disponibili da ISO 639-1
    const languageOptions = ISO6391.getAllCodes().map(code => ({
      value: code,
      label: ISO6391.getName(code),
    }));
    /** 
    const scaleOptions = [
      { value: '1:1000', label: '1:1000' },
      { value: '1:2000', label: '1:2000' },
      { value: '1:5000', label: '1:5000' },
      { value: '1:7500', label: '1:7500' },
      { value: '1:10000', label: '1:10000' },
    ];*/

    const typeOptions = [
      { value: 'Informative document', label: 'Informative document' },
      { value: 'Prescriptive document', label: 'Prescriptive document' },
      { value: 'Design document', label: 'Design document' },
      { value: 'Technical document', label: 'Technical document' },
      { value: 'Material effect', label: 'Material effect' },
      { value: 'Agreement', label: 'Agreement' },
      { value: 'Conflict', label: 'Conflict' },
      { value: 'Consultation', label: 'Consultation' },
    ];


    

    const handleScale = (selectedOption: SingleValue<{ value: string; label: string }>) => {
      setScale(selectedOption ? selectedOption.value : '');
    };

    const handleType = (selectedOption: SingleValue<{ value: string; label: string }>) => {
      setType(selectedOption ? selectedOption.value : '');
    };

    return (
      <Modal size="xl" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
        <Modal.Header closeButton className="bg-gray-100">
          <Modal.Title id="example-modal-sizes-title-lg" className="text-2xl font-bold text-gray-800">
            Add New Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          <div className="px-6 py-4 space-y-6">
            {/* Alerts */}
            {showAlert && (
              <Alert
                message={alertMessage}
                onClose={() => {setShowAlert(false); setAlertMessage('')}}
              />
            )}

            <form className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
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
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Classification</h3>
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
                      onCreateOption={onCreateScale}
                      placeholder="Select or type a scale..."
                      formatCreateLabel={(inputValue) => `Add a new scale: "${inputValue}"`}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: 'rgba(0, 0, 0, 0.2)',
                        }),
                      }}
                    />
                  </div>

                  {/* Type Field */}
                  <div className="flex items-center">
                    <label htmlFor="formIssuanceDate" className="w-1/3 font-medium">
                        <RequiredLabel text="Type of document" />
                    </label>
                    <CreatableSelect
                      isClearable
                      options={typeOptions}
                      value={type ? { value: type, label: type } : null}
                      onChange={handleType}
                      placeholder="Select or type a type..."
                      formatCreateLabel={(inputValue) => `Use custom type: "${inputValue}"`}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minWidth: '300px',
                          borderColor: 'rgba(0, 0, 0, 0.2)',
                        }),
                      }}
                    />
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
                        {/* Voce "Other" */}
                        <Dropdown.Item
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingOther(true); // Mostra il campo di input
                          }}
                        >
                          Other
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

              {/* Campo di input per "Other" */}
              {addingOther && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStakeholderName}
                    onChange={(e) => setNewStakeholderName(e.target.value)}
                    placeholder="Enter stakeholder name"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                onClick={async (e) => {
                  e.preventDefault(); // Previene il comportamento predefinito
                  e.stopPropagation(); // Impedisce la propagazione dell'evento
                  if (newStakeholderName.trim()) {
                    try {
                      const response = await API.addStakeholder(newStakeholderName.trim(), newStakeholderName.trim());
                      console.log(response);
                      const newStakeholder = {
                        id: response,
                        name: newStakeholderName.trim(),
                        category: newStakeholderName.trim(),
                      };
                      toggleSelect(newStakeholder); // Seleziona il nuovo stakeholder
                      stakeholders.push(newStakeholder); // Aggiorna la lista degli stakeholders
                      setNewStakeholderName(""); // Resetta l'input
                      setAddingOther(false); // Nascondi il campo
                    } catch (error) {
                      setAlertMessage("The stakeholder name inserted already exists.")
                      setShowAlert(true);
                    }
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Add</button>

                  <button
                    onClick={() => setAddingOther(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"> Cancel
                  </button>
              </div>
            )}

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

                {/* Section 4: Resources files */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Resources</h3>

                  {/* File Upload Field */}
                  <div className="p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50">
                      <div className="space-y-2">
                          <label htmlFor="formFile" className="block text-sm font-medium text-gray-600">
                              Upload File
                          </label>
                          <input
                              type="file"
                              id="formFile"
                              multiple
                              onChange={handleFileChange}
                              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 px-2 py-2"
                          />
                      </div>

                      {/* Selected Files Section */}
                      {files.length > 0 && (
                          <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Files</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {files.map((file, index) => (
                                      <div
                                          key={index}
                                          className="flex items-center justify-between border border-gray-300 p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
                                      >
                                          {/* File Info */}
                                          <div className="flex items-center space-x-2">
                                              <DocumentIcon className="h-6 w-6 text-blue-500" />
                                              <span className="font-medium text-gray-800 truncate">
                                                  {truncateFileName(file.name,30)} ({(file.size / 1024).toFixed(2)} KB)
                                              </span>
                                          </div>

                                          {/* Delete Button */}
                                          <button
                                              type="button"
                                              className="text-red-500 hover:text-red-700 focus:outline-none"
                                              onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  handleDeleteFile(index);
                                              }}
                                          >
                                              <TrashIcon className="h-5 w-5" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
                
              {/* Section 5: Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Classification</h3>
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
                        isClearable={true}
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
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-gray-100 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
            onClick={handleSubmit}
          >
            Next
          </button>
        </Modal.Footer>
      </Modal>
    );
}


export { AddDocumentModal };
