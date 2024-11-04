import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Document } from "../models/document";
import API from "../API/API";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "react-bootstrap";
import Alert from "./Alert";
import ConfirmModal from './ConfirmModal';
import { AddLinkModal } from "./AddLinkModal";
import { DocLink } from "../models/document_link";
import { link } from "fs";


function getDocumentIcon(type: string) {
    switch (type) {
        case 'Informative document':
            return <img src="/kiruna/img/informativeDocument.png" alt="Informative Document" className="h-7 w-7" />;
        case 'Prescriptive document':
            return <img src="/kiruna/img/prescriptiveDocument.png" alt="Prescriptive Document" className="h-7 w-7" />;
        case 'Material effect':
            return <img src="/kiruna/img/construction.png" alt="Material Effect" className="h-7 w-7" />;
        case 'Design document':
            return <img src="/kiruna/img/designDocument.png" alt="Design Document" className="h-7 w-7" />;
        case 'Technical document':
            return <img src="/kiruna/img/technicalDocument.png" alt="Technical Document" className="h-7 w-7" />;
        default:
            return <span>Icon Not Found</span>;
    }
}

function LinksDocument(props: any) {
    const navigate = useNavigate();
    const { idDocument } = useParams();
    const [document, setDocument] = useState<Document | null>(null);
    const [documentLinks, setDocumentLinks] = useState<DocLink[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null);
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showModalAddLink, setShowModalAddLink] = useState(false);


    const handleDelete = async () => {
        if (document && documentToDelete && linkToDelete) {
            await API.deleteLink(document.id , documentToDelete, linkToDelete);
            // Recharge the list of documents
            setDocumentLinks(documentLinks.filter(doc => (doc.id !== documentToDelete || doc.relatedLink.id !== linkToDelete)));
            setShowModal(false);
        }
    };

    const refreshLinks = async () => {
        try {
            const documentId = Number(idDocument);
            const updatedLinks = await API.getDocumentLinksById(documentId);
            setDocumentLinks(updatedLinks);
        } catch (err) {
            setShowAlert(true);
        }
    };


    useEffect(() => {
        const getDocument = async () => {
            try{
                const documentId = Number(idDocument);
                const document = await API.getDocumentById(documentId);
                setDocument(document);
            }catch(err){
                setShowAlert(true);
            }
        };

        getDocument();
    }, [idDocument])

    useEffect(() => {
        const getDocuments = async () => {
            try{
                const documentId = Number(idDocument);
                const documentsConnections = await API.getDocumentLinksById(documentId);
        
                setDocumentLinks(documentsConnections);
            }catch (err){
                setShowAlert(true);
            }
        };
        getDocuments();
    }, [idDocument]);

    const confirmDelete = (docId: number, linkId: number) => {
        setDocumentToDelete(docId);
        setLinkToDelete(linkId);
        setShowModal(true);
    };

    const handleAddLink = () => {
        setShowModalAddLink(true);
    }


    if (document == null || documentLinks.length === 0){
        return (
            <div className="p-4">
            { showAlert &&  <Alert
                    message="Sorry, something went wrong..."
                    onClose={() => {
                        setShowAlert(false);
                        navigate('/');
                    }}
                />}
            </div>
        );
    }else{
      return (
        <div className="p-4">
            {showAlert && (
                <Alert
                    message="You cannot delete the only connection present! A document must have at least one connection!"
                    onClose={() => setShowAlert(false)}
                />
            )}

            {/* Title Section with enhanced contrast */}
            <h2 className="text-xl font-normal text-gray-600 mb-1 text-center">
                Connections of
            </h2>
            <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
                {document.title}
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-4 text-left text-gray-600 font-semibold">Icon</th>
                            <th className="p-4 text-left text-gray-600 font-semibold">Title</th>
                            <th className="p-4 text-left text-gray-600 font-semibold">Stakeholder(s)</th>
                            <th className="p-4 text-left text-gray-600 font-semibold">Type of Link</th>
                            {props.isLogged && props.user.role == "Urban Planner" && <th className="p-4 text-center text-gray-600 font-semibold">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {documentLinks.map((doc, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
                                <td className="p-4">{getDocumentIcon(doc.type)}</td>
                                <td className="p-4">{doc.title}</td>
                                <td className="p-4">{doc.stakeHolders.map(sh => sh.name).join(' / ')}</td>
                                <td className="p-4">{doc.relatedLink.name}</td>
                                {props.isLogged && props.user.role == "Urban Planner" && 
                                    <td className="p-4 flex justify-center space-x-4">
                                        <button className="text-red-500 hover:text-red-700" onClick={() => {
                                            if(documentLinks.length === 1){
                                                setShowAlert(true);
                                            }else{
                                                confirmDelete(doc.id, doc.relatedLink.id)
                                                setShowModal(true)
                                            }    
                                        }}>
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>

                                }
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {props.isLogged && props.user.role == "Urban Planner" && <>
                <div className="mt-4 text-center"> {/* Contenitore per il pulsante sotto la tabella */}
                    <button 
                        className="flex items-center justify-center bg-green-600 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200"  
                        onClick={handleAddLink}
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span>Add Link</span>
                    </button>
                </div>
                <ConfirmModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onConfirm={handleDelete}
                />
                {/* Modal to insert a new link */}
                <AddLinkModal  
                    show={showModalAddLink}
                    onHide={() => setShowModalAddLink(false)}
                    idDocument={idDocument}
                    refreshLinks={refreshLinks}
                />
            </>
            }
            
        </div>
    );  
    }

    
}

export { LinksDocument };
