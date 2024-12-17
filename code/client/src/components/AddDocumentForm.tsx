import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API/API';
import { Stakeholder } from '../models/stakeholder';
import '../modal.css'
import Alert from "./Alert";
import Select from 'react-select';
import ISO6391 from 'iso-639-1';  // Utilizziamo ISO 639-1 per ottenere le lingue
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



/* ------------ Interfaces -------- */

interface AddDocumentFormProps {
    document: DocCoordinates | null
    setMode: (mode: string) => void;
    setDocument: (stakeholders: DocCoordinates) => void;
    stakeholders: Stakeholder[];
    scaleOptions: { value: string; label: string }[];
    typeOptions: { value: string; label: string }[];
    onCreateScale: (inputValue: string) => Promise<void>;
    onCreateType: (inputValue: string) => Promise<void>;
    handleNextStep: () => void;
    handlePrevStep: () => void;
    handleClose: () => void;
}


function AddDocumentForm({document,handleClose,handlePrevStep,setMode,setDocument,stakeholders, scaleOptions, onCreateScale, typeOptions, onCreateType, handleNextStep}: AddDocumentFormProps) {
    const [title, setTitle] = useState(document ? document.title : '');
    const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>(document ? document.stakeHolders : []);
    const [scale, setScale] = useState(document ? document.scale : '');
    const [issuanceDate, setIssuanceDate] = useState(document ? document.issuanceDate : '');
    const [type, setType] = useState(document ? document.type : '');
    const [language, setLanguage] = useState<string | null>(document ? document.language : null);
    const [pages, setPages] = useState<string | null>(document ? document.pages : null);
    const [description, setDescription] = useState(document ? document.description : '');
    
    const [addingOther, setAddingOther] = useState(false); 
    const [newStakeholderName, setNewStakeholderName] = useState('');


    const [showAlert, setShowAlert] = useState(false); // alert state
    const [alertMessage, setAlertMessage] = useState('');

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [docInfoMode, setDocInfoMode] = useState(document ? "additionalInfo" : 'basicInfo');

   

    const toggleSelect = (option: Stakeholder) => {
      setSelectedStakeholders((prevSelectedStakeholders: Stakeholder[]) => {
        const alreadySelected = prevSelectedStakeholders.some(
          (item) => item.name === option.name
        );
        return alreadySelected
          ? prevSelectedStakeholders.filter((item) => item.name !== option.name) // Rimuovi se già selezionato
          : [...prevSelectedStakeholders, option]; // Aggiungi altrimenti
      });
    };

    const handleSubmitBasicInfo = async () => {
          // Validation check
          if (!title || selectedStakeholders.length === 0 || !scale || !issuanceDate || !type 
              || title.trim() === '' || scale.trim() === '') {
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
          setDocInfoMode('additionalInfo');
          handleNextStep();
        };

        const handleSubmitAdditionalInfo = async () => {
            // Validation check
            if (description.trim() === '') {
                setAlertMessage("Please fill in the mandatory fields marked with the red star (*).")
                setShowAlert(true);
                return; // Exit the function early
            }
        
            const pagesRegex = /^\d+(-\d+)*$/;
      
            if(pages){
              if (!pagesRegex.test(pages)) {
               setAlertMessage("Invalid pages format. Please use a single number or multiple numbers separated by '-'.");
               setShowAlert(true);
               return; // Exit the function early if the format is invalid
              }
      
            }
            setDocument(new DocCoordinates(0,title,selectedStakeholders,scale,issuanceDate,type, language, pages, description,[]));
            setMode('resources');
            handleNextStep();
        };
  
  
      // Ottieni tutte le lingue disponibili da ISO 639-1
      const languageOptions = ISO6391.getAllCodes().map(code => ({
        value: code,
        label: ISO6391.getName(code),
      }));
    

    const handleScale = (selectedOption: SingleValue<{ value: string; label: string }>) => {
      setScale(selectedOption ? selectedOption.value : '');
    };

    const handleType = (selectedOption: SingleValue<{ value: string; label: string }>) => {
      setType(selectedOption ? selectedOption.value : '');
    };

    return (
        <>
          {/* Alerts */}
          {showAlert && (
                <Alert
                    message={alertMessage}
                    onClose={() => {setShowAlert(false); setAlertMessage('')}}
                />
          )}
          {docInfoMode === 'basicInfo' ? (
            <>
            <div className="flex-grow px-6 py-4 space-y-6">
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
                      onCreateOption={onCreateType}
                      placeholder="Select or type a type..."
                      formatCreateLabel={(inputValue) => `Add a new type: "${inputValue}"`}
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
            </form>
          </div>
          <div className="flex justify-end space-x-4">
            <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
            onClick={handleSubmitBasicInfo}
          >
            Next
          </button>
          </div>
            </>
           ) : docInfoMode === 'additionalInfo' ? (
            <>
            <div className="flex-grow px-6 py-4 space-y-6">
            <form className="space-y-6"> 
                
              {/* Section 5: Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Additional information</h3>
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
          <div className="flex justify-end space-x-4">
            <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={() => {setDocInfoMode('basicInfo'); handlePrevStep();}}
          >
            Back
          </button>
          <button
            className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
            onClick={handleSubmitAdditionalInfo}
          >
            Next
          </button>
          </div>
            </>
           ) : null}
          

          </>
    );
}


export { AddDocumentForm };