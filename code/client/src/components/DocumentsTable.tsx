import { useEffect, useState } from "react";
import API from "../API/API";
import { TrashIcon, PlusIcon, FaceFrownIcon, PencilIcon,ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { TruncatedText } from "./LinksDocument";
import { Document } from "../models/document";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import { ShowDocumentInfoModal } from "./ShowDocumentInfoModal";
import { DocCoordinates } from "../models/document_coordinate";
import viewOnMap from "../img/viewOnMap.png"


function DocumentsTable(props: any){
    const navigate = useNavigate();

    const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedDocumentCoordinates, setSelectedDocumentCoordinates] = useState<DocCoordinates | null>(null);

    const [documentsLinksCount, setDocumentsLinksCount] = useState<Map<number, number>>(new Map());

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocCoordinates[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

    // Calculate total pages
    const totalPages = Math.ceil(documentsCoordinates.length / itemsPerPage);

    // Handle pagination button clicks
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setPaginatedLinks(documentsCoordinates.slice(
         (currentPage) * itemsPerPage, 
         (currentPage + 1) * itemsPerPage
       ))
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
       setPaginatedLinks(documentsCoordinates.slice(
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
      setSelectedDocumentCoordinates(doc);
      setShowDetails(true);
  }

  // Funzione per ottenere il numero di link per un documento
  const getDocumentLinksCount = async (docId: number) => {
    try {
        const response = await API.getDocumentLinksById(docId); // Sostituisci con il tuo endpoint API

        return response.length; // Supponiamo che l'API restituisca il conteggio dei link nel campo "count"
    } catch (error) {
        console.error("Error fetching document links count", error);
        return 0; // Restituisci 0 se c'è un errore
    }
  };

  useEffect(() => {
      try{
          const getDocuments = async () => {
              const allDocuments = await API.getAllDocumentsCoordinates();
              setDocumentsCoordinates(allDocuments);
          }
          getDocuments().then();

      }catch(err){
          setShowAlert(true);
      }
  }, [])

  useEffect(() => {
    const fetchLinksCount = async () => {
        const linksCountMap = new Map<number, number>();
        
        for (const doc of documentsCoordinates) {
            const count = await getDocumentLinksCount(doc.id); // Assicurati che ogni documento abbia un campo "id"
            linksCountMap.set(doc.id, count); // Memorizza il conteggio dei link
        }

        setDocumentsLinksCount(linksCountMap); // Imposta lo stato
    };

    if (documentsCoordinates.length > 0) {
        fetchLinksCount(); // Chiamata quando i documenti sono disponibili
    }
}, [documentsCoordinates]);

  useEffect(() => {
    // Check if we need to update the current page
    const isLastPage = totalPages < currentPage;

    // If the current page is the last page and we're deleting the last link on it, go to the previous page
    if (isLastPage && currentPage > 1) {
      setPaginatedLinks(documentsCoordinates.slice(
        (currentPage - 2) * itemsPerPage, 
        (currentPage - 1) * itemsPerPage
      ))
      setCurrentPage(prevPage => prevPage - 1); // Decrement the page
    }else{
      setPaginatedLinks(documentsCoordinates.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
      ))
    }
    
  }, [documentsCoordinates]);


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
        
        <div className="px-4 py-5">
            {
                <div className="px-4 py-0">
                { showAlert &&  <Alert
                        message="Sorry, something went wrong..."
                        onClose={() => {
                            setShowAlert(false);
                            navigate('/');
                        }}
                    />}
                </div>
            }
          {documentsCoordinates.length === 0 ? (
            <div className="flex flex-col items-center mt-6">
              <FaceFrownIcon className="h-10 w-10 text-gray-400" />
              <p className="text-lg text-gray-500 mt-2">No documents available</p>
            </div>
          ) : (
            <>
              <div className=" overflow-x-auto ">
                <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg table-auto">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600">
                      <th className="p-4 text-left text-sm font-semibold">Icon</th>
                      <th className="p-4 text-left text-sm font-semibold">Title</th>
                      <th className="p-4 text-left text-sm font-semibold">Stakeholder(s)</th>
                      <th className="p-4 text-left text-sm font-semibold">Date</th>
                      <th className="p-4 text-left text-sm font-semibold">Pages</th>
                      <th className="p-4 text-left text-sm font-semibold">Language</th>
                      <th className="p-4 text-left text-sm font-semibold">Description</th>
                      <th className="p-4 text-left text-sm font-semibold">Links</th>
                      <th className="p-4 text-left text-sm font-semibold">Georeference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLinks.map((doc, index) => (
                      <tr 
                        key={index} 
                        className={`border-b transition duration-200 ease-in-out 
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                          `}
                      >
                        <td className="p-4">{props.getDocumentIcon(doc.type, 8)}</td>
                        <td 
                          className="p-4 cursor-pointer text-sm text-gray-700"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          {doc.title}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {doc.stakeHolders.map(sh => sh.name).join(' / ')}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{doc.issuanceDate}</td>
                        <td className="p-4 text-sm text-gray-600">{doc.pages != null ? doc.pages : "-"}</td>
                        <td className="p-4 text-sm text-gray-600">{doc.language != null ? doc.language : "-"}</td>
                        <td className="p-4 text-sm text-gray-600">
                          <TruncatedText text={doc.description ?? 'No description available'} maxWords={10} />
                        </td>
                        <td className="p-4 text-sm text-gray-600">{
                          documentsLinksCount.get(doc.id) ?
                          <button
                          onClick={() => navigate(`/documents/${doc.id}/links`)}
                          className={`
                          bg-white text-gray-600 
                          hover:bg-gray-200
                            rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium 
                            border-1
                          hover:border-gray-800 hover:shadow-lg
                            transition-all duration-300 ease-in-out
                          `}

                        >
                          {documentsLinksCount.get(doc.id)}
                        </button>                          
                          : "Loading..."} {/* Mostra il numero di link o "Loading..." se non è ancora disponibile */}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {doc.coordinates.length !== 0 ? 
                          
                            <button
                              onClick={() => {}}
                              className={`
                              bg-white
                              text-gray-600
                                rounded-full w-14 h-8 flex items-center justify-center text-xs font-medium
                                border-1
                              hover:border-gray-800 hover:shadow-lg
                                transition-all duration-300 ease-in-out
                              `}
                            >
                              <img
                                src={viewOnMap}
                                alt="Legend Map Icon"
                                className="w-4 h-4 object-contain" // Customize the size
                              />
                              View
                            </button>   
                          
                          : "No available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      
              {/*selectedDocumentCoordinates && ( 
                <ShowDocumentInfoModal 
                  selectedDocumentCoordinates={selectedDocumentCoordinates}
                  show={showDetails} 
                  onHide={handleCloseDetailsModal} 
                  getDocumentIcon={props.getDocumentIcon} 
                  user={props.user} 
                  handleEdit={props.handleEdit} 
                  refreshDocuments={props.refreshDocuments}
                  refreshDocumentsCoordinates={props.refreshDocumentsCoordinates}
                  setShow={props.setShow}
                />

              )*/}

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