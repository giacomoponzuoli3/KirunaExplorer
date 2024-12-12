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

interface AddResourcesProps {
    setMode: (mode: string) => void;
    docFiles: File[]
    setDocFiles: (files: File[]) => void;
    handleNextStep: () => void;
    handlePrevStep: () => void;
}


function AddResources({setMode,docFiles,setDocFiles, handleNextStep, handlePrevStep}: AddResourcesProps) {

    const [files, setFiles] = useState<File[]>(docFiles);//resources


    const [showAlert, setShowAlert] = useState(false); // alert state
    const [alertMessage, setAlertMessage] = useState('');



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

    

    const handleSubmitFiles = async () => {
       // Validation check
        const fileNames = files.map(file => file.name);//validation for duplication file name
        const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            setAlertMessage(
            `Duplicate file names detected: ${[...new Set(duplicates)].join(', ')}. Please remove duplicates.`
            );
            setShowAlert(true);
            return; // Exit early
        }
        setDocFiles(files);
        setMode('geoRef');
        handleNextStep();
    };

    return (
        <>
            <div className="flex-grow px-6 py-4 space-y-6">
            <form className="space-y-6"> 

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
            </form>
          </div>
          <div className="flex justify-end space-x-4">
          <p className="text-sm text-gray-600 mt-2">This step is optional. You can skip it if you don't wish to georeference the document at this time.</p>
            <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={() => {setMode('docInfo'); handlePrevStep();}}
          >
            Back
          </button>
          <button
            className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
            onClick={handleSubmitFiles}
          >
            Next
          </button>
          </div>
          </>
    );
}


export { AddResources };