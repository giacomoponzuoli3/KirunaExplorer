import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Stakeholder } from '../models/stakeholder';
import '../modal.css'
// Utilizziamo ISO 639-1 per ottenere le lingue
import { AddDocumentForm } from './AddDocumentForm';
import { DocCoordinates } from '../models/document_coordinate';
import { LatLng } from 'leaflet';
import { GeoreferenceNewDocumentModal } from './GeoreferenceNewDocumentModal';
import { AddNewDocumentLinksModal } from './AddNewDocumentLinksModal';
import { AddResources } from './AddResources';
import { Stepper } from './Stepper';

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
    stakeholders: Stakeholder[];
    refreshDocumentsCoordinates: () => void;
    documentsCoordinates: DocCoordinates[];
    scaleOptions: { value: string; label: string }[];
    typeOptions: { value: string; label: string }[];
    onCreateScale: (inputValue: string) => Promise<void>;
    onCreateType: (inputValue: string) => Promise<void>;
}


function AddDocumentModal({ show, onHide, stakeholders,refreshDocumentsCoordinates,documentsCoordinates, scaleOptions, onCreateScale, typeOptions, onCreateType}: AddDocumentModalProps) {

    const [document, setDocument] = useState<DocCoordinates | null>(null);
    const [newDocumentCoordinates, setNewDocumentCoordinates] = useState<LatLng | LatLng[] | null>(null);
    const [files, setFiles] = useState<File[]>([]);//Resources of newDocument
    const [mode, setMode] = useState('docInfo');
    const steps = [
      'Basic Information',
      'Additional Information',
      'Resources',
      'Georeference',
      'Links',
    ];

    const [activeStep, setActiveStep] = useState(0);


    const handleClose = () => {
        setMode('docInfo');
        setActiveStep(0);
        setDocument(null);
        setNewDocumentCoordinates(null);
        setFiles([]);
        onHide();
    };


    const handleNextStep = () => {
        if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
    };

    const handlePrevStep = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };
  

    return (
      <Modal size="xl" show={show} onHide={handleClose} aria-labelledby="example-modal-sizes-title-lg">
        <Modal.Header closeButton className="bg-gray-100">
          <Modal.Title id="example-modal-sizes-title-lg" className="text-2xl font-bold text-gray-800">
            Add New Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white min-vh-100">
          {/* Stepper */}
          <Stepper steps={steps} activeStep={activeStep} />
            {mode ==='docInfo' ?(
              <AddDocumentForm 
              document={document}
              setMode = {(mode: string) => setMode(mode)}
              setDocument = {(document: DocCoordinates) => setDocument(document)}
              stakeholders={stakeholders}
              scaleOptions={scaleOptions}
              typeOptions={typeOptions}
              onCreateScale={onCreateScale}
              onCreateType={onCreateType}
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
              handleClose={handleClose}
              />
            ) : mode === 'resources' ? (
               <AddResources 
               setMode = {(mode: string) => setMode(mode)} 
               docFiles={files}
               setDocFiles = {(files: File[]) => setFiles(files)}
               handleNextStep={handleNextStep}
               handlePrevStep={handlePrevStep}
               />
            ) : mode === 'geoRef' ? (
              <GeoreferenceNewDocumentModal
                setMode = {(mode: string) => setMode(mode)} 
                setNewDocumentCoordinates = {(coordinates: LatLng | LatLng[] | null) => setNewDocumentCoordinates(coordinates)}
                handleNextStep={handleNextStep}
                handlePrevStep={handlePrevStep}
               />

            ): mode === 'links'  && document? (
              <AddNewDocumentLinksModal 
                  document={document}
                  handleClose={handleClose}
                  refreshDocumentsCoordinates={refreshDocumentsCoordinates}
                  docs={documentsCoordinates}
                  newDocumentCoordinates={newDocumentCoordinates}
                  filesUploaded={files}
                  handlePrevStep={handlePrevStep}
                  setMode = {(mode: string) => setMode(mode)}
                />

            ) : null }
        </Modal.Body>
      </Modal>
    );
}


export { AddDocumentModal };
