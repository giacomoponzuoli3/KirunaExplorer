import {useEffect, useState} from "react";
import API from "../API/API";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FaceFrownIcon,
    MapPinIcon,
    PencilIcon,
    PlusCircleIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import {TruncatedText} from "./LinksDocument";
import {useNavigate, useLocation} from "react-router-dom";
import Alert from "./Alert";
import {DocCoordinates} from "../models/document_coordinate";
import {EditDocumentModal} from "./EditDocumentModal";
import ConfirmModal from "./ConfirmModal";
import {MagnifyingGlassIcon} from '@heroicons/react/24/solid'
import {ModalEditGeoreference} from "./ModalEditGeoreference";
import dayjs from 'dayjs';
import 'dayjs/locale/it'; // Importa la localizzazione italiana
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.locale('it'); // Imposta il locale


const documentTypes = [
  "All Types",
  "Informative document",
  "Prescriptive document",
  "Design document",
  "Technical document",
  "Material effect",
  "Agreement",
  "Conflict",
  "Consultation",
  "Others"
];

function DocumentsTable(props: any){
    const navigate = useNavigate();
    const location = useLocation()
    const [isMunicipality, setIsMunicipality] = useState(false); // filter

    const [documentsCoordinates, setDocumentsCoordinates] = useState<DocCoordinates[]>([]);

    const [documentsLinksCount, setDocumentsLinksCount] = useState<Map<number, number>>(new Map());
    const [documentsResourcesCount, setDocumentsResourcesCount] = useState<Map<number, number>>(new Map());

    //filter documents
    const [filteredDocuments, setFilteredDocuments] = useState<DocCoordinates[]>([]); // Stato per documenti filtrati
    const [searchTerm, setSearchTerm] = useState(""); // Stato per la barra di ricerca

    //document edit
    const [documentEdit, setDocumentEdit] = useState<DocCoordinates | null>(null);
    //document delete
    const [documentDelete, setDocumentDelete] = useState<DocCoordinates | null>(null);
    //document's georeference delete
    const [documentGeoreferenceDelete, setDocumentGeoreferenceDelete] = useState<DocCoordinates | null>(null);
    //view document's georeference 
    const [viewDocumentGeoreference, setViewDocumentGeoreference] = useState<DocCoordinates | null>(null);
    //document selected for edit/add georeference
    const [documentSelected, setDocumentSelected] = useState<DocCoordinates | null>(null);

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showAlertErrorDate, setShowAlertErrorDate] = useState(false); //alert state of error date filter
    const [showAlertStartAfterEnd, setShowAlertStartAfterEnd] = useState(false); //alert state of error date filter

    const [showModalEditDocument, setShowModalEditDocument] = useState<boolean>(false);
    const [showModalConfirmDelete, setShowModalConfirmDelete] = useState<boolean>(false);
    const [showModalConfirmDeleteGeoreference, setShowModalConfirmDeleteGeoreference] = useState<boolean>(false);
    const [showModalGeoreference, setShowModalGeoreference] = useState<boolean>(false);

    //section filter
    const [sortOrder, setSortOrder] = useState("none"); // Per ordinamento alfabetico
    const [selectedType, setSelectedType] = useState(""); // Per tipo documento
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    //pagination controls
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocCoordinates[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

    //dropdown of type document filter
    const [isOpenTypeDocument, setIsOpenTypeDocument] = useState(false); // Gestione dello stato del dropdown
    const [selectedValueTypeDocument, setSelectedValueTypeDocument] = useState(selectedType);

    //dropdown of the order documents filter
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Stato per il dropdown
    const [selectedOrder, setSelectedOrder] = useState(sortOrder); // Stato per l'ordine selezionato

    const toggleDropdownTypeDocument = () => setIsOpenTypeDocument(!isOpenTypeDocument);

     // Calcola il numero totale di pagine in base ai documenti filtrati
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

    const [mode, setMode] = useState<string | null>(null);

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

      if(selectedType != 'All Types'){
        handleSelect('All Types');
      }
      setStartDate('');
      setEndDate('');

      setSearchTerm(term);
      const filtered = documentsCoordinates.filter((doc) =>
        doc.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDocuments(filtered);
      setCurrentPage(1); // Resetta la paginazione alla prima pagina
      setPaginatedLinks(filtered.slice(0, itemsPerPage)); // Aggiorna i documenti visualizzati
    };

    //-------- Filter of order ---------//

    //-------- Filter of Range Date ---------//
    const handleFilterByDateRange = () => {
      const normalizeDate = (dateStr: string) => {
        const formats = ['DD/MM/YYYY', 'MM/YYYY', 'YYYY']; // Formati supportati
        let formattedDate = dateStr;
    
        // Normalizzazione delle date
        if (/^\d{2}\/\d{4}$/.test(dateStr)) {
          formattedDate = `01/${dateStr}`; // Trasforma MM/YYYY in 01/MM/YYYY
        }
    
        if (/^\d{4}$/.test(dateStr)) {
          formattedDate = `01/01/${dateStr}`; // Trasforma YYYY in 01/01/YYYY
        }
    
        const parsedDate = dayjs(formattedDate, formats, true); // Parsing rigoroso
    
        return parsedDate.isValid() ? parsedDate : null; // Restituisci null se la data non è valida
      };
    
      // Normalizzazione delle date di inizio e fine
      const normalizedStart = normalizeDate(startDate);
      const normalizedEnd = normalizeDate(endDate);
    
      if (!normalizedStart || !normalizedEnd) {
        setShowAlertErrorDate(true);
        setFilteredDocuments(documentsCoordinates); // Ripristina i documenti originali
        return;
      }

      // Confronta se la Start Date è maggiore della End Date
      if (normalizedStart.isAfter(normalizedEnd)) {
        setShowAlertStartAfterEnd(true);
        return;
      }
        
      const filtered = documentsCoordinates.filter((doc) => {    
        const docDate = normalizeDate(doc.issuanceDate); // Normalizzazione della data
        if (!docDate) {
          return false; // Escludi se non valido
        }
    
        // Filtro per il range di date
          return docDate.isSameOrAfter(normalizedStart) &&
            docDate.isSameOrBefore(normalizedEnd);
      });
    
      setFilteredDocuments(filtered); // Aggiorna lo stato dei documenti filtrati

      setCurrentPage(1); // Resetta la paginazione alla prima pagina
      setPaginatedLinks(filteredDocuments.slice(0, itemsPerPage)); // Aggiorna i documenti visualizzati

      // Reset dei filtri di ordine e tipo documento
      setSelectedOrder("none"); // Reset del filtro di ordine
      setSelectedValueTypeDocument("All Types"); // Reset del filtro di tipo documento
      setSearchTerm('');
      setSortOrder("asc"); // Imposta l'ordine di default (A-Z)
      setIsDropdownOpen(false); // Chiude il dropdown di ordinamento
      setIsOpenTypeDocument(false); // Chiude il dropdown del tipo documento
    };
    
    //-------- Filter of Type Document ---------//
    const handleSelect = (type: any) => {
      setSelectedValueTypeDocument(type);
      handleTypeFilterChange(type);
      setIsOpenTypeDocument(false); // Chiude il dropdown dopo la selezione
      setStartDate('');
      setEndDate('');
      setSearchTerm('');
    };

    // Funzione per il filtro per tipo documento
    const handleTypeFilterChange = (type: any) => {
      setSelectedType(type);
      setFilteredDocuments(() =>
        type && type != "All Types" && type != "Others" ? documentsCoordinates.filter((doc) => doc.type === type) : type == "All Types" ? documentsCoordinates : documentsCoordinates.filter((doc) => !documentTypes.includes(doc.type) || doc.type == "Others")
      );
      setCurrentPage(1); // Resetta la paginazione alla prima pagina
      setPaginatedLinks(filteredDocuments.slice(0, itemsPerPage)); // Aggiorna i documenti visualizzati
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

 
    const getDocumentResourcesCount = async (docId: number) => {
      try {
          const response = await API.getAllResourcesData(docId);
          return response.length;
      } catch (error) {
          console.log(error)
          return 0; // 0 if there is an error
      }
    };

 const filterByMunicipality = ( data: DocCoordinates[]): DocCoordinates[] => {
    return data.filter((item) =>
      item.coordinates.some((coord) => coord.municipality_area === 1)
    );
  };
//get all DocCoordinates
const getDocuments = async () => {
  let temp = 0;
  if(location.pathname.includes("-1") || location.pathname.endsWith("/documents/")){
    setIsMunicipality(true)
    temp = 1;
  }
  const allDocuments = await API.getAllDocumentsCoordinates();
  
  let allDoc = allDocuments;
  
  if (isMunicipality || temp===1) {
    allDoc = filterByMunicipality(allDocuments);
  }

  // Update state with filtered or original documents
  setDocumentsCoordinates(allDoc);
  setFilteredDocuments(allDoc); // Inizializza i documenti filtrati
}


useEffect(() => {
    try{
      getDocuments().then();
    }catch(err){
      setShowAlert(true);
    }
}, [])
useEffect(() => {
  // Check if the URL contains `-1`
  if (location.pathname.endsWith("-1")) {
    setIsMunicipality(true)
    const newPath = location.pathname.replace(/-1$/, "");
    navigate(newPath, { replace: true });
  }
}, [location, navigate]);

  // Aggiorna la paginazione ogni volta che filteredDocuments o currentPage cambiano
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    setPaginatedLinks(filteredDocuments.slice(start, end));
  }, [filteredDocuments, currentPage]);

  useEffect(() => {
    const fetchLinksCount = async () => {
        const linksCountMap = new Map<number, number>();
        const resourcesCountMap = new Map<number, number>();

        for (const doc of documentsCoordinates) {
            const countLink = await getDocumentLinksCount(doc.id); // Assicurati che ogni documento abbia un campo "id"
            linksCountMap.set(doc.id, countLink); // Memorizza il conteggio dei link
            const countRes = await getDocumentResourcesCount(doc.id);
            resourcesCountMap.set(doc.id, countRes);
        }

        setDocumentsLinksCount(linksCountMap); // Imposta lo stato
        setDocumentsResourcesCount(resourcesCountMap);
    };

    if (documentsCoordinates.length > 0) {
        fetchLinksCount().then(); // Chiamata quando i documenti sono disponibili
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

  //---------- EDIT DOCUMENT -----------//
  const handleEditDocument = (doc: DocCoordinates) => {
    setShowModalEditDocument(true);
    setDocumentEdit(doc);
  } 

    //---------- DELETE DOCUMENT -----------//
  const handleDeleteDocument = (doc: DocCoordinates) => {
    setShowModalConfirmDelete(true);
    setDocumentDelete(doc);
  } 

  const handleDeleteClick = async () => {
    try{
        if(documentDelete){
          await API.deleteDocument(documentDelete.id).then();
          getDocuments().then();
        }
        props.refreshDocumentsCoordinates();
        props.refreshDocuments();
        setDocumentDelete(null);
    }catch(err){
      setShowAlert(true);
    }
  };

  //---------- DELETE DOCUMENT'S GEOREFERENCE -----------//
  const handleDeleteDocumentGeoreference = (doc: DocCoordinates) => {
    setShowModalConfirmDeleteGeoreference(true);
    setDocumentGeoreferenceDelete(doc);
  }

  const handleDeleteGeoreferenceClick = async () => {
    try{
      if(documentGeoreferenceDelete){
        await API.deleteDocumentCoordinates(documentGeoreferenceDelete.id);
        getDocuments().then();
      }
      props.refreshDocumentsCoordinates();
      props.refreshDocuments();
      setDocumentGeoreferenceDelete(null);
    }catch(err){
      setShowAlert(true);
    }
  }

  //---------- ADD DOCUMENT'S GEOREFERENCE -----------//
  const handleAddGeoreference = (doc: DocCoordinates) => {
    setDocumentSelected(doc);
    setMode('insert');
    setShowModalGeoreference(true);
  }

  //---------- EDIT DOCUMENT'S GEOREFERENCE -----------//
  const handleEditGeoreference = (doc: DocCoordinates) => {
    setDocumentSelected(doc);
    setMode('edit');
    setShowModalGeoreference(true);
  }

  const onBack = () => {
    setShowModalGeoreference(false);
  }   

  //function for the edit document modal
  function refreshSelectedDocument(doc: DocCoordinates) {
    setDocumentEdit(doc)
    props.refreshDocumentsCoordinates();
    handleSelect('All Types');
    setStartDate('');
    setEndDate('');
    setSortOrder('none');
    setSelectedType('');
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
            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Search a document by title:</span>
              <div className="relative w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Search the document..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-1 w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm pr-10" // Added padding to right for icon
                />
                {/* Magnifying Glass Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
              </div>
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
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">


            {/* Filtro per tipo documento */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type Document:</label>
              <div className="relative inline-block">
                {/* Bottone per aprire il dropdown */}
                <div
                  onClick={toggleDropdownTypeDocument}
                  onKeyDown={(e) => {
                    // Attiva il dropdown con 'Enter' o 'Space'
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleDropdownTypeDocument();
                    }
                  }}
                  tabIndex={0}  // Aggiungi tabIndex per rendere il div focusabile
                  className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer w-60"  // Imposta una larghezza fissa
                >
                  <span>{selectedValueTypeDocument || "All Types"}</span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </div>

                {/* Dropdown Menu */}
                {isOpenTypeDocument && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {documentTypes.map((type) => (
                      <div
                        key={type}
                        onClick={() => handleSelect(type)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelect(type);  // Se 'Enter' o 'Space' viene premuto, seleziona il tipo
                          }
                        }}
                        tabIndex={0}  // Rende l'elemento focusabile
                        className="cursor-pointer hover:bg-blue-100 px-4 py-2 text-sm text-gray-700"
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filtro per range di date */}
            <div className="flex items-center space-x-4">
              {/* Filtro per range di date */}
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium text-gray-700">Start Date</label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy, mm/yyyy, yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48 border border-gray-300 rounded px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-xs font-medium text-gray-700">End Date</label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy, mm/yyyy, yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48 border border-gray-300 rounded px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>
              
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium text-white">-</label>
                <div className="flex items-center space-x-2">
                <button
                  onClick={handleFilterByDateRange}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300 transition"
                >
                  Filter
                </button>
                <button
                  onClick={() =>{
                    setStartDate('');
                    setEndDate('');
                    handleSelect('All Types');
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300 transition"
                >
                  Reset
                </button>
                </div>
              </div>
            </div>
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
                      <th className="px-2 py-4 text-left text-sm font-semibold w-[3%]">Icon</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[15%]">Title</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[15%]">Stakeholder(s)</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Scale</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[7%]">Date</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Language</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[25%]">Description</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Links</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[10%]">Georeference</th>
                      <th className="px-2 py-4 text-center text-sm font-semibold w-[5%]">Resources</th>
                      {props.user.role === "Urban Planner" && <th className="px-2 py-4 text-center text-sm font-semibold w-[10%]">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLinks.map((doc: DocCoordinates, index) => (
                      <tr
                        key={index}
                        className={`border-b transition duration-200 ease-in-out ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-2 py-4 relative justify-center items-center w-[3%]">{props.getDocumentIcon(doc.type, 8)}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[15%] text-center">{doc.title}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[15%] text-center">
                          {doc.stakeHolders.map((sh) => sh.name).join(' / ')}
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[5%] text-center">{doc.scale}</td>
                        <td className="px-2 py-4 text-sm text-gray-600 w-[7%] text-center">{doc.issuanceDate}</td>
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
                            onClick={() => navigate(`${doc.id}/links`, { state: { from: "/documents" } })}
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
                                  onClick={() => navigate(`${doc.id}/map`, { state: { from: "/documents" } })}
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
                                    onClick={() => handleEditGeoreference(doc)}
                                  >
                                    <img src="/img/editMap-icon-yellow.png" alt="Informative Document" className="h-4 w-4"/>
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            props.user.role === 'Urban Planner' ? 
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                title="Add new georeference"
                                onClick={() => handleAddGeoreference(doc)}
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
                              onClick={() => navigate(`${doc.id}/resources`, { state: { from: "/documents" } })}
                              className="bg-white text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 relative items-center justify-center text-xs font-medium border-1 hover:border-gray-800 hover:shadow-lg transition-all duration-300 ease-in-out"
                            >
                              {documentsResourcesCount.get(doc.id) != undefined ? documentsResourcesCount.get(doc.id) : 0}
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

          {showAlertErrorDate &&
            <Alert
              message="The date range is invalid. Please ensure you use the correct format: dd/mm/yyyy mm/yyyy yyyy."
              onClose={() => {
                  setShowAlertErrorDate(false);
                  setStartDate('');
                  setEndDate('');
              }}
            />
          }

          {showAlertStartAfterEnd &&
            <Alert
              message="Error: Start date cannot be after End date"
              onClose={() => {
                  setShowAlertStartAfterEnd(false);
                  setStartDate('');
                  setEndDate('');
              }}
            />
          }

          {documentEdit && (
            <EditDocumentModal 
              document={documentEdit} 
              show={showModalEditDocument} 
              onHide={() => {
                setShowModalEditDocument(false)
                setDocumentEdit(null);
                props.refreshDocumentsCoordinates();
                props.refreshDocuments();
                getDocuments().then(); //refresh of documents
                setStartDate('');
                setEndDate('');
                setSortOrder('none');
                setSelectedType('');

              }} 
              refreshSelectedDocument={refreshSelectedDocument}
              
              stakeholders={documentEdit.stakeHolders}
              scaleOptions={props.scaleOptions}
              //setScaleOptions={setScaleOptions}
              onCreateScale={props.onCreateScale}
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

          {/* Show the map with the coordinates of a specific document */}
          {/*viewDocumentGeoreference ? <>{console.log("view")}</> : <></>*/}

          {showModalGeoreference && mode && documentSelected &&
                <ModalEditGeoreference
                    documentCoordinates={documentSelected}
                    mode={mode}
                    refreshDocuments={props.refreshDocuments}
                    refreshDocumentsCoordinates={props.refreshDocumentsCoordinates}

                    geoJsonData={props.geoJsonData}

                    onClose={() => {    
                      getDocuments().then(); //refresh of documents
                      setShowModalGeoreference(false)
                      setMode(null); //reset the mode
                    }}

                    onBack = {onBack}

                />
            }

        </div>
      );
      
    }

    
}

export {DocumentsTable}
