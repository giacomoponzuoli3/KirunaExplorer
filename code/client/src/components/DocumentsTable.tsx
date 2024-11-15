import { useEffect, useState } from "react";
import API from "../API/API";
import { TrashIcon, PlusIcon, FaceFrownIcon, PencilIcon,ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { TruncatedText } from "./LinksDocument";
import { Document } from "../models/document";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import { ShowDocumentInfoModal } from "./ShowDocumentInfoModal";


function DocumentsTable(props: any){
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<Document[]>([]);

    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<Document[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

    // Calculate total pages
    const totalPages = Math.ceil(documents.length / itemsPerPage);

    // Handle pagination button clicks
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        console.log(paginatedLinks)
        setPaginatedLinks(documents.slice(
         (currentPage) * itemsPerPage, 
         (currentPage + 1) * itemsPerPage
       ))
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
       setPaginatedLinks(documents.slice(
         (currentPage - 2) * itemsPerPage, 
         (currentPage - 1) * itemsPerPage
       ))
        setCurrentPage(currentPage - 1);
      }
    };

    const handleCloseDetailsModal = () => {
      setShowDetails(false);
      setSelectedDocument(null);
  };

  const handleDocumentClick = async (doc: any) => {
      //const document = await API.getDocumentById(doc.id);
      setSelectedDocument(doc);
      setShowDetails(true);
  }

    useEffect(() => {
        try{
            const getDocuments = async () => {
                const allDocuments = await API.getAllDocuments();
                setDocuments(allDocuments);
            }
            getDocuments().then();
        }catch(err){
            setShowAlert(true);
            console.log("entrato");
        }
    }, [])

    useEffect(() => {
      // Check if we need to update the current page
      const isLastPage = totalPages < currentPage;
  
      // If the current page is the last page and we're deleting the last link on it, go to the previous page
      if (isLastPage && currentPage > 1) {
        setPaginatedLinks(documents.slice(
          (currentPage - 2) * itemsPerPage, 
          (currentPage - 1) * itemsPerPage
        ))
        setCurrentPage(prevPage => prevPage - 1); // Decrement the page
      }else{
        setPaginatedLinks(documents.slice(
          (currentPage - 1) * itemsPerPage, 
          currentPage * itemsPerPage
        ))
      }
      
    }, [documents]);


    if(showAlert){
        console.log("entrato");
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
            {
                <div className="p-4">
                { showAlert &&  <Alert
                        message="Sorry, something went wrong..."
                        onClose={() => {
                            setShowAlert(false);
                            navigate('/');
                        }}
                    />}
                </div>
            }
          {documents.length === 0 ? (
            <div className="flex flex-col items-center mt-6">
              <FaceFrownIcon className="h-10 w-10 text-gray-400" />
              <p className="text-lg text-gray-500 mt-2">No documents available</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-4 text-left text-gray-600 font-semibold">Icon</th>
                      <th className="p-4 text-left text-gray-600 font-semibold">Title</th>
                      <th className="p-4 text-left text-gray-600 font-semibold">Stakeholder(s)</th>
                      <th className="p-4 text-left text-gray-600 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLinks.map((doc, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
                        <td className="p-4">{props.getDocumentIcon(doc.type, 8)}</td>
                        <td className="p-4 cursor-pointer"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          {doc.title}
                        </td>
                        <td className="p-4">{doc.stakeHolders.map(sh => sh.name).join(' / ')}</td>
                        <td className="p-4">
                            <TruncatedText text={doc.description ?? 'No description available'} maxWords={20}  />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      
              {selectedDocument && ( 
                <ShowDocumentInfoModal 
                  selectedDocument={selectedDocument} show={showDetails} 
                  onHide={handleCloseDetailsModal} getDocumentIcon={props.getDocumentIcon} 
                  user={props.user} handleEdit={props.handleEdit} refreshDocuments={props.refreshDocuments}
                />
              )}

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
      
        </div>
      );
    }

    
}

export {DocumentsTable}