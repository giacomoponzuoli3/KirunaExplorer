import { useEffect, useState } from "react";
import API from "../API/API";
import { TrashIcon, MapPinIcon, MapIcon, PencilIcon, FaceFrownIcon, ChevronRightIcon, ChevronLeftIcon, PlusCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { TruncatedText } from "./LinksDocument";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import { ShowDocumentInfoModal } from "./ShowDocumentInfoModal";
import { DocCoordinates } from "../models/document_coordinate";
import { EditDocumentModal } from "./EditDocumentModal";
import ConfirmModal from "./ConfirmModal";


function DocumentsTable(props: any){
    const navigate = useNavigate();

    const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

    const [documentsLinksCount, setDocumentsLinksCount] = useState<Map<number, number>>(new Map());

    //filter documents
    const [filteredDocuments, setFilteredDocuments] = useState<DocCoordinates[]>([]); // Stato per documenti filtrati
    const [searchTerm, setSearchTerm] = useState(""); // Stato per la barra di ricerca

    //document edit
    const [documentEdit, setDocumentEdit] = useState<DocCoordinates | null>(null);
    //document delete
    const [documentDelete, setDocumentDelete] = useState<DocCoordinates | null>(null);
    //document's georeference delete
    const [documentGeoreferenceDelete, setDocumentGeoreferenceDelete] = useState<DocCoordinates | null>(null);

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showModalEditDocument, setShowModalEditDocument] = useState<boolean>(false);
    const [showModalConfirmDelete, setShowModalConfirmDelete] = useState<boolean>(false);
    const [showModalConfirmDeleteGeoreference, setShowModalConfirmDeleteGeoreference] = useState<boolean>(false);

    //pagination controls
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocCoordinates[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

     // Calcola il numero totale di pagine in base ai documenti filtrati
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

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

    // function to filter documents
    const handleSearch = (term: string) => {
      setSearchTerm(term);
      const filtered = documentsCoordinates.filter((doc) =>
        doc.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDocuments(filtered);
      setCurrentPage(1); // Resetta la paginazione alla prima pagina
      setPaginatedLinks(filtered.slice(0, itemsPerPage)); // Aggiorna i documenti visualizzati
    };


  // Funzione per ottenere il numero di link per un documento
  const getDocumentLinksCount = async (docId: number) => {
    try {
        const response = await API.getDocumentLinksById(docId);
        return response.length; //the response is the array of links
    } catch (error) {
        console.error("Error fetching document links count", error);
        return 0; // 0 if there is an error
    }
  };

  //get all DocCoordinates
  const getDocuments = async () => {
    const allDocuments = await API.getAllDocumentsCoordinates();
    setDocumentsCoordinates(allDocuments);
    setFilteredDocuments(allDocuments); // Inizializza i documenti filtrati
  }

  useEffect(() => {
      try{
        getDocuments().then();
      }catch(err){
        setShowAlert(true);
      }
  }, [])

  // Aggiorna la paginazione ogni volta che filteredDocuments o currentPage cambiano
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    setPaginatedLinks(filteredDocuments.slice(start, end));
  }, [filteredDocuments, currentPage]);

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

  //handle of edit document
  const handleEditDocument = (doc: DocCoordinates) => {
    setShowModalEditDocument(true);
    setDocumentEdit(doc);
  } 

  //handle of delete document
  const handleDeleteDocument = (doc: DocCoordinates) => {
    setShowModalConfirmDelete(true);
    setDocumentDelete(doc);
    console.log(documentDelete)
  } 

  const handleDeleteClick = async () => {
    try{
        if(documentDelete){
          await API.deleteDocument(documentDelete.id).then();
          getDocuments();
        }
        setDocumentDelete(null);
    }catch(err){
      setShowAlert(true);
    }
  };

  //handle delete of a document's georeference 
  const handleDeleteDocumentGeoreference = (doc: DocCoordinates) => {
    setShowModalConfirmDeleteGeoreference(true);
    setDocumentGeoreferenceDelete(doc);
  }

  const handleDeleteGeoreferenceClick = async () => {
    try{
      if(documentGeoreferenceDelete){
        await API.deleteDocumentCoordinates(documentGeoreferenceDelete.id);
        getDocuments();
      }
      setDocumentGeoreferenceDelete(null);
    }catch(err){
      setShowAlert(true);
    }
  }

  function refreshSelectedDocument(doc: DocCoordinates) {
    setDocumentEdit(doc)
  }

    if(showAlert){
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
        <div className="px-4 mt-4 mb-4">
          <h2 className="text-3xl font-bold text-black-600 text-center mb-6">
                List of all Documents
          </h2>
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Search a document by title:</span>
              <input
                type="text"
                placeholder="Search the document..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-1 w-full max-w-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
            </div>

            {/* Paginazione */}
            {totalPages > 0 && (
              <div className="flex items-center space-x-4 ml-4">
                <button
                  onClick={handlePrevPage}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-gray-700 mt-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
      
          {filteredDocuments.length == 0 ? (
            <div className="flex flex-col items-center mt-6">
              <FaceFrownIcon className="h-10 w-10 text-gray-400" />
              <p className="text-lg text-gray-500 mt-2">No documents available</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg table-auto">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600">
                      <th className="px-2 py-4 text-left text-sm font-semibold w-[5%]">Icon</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[15%]">Title</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[15%]">Stakeholder(s)</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Scale</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Pages</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Language</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[25%]">Description</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Links</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[10%]">Georeference</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Resources</th>
                      {props.user.role === "Urban Planner" && <th className="px-2 py-4 text-center text-sm font-semibold w-[10%]">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLinks.map((doc, index) => (
                      <tr
                        key={index}
                        className={`border-b transition duration-200 ease-in-out ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-2 py-4 relative justify-center items-center w-[5%]">{props.getDocumentIcon(doc.type, 8)}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[15%] text-center">{doc.title}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[15%] text-center">
                          {doc.stakeHolders.map((sh) => sh.name).join(' / ')}
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] text-center">{doc.scale}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] text-center">{doc.pages != null ? doc.pages : "-"}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] text-center">{doc.language != null ? doc.language : "-"}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[25%] text-center">
                          <TruncatedText
                            text={doc.description ?? 'No description available'}
                            maxWords={10}
                          />
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] relative justify-center items-center text-center">
                          <button
                            title="Number of links"
                            onClick={() => navigate(`/documents/${doc.id}/links`)}
                            className="bg-white text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 relative items-center justify-center text-xs font-medium border-1 hover:border-gray-800 hover:shadow-lg transition-all duration-300 ease-in-out"
                          >
                            {documentsLinksCount.get(doc.id) != undefined ? documentsLinksCount.get(doc.id) : 0}
                          </button>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[10%]">
                          {doc.coordinates.length !== 0 ? (
                            <>
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  title="View georeference"
                                  onClick={() => {}}
                                  className="bg-white text-blue-600 hover:text-blue-800 rounded-full w-14 h-8 flex items-center justify-center text-xs font-medium border-1 border-blue-500 hover:border-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out"
                                >
                                  <MapPinIcon className="w-4 h-4" />
                                  View
                                </button>
                              </div>
                              {props.user.role === 'Urban Planner' && (
                                <div className="flex items-center justify-center space-x-2 mt-2">
                                  <button
                                    title="Delete georeference"
                                    className="flex items-center justify-center text-red-500 hover:text-red-700 border-1 border-red-500 rounded-full hover:border-red-700 w-7 h-7 hover:shadow-lg"
                                    onClick={() => handleDeleteDocumentGeoreference(doc)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="Edit georeference"
                                    className="flex items-center justify-center rounded-full border-1 border-yellow-500 hover:border-yellow-600 text-yellow-500 hover:text-yellow-600 w-7 h-7 hover:shadow-lg"
                                    onClick={() => {}}
                                  >
                                    <MapIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            props.user.role === 'Urban Planner' ? 
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                title="View georeference"
                                onClick={() => {}}
                                className="bg-white text-green-600 hover:text-green-800 rounded-full w-14 h-8 flex items-center justify-center text-xs font-medium border-1 border-green-600 hover:border-green-800 hover:shadow-lg transition-all duration-300 ease-in-out"
                              >
                                <PlusCircleIcon className="w-4 h-4 mr-1" />
                                Add
                              </button>
                            </div>                     
                            : 
                              <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
                                No available
                              </div>  
                          )}
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] text-center">
                            <button
                              title="Number of resources"
                              onClick={() => {}}
                              className="bg-white text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 relative items-center justify-center text-xs font-medium border-1 hover:border-gray-800 hover:shadow-lg transition-all duration-300 ease-in-out"
                            >
                              {documentsLinksCount.get(doc.id) != undefined ? documentsLinksCount.get(doc.id) : 0}
                            </button>
                        </td>
                        {props.user.role === "Urban Planner" && (
                          <td className="px-2 py-4 text-sm text-gray-600 w-[10%]">
                            <div className="flex items-center justify-center space-x-2">
                                <button title="Delete document"
                                    className="flex items-center justify-center text-red-500 hover:text-red-700 border-1 border-red-500 rounded-full hover:border-red-700 w-7 h-7 hover:shadow-lg"
                                    onClick={() => {handleDeleteDocument(doc)}}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                                <button title="Edit document"
                                    className="flex items-center justify-center rounded-full border-1 border-yellow-500 hover:border-yellow-600 text-yellow-500 hover:text-yellow-600 w-7 h-7 hover:shadow-lg"
                                    onClick={() => {handleEditDocument(doc)}}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            </div>
                            </td>
                        )} 
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {documentEdit && (
            <EditDocumentModal 
              document={documentEdit} 
              show={showModalEditDocument} 
              onHide={() => {
                setShowModalEditDocument(false)
                setDocumentEdit(null);
                getDocuments(); //refresh of documents
                
              }} 
              refreshSelectedDocument={refreshSelectedDocument}
              
              stakeholders={documentEdit.stakeHolders}
            />
          )}

          {/* Show when confirm the delete of a document */}
          {documentDelete && <ConfirmModal
              show={showModalConfirmDelete}
              onHide={() => {setShowModalConfirmDelete(false)}}
              onConfirm={handleDeleteClick}
              text={`Are you sure you want to delete this document?
              This action cannot be undone.`}
          />}

          {/* Show when confirm the delete of a georeference of a specific document */}
          {documentGeoreferenceDelete && <ConfirmModal
              show={showModalConfirmDeleteGeoreference}
              onHide={() => setShowModalConfirmDeleteGeoreference(false)}
              onConfirm={handleDeleteGeoreferenceClick}
              text={`Are you sure you want to delete this document's georeference?
              This action cannot be undone.`}
          />}

        </div>
      );
      
    }

    
}

export {DocumentsTable}