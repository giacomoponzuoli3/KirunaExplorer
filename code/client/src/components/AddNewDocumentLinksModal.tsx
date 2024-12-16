import React, { useState,useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Document } from '../models/document';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API/API';
import '../modal.css'
import { TrashIcon, ChevronLeftIcon,ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from '../models/link'; 
import Alert from "./Alert";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
// Utilizziamo ISO 639-1 per ottenere le lingue
import { LatLng } from 'leaflet';
import { DocCoordinates } from '../models/document_coordinate';

interface AddNewDocumentLinksModalProps {
  document: Document;
  handleClose: () => void;
  refreshDocumentsCoordinates: () => void;
  docs: DocCoordinates[];
  newDocumentCoordinates: LatLng | LatLng[] | null;
  filesUploaded: File[];
  handlePrevStep: () => void;
  setMode: (mode: string) => void;
}

function AddNewDocumentLinksModal({ document, handleClose, refreshDocumentsCoordinates, docs, newDocumentCoordinates, filesUploaded, handlePrevStep, setMode}: AddNewDocumentLinksModalProps) {
    const [typesLink, setTypesLink] = useState<Link[]>([]); // vector of types of links
    const [documents] = useState<Document[]>(docs.filter((d: Document) => d.id != document.id)); // vector of all documents except one

    const [selectedDocument, setSelectedDocument] = useState<number | null>(null); // Selected document
    const [selectedTypeLink, setSelectedTypeLink] = useState<number | null>(null); // Selected type of link

    const [selectedDocumentName, setSelectedDocumentName] = useState<string>(''); // Selected document
    const [selectedTypeLinkName, setSelectedTypeLinkName] = useState<string>(''); // Selected type of link
    const [alertMessage, setAlertMessage] = useState<string>(''); // Selected type of link

    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showDocumentDropdown, setShowDocumentDropdown] = useState(false); // State to show document dropdown
    const [showTypeLinkDropdown, setShowTypeLinkDropdown] = useState(false); // State to show type link dropdown

    type DocumentLink = {
      documentName: string;
      documentId: number | null;
      linkId: number | null;
      linkName: string;
    };
    
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedLinks, setPaginatedLinks] = useState<DocumentLink[]>([]);
    const itemsPerPage = 3; // Number of items to show per page
    const [searchQuery, setSearchQuery] = useState('');


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

    useEffect(() => {
      const getTypesLink = async () => {
          try {
              const types = await API.getAllLinks();
              setTypesLink(types);
          } catch (err) {
              setShowAlert(true);
          }
      };

      getTypesLink().then();
      
  }, []);

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

  // Handle document selection
  const handleDocumentChange = (id: number,title: string) => {
      setSelectedDocument(id);
      setSelectedDocumentName(title);
      setShowDocumentDropdown(false); // Close dropdown after selection
  };

  // Handle type link selection
  const handleTypeLinkChange = (id: number,typeName: string) => {
      setSelectedTypeLink(id);
      setSelectedTypeLinkName(typeName);
      setShowTypeLinkDropdown(false); // Close dropdown after selection

  };

  const handleAdd = () => {
    if (!selectedDocument || !selectedTypeLink) {
      setShowAlert(true);
      setAlertMessage('Please fill in the mandatory fields marked with the red star (*). ')
      return; // Prevent submission if there are errors
    }
    if(documentLinks.some(link => link.documentId === selectedDocument && link.linkId === selectedTypeLink)){
      setAlertMessage('Sorry, the connection already exists...')
      setShowAlert(true);
      return; // Prevent submission if there are errors
    }
    setDocumentLinks(prevLinks => [
      ...prevLinks,
      {
        documentName: selectedDocumentName,
        documentId: selectedDocument,
        linkId: selectedTypeLink,
        linkName: selectedTypeLinkName
      }
    ]);
    setSelectedDocument(null)
    setSelectedTypeLink(null)
    setSelectedDocumentName('')
    setSelectedTypeLinkName('')
  };

  const handleLink = async () => {
    // First add the document
    try {
        const doc = await API.addDocument(
            {title: document.title, 
            stakeHolders: document.stakeHolders, 
            scale: document.scale, 
            issuanceDate: document.issuanceDate, 
            type: document.type, 
            language: document.language, 
            pages: document.pages, 
            description: document.description}
        );

        if (newDocumentCoordinates) {
            console.log(doc.id);
            // Add the coordinates if they exist
            await API.setDocumentCoordinates(doc.id, newDocumentCoordinates);
        }

        if (documentLinks.length !== 0) console.log(doc.id);

        // Implement API call to add link

        for (const link of documentLinks) {
            if (link.documentId && link.linkId) {
                await API.addLink(doc.id, link.documentId, link.linkId);
            }
        }

        if (filesUploaded.length !== 0) console.log("new files");

        for (const file of filesUploaded) {
            console.log(file);

            // Step 1: Read the file content as a Uint8Array
            const fileData = await file.arrayBuffer(); // Convert to ArrayBuffer
            const uint8Array = new Uint8Array(fileData); // Convert to Uint8Array

            // Step 2: Convert Uint8Array to binary string using a loop
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Data = btoa(binaryString); // Convert to base64

            // Step 3: Call the API to upload the resource
            try {
                const response = await API.addResourceToDocument(
                    doc.id,        // Replace with the actual document ID
                    file.name,     // Use the file name
                    base64Data     // Pass the file data as base64 string
                );
                console.log("File uploaded successfully:", response);
            } catch (error) {
                console.error("Failed to upload file:", file.name, error);
            }

        }
    } catch (err) {
        setShowAlert(true);
        setAlertMessage('Something went wrong...');
    }

    // Refresh of documents
    refreshDocumentsCoordinates();
    handleClose();

    // Reset values
    setSelectedDocument(null);
    setSelectedTypeLink(null);
    setSelectedDocumentName('');
    setSelectedTypeLinkName('');
    setDocumentLinks([]);
};


 const confirmDelete = (documentId:number | null, linkId: number | null) => {
  setDocumentLinks(prevLinks => 
    prevLinks.filter(link => !(link.documentId === documentId && link.linkId === linkId))
  );
  console.log(documentLinks);
 };


  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  


  return (
      <>
          <div className="flex-grow p-4">
            <Row>
              <Col xs={12} md={4}>
                <div className=" flex items-center justify-center bg-gray-100">
                  {showAlert &&
                    <Alert
                        message={alertMessage}
                        onClose={() => {
                            setShowAlert(false);
                        }}
                    />
                  }
                  <div className="rounded-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">Add New Link</h2>
                    {/* Separator Line */}
                    <hr className="border-gray-300 my-4" />

                    {/* Document Selection Dropdown */}
                    <div className="relative mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        <b>1.</b> Select Document <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                            onClick={() => {
                                setShowDocumentDropdown(!showDocumentDropdown);
                                setShowTypeLinkDropdown(false); // Close types of link dropdown
                            }}
                            className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none border-gray-300}`}
                        >
                          <span>
                              {selectedDocument
                                  ? documents.find(doc => doc.id === selectedDocument)?.title || 'Select a document'
                                  : 'Select a document'}
                          </span>
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        </button>

                        {showDocumentDropdown && (
                          <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10 animate-dropdown-open">
                            
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder="Search documents..."
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(element) => setSearchQuery(element.target.value)}
                              />
                            </div>


                            {filteredDocuments.length === 0 ? (
                              <div className="p-2 text-gray-500">No documents available</div>
                            ) : (
                              filteredDocuments.map((document) => (
                                <label
                                  key={document.id}
                                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleDocumentChange(document.id,document.title)}
                                >
                                  <span className="text-gray-700">{document.title}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type of Link Selection Dropdown */}
                    <div className="relative mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        <b>2.</b> Select Link Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => {
                              if(selectedDocument){
                                  setShowTypeLinkDropdown(!showTypeLinkDropdown);
                                  setShowDocumentDropdown(false); // Close document dropdown
                              }
                          }}
                          className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none border-gray-300}`}
                          style={{ backgroundColor: !selectedDocument ? 'gray' : 'white' }} // Change background color based on document selection
                        >
                          <span>
                              {selectedTypeLink
                                  ? typesLink.find(type => type.id === selectedTypeLink)?.name || 'Select a type'
                                  : 'Select a type'}
                          </span>
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        </button>

                        {showTypeLinkDropdown && (
                          <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10 animate-dropdown-open">
                            {typesLink.length === 0 ? (
                                <div className="p-2 text-gray-500">No types available</div>
                              ) : (
                                typesLink.map((type) => (
                                    <label
                                      key={type.id}
                                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => handleTypeLinkChange(type.id,type.name)}
                                    >
                                      <span className="text-gray-700">{type.name}</span>
                                    </label>
                                ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="bg-blue-950 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                        onClick={handleAdd}
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={8}>
                {/* Tabella visibile solo su schermi grandi */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-4 text-left text-gray-600 font-semibold">Title</th>
                        <th className="p-4 text-left text-gray-600 font-semibold">Type of Link</th>
                        <th className="p-4 text-center text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLinks.map((doc, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
                          <td className="p-4">{doc.documentName}</td>
                          <td className="p-4">{doc.linkName}</td>
                            <td className="p-4 flex justify-center space-x-4">
                              <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc.documentId, doc.linkId)}>
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card view visibile solo su schermi piccoli */}
                <div className="block md:hidden">
                  {paginatedLinks.map((doc, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{doc.documentName}</h3>
                          <p className="text-sm text-gray-600"><strong>Type of link:</strong> {doc.linkName}</p>
                        </div>
                      </div>
                        <div className="mt-4 flex justify-end">
                          <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc.documentId, doc.linkId)}>
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                    </div>
                  ))}
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
              </Col>
            </Row>
        </div>
        <div className="flex justify-end space-x-4">
        <p className="text-sm text-gray-600 mt-2">
            This step is optional. You can submit without linking the new document to other documents at this time.
          </p>
          <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
            onClick={() => {setMode('geoRef'); handlePrevStep();}}
          >
            Back
          </button>
          <button 
              className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md" 
              onClick={handleLink} 
          >
              Submit
          </button>
        </div>
    </>
  );
}
export {AddNewDocumentLinksModal}
