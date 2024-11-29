
import { useState } from 'react';
import { Container, Modal, Row, Col } from 'react-bootstrap';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../models/user';
import API from '../API/API';
import '../modal.css'
import { TrashIcon, PencilIcon, MapIcon} from "@heroicons/react/24/outline";
import { DocCoordinates } from '../models/document_coordinate';
import { useNavigate } from 'react-router-dom';
import { ModalEditGeoreference } from './ModalEditGeoreference';
import ConfirmModal from './ConfirmModal';
import { EditDocumentModal } from './EditDocumentModal';

  
interface ShowDocumentInfoModalProps {
    selectedDocumentCoordinates: DocCoordinates;
    show: boolean;
    onHide: () => void;
    getDocumentIcon: (type: string, size: number) => JSX.Element | null;
    user: User;
    handleEdit: () => void;
    refreshDocuments: () => void;
    refreshDocumentsCoordinates: () => void;
    setShow: (arg: boolean) => void;
    geoJsonData: any
}

function ShowDocumentInfoModal({ geoJsonData, getDocumentIcon, selectedDocumentCoordinates, refreshDocumentsCoordinates, setShow, show, onHide, user, handleEdit, refreshDocuments }: ShowDocumentInfoModalProps) {
    const navigate = useNavigate();  
  
    const [showModalEditGeoreference, setShowModalEditGeoreference] = useState<boolean>(false);
    const [showModalConfirmDelete, setShowModalConfirmDelete] = useState<boolean>(false);

    const [showModalEditDocument, setShowModalEditDocument] = useState<boolean>(false);

    const handleEditClick = () => {
        handleEdit();
        setShowModalEditDocument(true);
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
            refreshDocuments();
            refreshDocumentsCoordinates();
        }catch(err){

        }finally{
            onHide();
        }
    };

    const confirmDelete = () => {
        setShowModalConfirmDelete(true);
    };
  
    return (
        <>
            <Modal 
                show={show && !showModalEditGeoreference} 
                onHide={onHide} 
                dialogClassName="custom-modal-width" 
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton style={{ backgroundColor: 'rgb(148, 137, 121,0.4)' }}>
                    <Modal.Title 
                        id="example-custom-modal-styling-title"
                        style={{
                            whiteSpace: 'normal',         // Allows text to wrap onto multiple lines
                            wordWrap: 'break-word',       // Breaks long words onto a new line if necessary
                            overflowWrap: 'break-word',   // Ensures that even very long words will break 
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                        }}
                    >
                        {`${selectedDocumentCoordinates.title} (${selectedDocumentCoordinates.id})`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                    <Container>
                        <div className="hidden md:block">
                            <Row>
                                <Col xs={3} md={2}>
                                    {getDocumentIcon(selectedDocumentCoordinates.type, 16)}
    
                                    {user.role === "Urban Planner" && (
                                        <div className="flex space-x-2 mt-4">
                                            <button title="Delete document"
                                                className="p-2 rounded-full border-2 bg-red-400 text-white hover:bg-red-700 transition-colors duration-200"
                                                onClick={confirmDelete}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                            <button title="Edit document"
                                                className="p-2 rounded-full border-2 bg-blue-400 text-white hover:bg-blue-700 transition-colors duration-200"
                                                onClick={handleEditClick}
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button title="Edit document's georeference"
                                                className="p-2 rounded-full border-2 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                                                onClick={handleEditGeoreference}
                                            >
                                                <MapIcon className="h-5 w-5 text-white" />
                                          </button>
                                        </div>
                                    )}
                                </Col>
                                <Col xs={9} md={3}>
                                    <p className="text-sm text-gray-600"><strong>Stakeholders: </strong> 
                                        {selectedDocumentCoordinates.stakeHolders.map(sh => sh.name).join(' / ')}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Scale: </strong> 
                                        {selectedDocumentCoordinates.scale}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Issuance Date: </strong> 
                                        {selectedDocumentCoordinates.issuanceDate}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Type: </strong> 
                                        {selectedDocumentCoordinates.type}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Language: </strong> 
                                        {selectedDocumentCoordinates.language ? selectedDocumentCoordinates.language : '-'}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Pages: </strong> 
                                        {selectedDocumentCoordinates.pages ? selectedDocumentCoordinates.pages : '-'}
                                    </p>
                                    
                                    
                                </Col>
                                <Col xs={12} md={7}>
                                    <p><strong>Description:</strong></p>
                                    <p>{selectedDocumentCoordinates.description}</p>
                                </Col>
                            </Row>
                        </div>
  
                    </Container>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                    <button 
                        onClick={() => navigate(`/${selectedDocumentCoordinates.id}/links`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                    >
                        View connections
                    </button>
                </Modal.Footer>
            </Modal>

            {showModalEditGeoreference && selectedDocumentCoordinates.coordinates.length !== 0 &&
                <ModalEditGeoreference
                    documentCoordinates={selectedDocumentCoordinates}
                    mode={"edit"}
                    geoJsonData={geoJsonData}
                    refreshDocuments={refreshDocuments}
                    refreshDocumentsCoordinates={refreshDocumentsCoordinates}

                    onClose={() => {
                        
                        refreshDocumentsCoordinates();
                        setShowModalEditGeoreference(false)
                        setShow(false)
                    }}

                    onBack = {onBack}

                />
            }


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