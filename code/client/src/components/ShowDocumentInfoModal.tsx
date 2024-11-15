
import React, { useState,useEffect } from 'react';
import { Container, Modal, Row, Col, Form, Button, Dropdown, ListGroup } from 'react-bootstrap';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from '../models/user';
import API from '../API/API';
import '../modal.css'
import { TrashIcon, PencilIcon, } from "@heroicons/react/24/outline";
import { DocCoordinates } from '../models/document_coordinate';
import { useNavigate } from 'react-router-dom';

interface TruncatedTextProps {
    text: string;
    maxLength: number;
}

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
  
interface ShowDocumentInfoModalProps {
    selectedDocument: Document | DocCoordinates;
    show: boolean;
    onHide: () => void;
    getDocumentIcon: (type: string, size: number) => JSX.Element | null;
    user: User;
    handleEdit: () => void;
    refreshDocuments: () => void;
}

function ShowDocumentInfoModal({ getDocumentIcon, selectedDocument, show, onHide, user, handleEdit, refreshDocuments }: ShowDocumentInfoModalProps) {
    const navigate = useNavigate();  
  
    const handleEditClick = () => {
        handleEdit();
        // onHide()
    };
  
    const handleDeleteClick = async () => {
        await API.deleteDocument(selectedDocument.id).then();
        refreshDocuments();
        onHide();
        refreshDocuments();
    };
  
    return (
        <>
            <Modal 
                show={show} 
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
                        {`${selectedDocument.title} (${selectedDocument.id})`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                    <Container>
                        <div className="hidden md:block">
                            <Row>
                                <Col xs={3} md={2}>
                                    {getDocumentIcon(selectedDocument.type, 16)}
    
                                    {user.role === "Urban Planner" && (
                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                className="p-2 rounded-full border-2 bg-red-400 text-white hover:bg-red-700 transition-colors duration-200"
                                                onClick={handleDeleteClick}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full border-2 bg-blue-400 text-white hover:bg-blue-700 transition-colors duration-200"
                                                onClick={handleEditClick}
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </Col>
                                <Col xs={9} md={3}>
                                    <p className="text-sm text-gray-600"><strong>Stakeholders: </strong> 
                                        {selectedDocument.stakeHolders.map(sh => sh.name).join(' / ')}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Scale: </strong> 
                                        {selectedDocument.scale}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Issuance Date: </strong> 
                                        {selectedDocument.issuanceDate}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Type: </strong> 
                                        {selectedDocument.type}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Language: </strong> 
                                        {selectedDocument.language ? selectedDocument.language : '-'}
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Pages:</strong> 
                                        {selectedDocument.pages ? selectedDocument.pages : '-'}
                                    </p>
                                    {/*
                                      <p className="text-sm text-gray-600"><strong>Coordinates:</strong> 
                                          {selectedDocument.coordinates ? selectedDocument.coordinates : '-'}
                                      </p>
                                      */
                                    }
                                    
                                    
                                </Col>
                                <Col xs={12} md={7}>
                                    <p><strong>Description:</strong></p>
                                    <p>{selectedDocument.description ? selectedDocument.description : '-'}</p>
                                </Col>
                            </Row>
                        </div>
  
                    </Container>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'rgb(148, 137, 121,0.2)' }}>
                    <button 
                        onClick={() => navigate(`/documents/${selectedDocument.id}/links`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                    >
                        View connections
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export {ShowDocumentInfoModal}