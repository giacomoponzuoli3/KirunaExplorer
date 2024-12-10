
import { useState } from 'react';
import { Container, Modal, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../../../common_models/user';
import API from '../API/API';
import '../modal.css'
import { TrashIcon, PencilIcon} from "@heroicons/react/24/outline";
import { DocCoordinates } from '../models/document_coordinate';
import { useNavigate } from 'react-router-dom';
import { ModalEditGeoreference } from './ModalEditGeoreference';
import ConfirmModal from './ConfirmModal';
import { EditDocumentModal } from './EditDocumentModal';
import { Stakeholder } from '../models/stakeholder';


interface ShowDocumentInfoModalProps {
    selectedDocumentCoordinates: DocCoordinates;
    show: boolean;
    onHide: () => void;
    getDocumentIcon: (type: string, size: number) => JSX.Element | null;
    user: User;
    refreshDocumentsCoordinates: () => void;
    geoJsonData: any
    scaleOptions: { value: string; label: string }[];
    onCreateScale: (inputValue: string) => Promise<void>;
    stakeholders: Stakeholder[];
    refreshSelectedDocument: (doc: DocCoordinates) => void;
}

function ShowDocumentInfoModal({ 
    geoJsonData, getDocumentIcon, selectedDocumentCoordinates, 
    refreshDocumentsCoordinates, show, onHide, user, 
    scaleOptions, onCreateScale, stakeholders, refreshSelectedDocument 
   }: ShowDocumentInfoModalProps) {

    const navigate = useNavigate();  
  
    const [showModalEditGeoreference, setShowModalEditGeoreference] = useState<boolean>(false);
    const [showModalConfirmDelete, setShowModalConfirmDelete] = useState<boolean>(false);
    const [showEditDocumentModal, setShowEditDocumentModal] = useState<boolean>(false);

    const handleEditClick = () => {
        setShowEditDocumentModal(true);
    };

    const handleEditGeoreference = () => {
        
        if(selectedDocumentCoordinates.coordinates.length !== 0){
          setShowModalEditGeoreference(true);
        }
    
    };

    const onBack = () => {
        setShowModalEditGeoreference(false);
    }
  
    const handleDeleteClick = async () => {
        try{
            await API.deleteDocument(selectedDocumentCoordinates.id).then();
            refreshDocumentsCoordinates();
        }catch(err){

        }finally{
            onHide();
        }
    };

    const confirmDelete = () => {
        setShowModalConfirmDelete(true);
    };

    if (!show) return null;
  
    return (
        <>
            <div className="custom-side-modal">
            <div className="modal-header">
                <h2>
                    {`${selectedDocumentCoordinates.title} (${selectedDocumentCoordinates.id})`}
                </h2>
                <button onClick={onHide} className="close-btn">
                    &times;
                </button>
            </div>
            <div className="modal-body">
              <Row>
                <Col>
                <div className="icon-section">
                    {getDocumentIcon(selectedDocumentCoordinates.type, 16)}
                </div>
                {user.role === "Urban Planner" && (
                    <div className="action-buttons">
                        <button
                            title="Delete document"
                            className="btn-action bg-red-400 hover:bg-red-700"
                            onClick={confirmDelete}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                            title="Edit document"
                            className="btn-action bg-blue-400 hover:bg-blue-700"
                            onClick={handleEditClick}
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            title="Edit document's georeference"
                            className="btn-action bg-yellow-500 hover:bg-yellow-600"
                            onClick={handleEditGeoreference}
                        >
                            <img
                                src="/img/editMap-icon-white.png"
                                alt="Edit Map"
                                className="h-5 w-5"
                            />
                        </button>
                    </div>
                )}
                </Col>
                <Col>
                <div className="details">
                    <p><strong>Stakeholders:</strong> {selectedDocumentCoordinates.stakeHolders.map(sh => sh.name).join(' / ')}</p>
                    <p><strong>Scale:</strong> {selectedDocumentCoordinates.scale}</p>
                    <p><strong>Issuance Date:</strong> {selectedDocumentCoordinates.issuanceDate}</p>
                    <p><strong>Type:</strong> {selectedDocumentCoordinates.type}</p>
                    <p><strong>Language:</strong> {selectedDocumentCoordinates.language || '-'}</p>
                    <p><strong>Pages:</strong> {selectedDocumentCoordinates.pages || '-'}</p>
                </div>
                </Col>
                </Row>
                <Row>
                    <div className='description'>
                        <p><strong>Description:</strong> {selectedDocumentCoordinates.description}</p>  
                    </div>
                </Row>
            </div>
            
            <div className="modal-footer">
                <button
                    onClick={() => navigate(`/${selectedDocumentCoordinates.id}/links`)}
                    className="btn-footer"
                >
                    View connections
                </button>
                <button
                    onClick={() =>
                        navigate(`documents/${selectedDocumentCoordinates.id}/resources`, { state: { from: "/documents" } })
                    }
                    className="btn-footer"
                >
                    View resources
                </button>
            </div>
        </div>

            {showModalEditGeoreference && selectedDocumentCoordinates.coordinates.length !== 0 &&
                <ModalEditGeoreference
                    documentCoordinates={selectedDocumentCoordinates}
                    mode={"edit"}
                    geoJsonData={geoJsonData}
                    refreshDocumentsCoordinates={refreshDocumentsCoordinates}
                    onClose={() => {
                        
                        refreshDocumentsCoordinates();
                        setShowModalEditGeoreference(false)
                        onHide()
                    }}

                    onBack = {onBack}

                />
            }

             <EditDocumentModal 
                document={selectedDocumentCoordinates} show={showEditDocumentModal} 
                onHide={() => {setShowEditDocumentModal(false);}} 
                refreshSelectedDocument={refreshSelectedDocument}
        
                stakeholders={stakeholders}
                scaleOptions={scaleOptions}
                onCreateScale={onCreateScale}
              />


            <ConfirmModal
                show={showModalConfirmDelete}
                onHide={() => setShowModalConfirmDelete(false)}
                onConfirm={handleDeleteClick}
                text={`Are you sure you want to delete this document?
                This action cannot be undone.`}
            />
        </>
    );
}

export {ShowDocumentInfoModal}