import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Document } from "../models/document";
import API from "../API/API";
import { TrashIcon, PlusIcon, FaceFrownIcon, PencilIcon,ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import Alert from "./Alert";
import ConfirmModal from './ConfirmModal';
import { AddLinkModal } from "./AddLinkModal";
import { DocLink } from "../models/document_link";
import { EditLinkModal } from "./EditLinkModal";

interface TruncatedTextProps {
  text: string;
  maxWords: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxWords }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dividi il testo in un array di parole
  const words = text.split(" ");
  const shouldTruncate = words.length > maxWords;

  // Mostra solo il numero massimo di parole se non espanso
  const displayText = isExpanded ? text : words.slice(0, maxWords).join(" ") + '...';

  return (
    <div className="relative">
      <span className={isExpanded ? '' : 'line-clamp-none'}>
        {displayText}
      </span>
      {shouldTruncate && (
        <button
          className="text-blue-600 mt-1 ml-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};


function LinksDocument(props: any) {
    const navigate = useNavigate();

    const { idDocument } = useParams();
    const [document, setDocument] = useState<Document | null>(null);
    const [documentLinks, setDocumentLinks] = useState<DocLink[]>([]);
    const [showModal, setShowModal] = useState(false);
    //delete
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null);

    //update    
    const [documentToUpdate, setDocumentToUpdate] = useState<DocLink | null>(null);

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showModalAddLink, setShowModalAddLink] = useState(false);
    const [showModalEditLink, setShowModalEditLink] = useState(false);

    //loading
    const [loading, setLoading] = useState(true);  // stato di caricamento

    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocLink[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

    // Calculate total pages
    const totalPages = Math.ceil(documentLinks.length / itemsPerPage);


    // Handle pagination button clicks
    const handleNextPage = () => {
     if (currentPage < totalPages) {
       console.log(paginatedLinks)
       setPaginatedLinks(documentLinks.slice(
        (currentPage) * itemsPerPage, 
        (currentPage + 1) * itemsPerPage
      ))
       setCurrentPage(currentPage + 1);
     }
    };

    const handlePrevPage = () => {
     if (currentPage > 1) {
      setPaginatedLinks(documentLinks.slice(
        (currentPage - 2) * itemsPerPage, 
        (currentPage - 1) * itemsPerPage
      ))
       setCurrentPage(currentPage - 1);
     }
    };

    const handleDelete = async () => {
        if (document && documentToDelete && linkToDelete) {
            await API.deleteLink(document.id , documentToDelete, linkToDelete);
            // Recharge the list of documents
            setDocumentLinks(documentLinks.filter(doc => (doc.id !== documentToDelete || doc.relatedLink.id !== linkToDelete)));
            setShowModal(false);
        }
    };

    const confirmDelete = (docId: number, linkId: number) => {
      setDocumentToDelete(docId);
      setLinkToDelete(linkId);
      setShowModal(true);
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
                setLoading(true);  // Imposta lo stato di caricamento a true
                const documentId = Number(idDocument);
                const document = await API.getDocumentById(documentId);
                setDocument(document);
            }catch(err){
                setShowAlert(true);
            } finally {
              setLoading(false);  // Imposta lo stato di caricamento a false dopo la chiamata API
            }
        };

        getDocument().then();
    }, [idDocument])

    useEffect(() => {
        const getDocuments = async () => {
            try{
                const documentId = Number(idDocument);
                const documentsConnections = await API.getDocumentLinksById(documentId);
        
                setDocumentLinks(documentsConnections);
                // setPaginatedLinks(documentsConnections.slice(
                //   (currentPage - 1) * itemsPerPage, 
                //   currentPage * itemsPerPage
                // ))
            }catch (err){
                setShowAlert(true);
            }
        };
        getDocuments().then();
    }, [idDocument]);

    useEffect(() => {
      // Check if we need to update the current page
      const isLastPage = totalPages < currentPage;
  
      // If the current page is the last page and we're deleting the last link on it, go to the previous page
      if (isLastPage && currentPage > 1) {
        setPaginatedLinks(documentLinks.slice(
          (currentPage - 2) * itemsPerPage, 
          (currentPage - 1) * itemsPerPage
        ))
        setCurrentPage(prevPage => prevPage - 1); // Decrement the page
      }else{
        setPaginatedLinks(documentLinks.slice(
          (currentPage - 1) * itemsPerPage, 
          currentPage * itemsPerPage
        ))
      }
      
    }, [documentLinks]);

    const handleAddLink = () => {
        setShowModalAddLink(true);
    }

    const handleUpdate = async (documentUpdate: DocLink) => {
      setDocumentToUpdate(documentUpdate);
      setShowModalEditLink(true);
    }

    if (loading) {
      return <div>Loading...</div>; 
    }

    if (document == null){
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
            <div className="p-4" style={{ height: "calc(100vh - 65px)", overflowY: "auto" }}>
              <h2 className="text-xl font-normal text-gray-600 mb-1 text-center">
                Connections of
              </h2>
              <h2 className="text-3xl font-bold text-black-600 text-center mb-6">
                {document.title}
              </h2>
          
              {documentLinks.length === 0 ? (
                <div className="flex flex-col items-center mt-6">
                  <FaceFrownIcon className="h-10 w-10 text-gray-400" />
                  <p className="text-lg text-gray-500 mt-2">No links available</p>
                  {props.isLogged && props.user.role == "Urban Planner" && (
                    <button
                      className="flex items-center justify-center bg-green-600 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200 mt-4"
                      onClick={handleAddLink}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      <span>Add Link</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="pl-4 pr-4 pt-3 pb-3 text-left text-gray-600 font-semibold">Icon</th>
                          <th className="pl-4 pr-4 pt-3 pb-3 text-left text-gray-600 font-semibold">Title</th>
                          <th className="pl-4 pr-4 pt-3 pb-3 text-left text-gray-600 font-semibold">Stakeholder(s)</th>
                          <th className="pl-4 pr-4 pt-3 pb-3 text-left text-gray-600 font-semibold">Description</th>
                          <th className="pl-4 pr-4 pt-3 pb-3 text-left text-gray-600 font-semibold">Type of Link</th>
                          {props.isLogged && props.user.role == "Urban Planner" && (
                            <th className="pl-4 pr-4 pt-3 pb-3 text-center text-gray-600 font-semibold">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLinks.map((doc, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
                            <td className="pl-4 pr-4 pt-3 pb-3">{props.getDocumentIcon(doc.type, 7)}</td>
                            <td className="pl-4 pr-4 pt-3 pb-3">{doc.title}</td>
                            <td className="pl-4 pr-4 pt-3 pb-3">{doc.stakeHolders.map(sh => sh.name).join(' / ')}</td>
                            <td className="pl-4 pr-4 pt-3 pb-3">
                                <TruncatedText text={doc.description ?? 'No description available'} maxWords={20}  />
                            </td>
                            <td className="pl-4 pr-4 pt-3 pb-3">{doc.relatedLink.name}</td>
                            {props.isLogged && props.user.role == "Urban Planner" && (
                              <td className="pl-4 pr-4 pt-3 pb-3 items-center justify-center space-x-4">
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(doc.id, doc.relatedLink.id)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                              <button
                                className="text-blue-500 hover:text-blue-700 ml-2"
                                onClick={() => handleUpdate(doc)}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
          
                  {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center space-x-4 mt-4">
                       <button onClick={handlePrevPage}
                         className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                         disabled={currentPage === 1}
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-gray-700 mt-2">Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage}
                         className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                         disabled={currentPage === totalPages}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                </>
              )}
          
              {props.isLogged && props.user.role == "Urban Planner" && (
                <>
                  <div className="mt-4 text-center">
                  {documentLinks.length !== 0 && 
                    <button 
                    className="flex items-center justify-center bg-green-600 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200"  
                    onClick={handleAddLink}
                    > 
                      <PlusIcon className="h-5 w-5 mr-2" />
                      <span>Add Link</span>
                    </button>
                  }
                    
                  </div>
                  <ConfirmModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onConfirm={handleDelete}
                    text={`Are you sure you want to delete this link of the document?
                    This action cannot be undone.`}
                  />
                  <AddLinkModal  
                    show={showModalAddLink}
                    onHide={() => setShowModalAddLink(false)}
                    idDocument={idDocument}
                    refreshLinks={refreshLinks}
                  />

                  {document !== null && documentToUpdate !== null && showModalEditLink &&<EditLinkModal
                    show={showModalEditLink}
                    onHide={() => setShowModalEditLink(false)}

                    firstDocument={document}
                    secondDocument={documentToUpdate}

                    refreshLinks={refreshLinks}
                  />}
                 
                </>
              )}
            </div>
          );
          
    }

    
}

export { LinksDocument, TruncatedText };
