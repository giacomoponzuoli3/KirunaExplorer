import { useEffect, useState } from "react";
import API from "../API/API";
import { TrashIcon, MapPinIcon, MapIcon, FaceFrownIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { TruncatedText } from "./LinksDocument";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";

import { DocCoordinates } from "../models/document_coordinate";


function DocumentsTable(props: any){
    const navigate = useNavigate();

    const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

    const [documentsLinksCount, setDocumentsLinksCount] = useState<Map<number, number>>(new Map());

    //filter documents
    const [filteredDocuments, setFilteredDocuments] = useState<DocCoordinates[]>([]); // Stato per documenti filtrati
    const [searchTerm, setSearchTerm] = useState(""); // Stato per la barra di ricerca

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state

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

  useEffect(() => {
      try{
        const getDocuments = async () => {
            const allDocuments = await API.getAllDocumentsCoordinates();
            setDocumentsCoordinates(allDocuments);
            setFilteredDocuments(allDocuments); // Inizializza i documenti filtrati
        }
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
        <div className="px-4 mt-4">
          <h2 className="text-3xl font-bold text-black-600 text-center mb-6">
                List of all Documents
          </h2>
          {/* Barra di ricerca e paginazione su una riga */}
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
                      <th className="p-4 text-left text-sm font-semibold w-16">Icon</th>
                      <th className="p-4 text-left text-sm font-semibold w-32">Title</th>
                      <th className="p-4 text-left text-sm font-semibold w-36">Stakeholder(s)</th>
                      <th className="p-4 text-left text-sm font-semibold w-28">Date</th>
                      <th className="p-4 text-left text-sm font-semibold w-24">Scale</th>
                      <th className="p-4 text-left text-sm font-semibold w-20">Pages</th>
                      <th className="p-4 text-left text-sm font-semibold w-20">Language</th>
                      <th className="p-4 text-left text-sm font-semibold w-64">Description</th>  {/* Colonna più grande */}
                      <th className="p-4 text-left text-sm font-semibold w-24">Links</th>
                      <th className="p-4 text-left text-sm font-semibold w-32">Georeference</th>
                      <th className="p-4 text-left text-sm font-semibold w-32">Resources</th>
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
                        <td className="p-4">{props.getDocumentIcon(doc.type, 8)}</td>
                        <td className="p-4 text-sm text-gray-600 w-32">{doc.title}</td>
                        <td className="p-4 text-sm text-gray-600 w-36">
                          {doc.stakeHolders.map((sh) => sh.name).join(' / ')}
                        </td>
                        <td className="p-4 text-sm text-gray-600 w-28">{doc.issuanceDate}</td>
                        <td className="p-4 text-sm text-gray-600 w-24">{doc.scale}</td>
                        <td className="p-4 text-sm text-gray-600 w-20">{doc.pages ?? '-'}</td>
                        <td className="p-4 text-sm text-gray-600 w-20">{doc.language ?? '-'}</td>
                        <td className="p-4 text-sm text-gray-600 w-64">
                          <TruncatedText
                            text={doc.description ?? 'No description available'}
                            maxWords={10}
                          />
                        </td>
                        <td className="p-4 text-sm text-gray-600 w-24">
                          {documentsLinksCount.get(doc.id) ? (
                            <button
                              title="Number of links"
                              onClick={() => navigate(`/documents/${doc.id}/links`)}
                              className="bg-white text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium border-1 hover:border-gray-800 hover:shadow-lg transition-all duration-300 ease-in-out"
                            >
                              {documentsLinksCount.get(doc.id)}
                            </button>
                          ) : (
                            'Loading...'
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600 w-32">
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
                                    className="flex items-center justify-center text-red-500 hover:text-red-700 border-1 border-red-500 rounded-full hover:border-red-700 w-8 h-8 hover:shadow-lg"
                                    onClick={() => {}}
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    title="Edit georeference"
                                    className="flex items-center justify-center rounded-full border-1 border-yellow-500 hover:border-yellow-600 text-yellow-500 hover:text-yellow-600 w-8 h-8 hover:shadow-lg"
                                    onClick={() => {}}
                                  >
                                    <MapIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            'No available'
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600 w-32">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
      
    }

    
}

export {DocumentsTable}