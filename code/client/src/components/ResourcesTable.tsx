import { useParams, useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from 'react-bootstrap';
import API from "../API/API";
import { TrashIcon, PlusIcon, FaceFrownIcon, ChevronRightIcon, ChevronLeftIcon, DocumentIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Alert from "./Alert";
import ConfirmModal from './ConfirmModal';
import { DocCoordinates } from "../models/document_coordinate";
import Resources from "../../../common_models/original_resources";


function ResourcesTable(props: any) {
    const navigate = useNavigate();

    const { idDocument } = useParams();
    const [selectedDoc, setSelectedDoc] = useState<DocCoordinates | null>(null);
    const [files, setFiles] = useState<File[]>([]);//resources
    const linkRef = useRef<HTMLAnchorElement>(null);
    
    const [showModal, setShowModal] = useState(false);
    const [refreshPage, setRefreshPage] = useState(false);

    const [resources, setResources] = useState<Resources[]>([]);

    //delete
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
    const [resourceIdToDelete, setResourceIdToDelete] = useState<number | null>(null);

    //modal
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [messageSucessful, setMessageSucessful] = useState('');
    const [showModalAddResource, setShowModalAddResource] = useState(false);
    const [showAlertMessage, setShowAlertMessage] = useState(false);//error in modal add resource
    const [alertMessage, setAlertMessage] = useState('');//error message in modal add resources

    //loading
    const [loading, setLoading] = useState(true);  // stato di caricamento

    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [paginatedResources, setPaginatedResources] = useState<Resources[]>([]);
    const itemsPerPage = 4; // Number of items to show per page

    // Calculate total pages
    const totalPages = Math.ceil(resources.length / itemsPerPage);

    // Handle pagination button clicks
    const handleNextPage = () => {
     if (currentPage < totalPages) {
       console.log(paginatedResources)
       setPaginatedResources(resources.slice(
        (currentPage) * itemsPerPage, 
        (currentPage + 1) * itemsPerPage
      ))
       setCurrentPage(currentPage + 1);
     }
    };

    const handlePrevPage = () => {
     if (currentPage > 1) {
      setPaginatedResources(resources.slice(
        (currentPage - 2) * itemsPerPage, 
        (currentPage - 1) * itemsPerPage
      ))
       setCurrentPage(currentPage - 1);
     }
    };

    //delete resource
    const handleDelete = async () => {
        if (documentToDelete && resourceToDelete) {
            await API.deleteResource(documentToDelete, resourceToDelete)

            setResources(resources.filter(res => (res.id !== resourceIdToDelete)));
            setShowModal(false);
            setDocumentToDelete(null)
            setResourceToDelete(null)
            setResourceIdToDelete(null)
        }
        console.log('real deleted')
    };

    //open delete modal
    const handleDeleteResource = (res: Resources) => {
      setShowModal(true);
      setDocumentToDelete(res.idDoc);
      setResourceToDelete(res.name);
      setResourceIdToDelete(res.id)
      console.log('hi delete')
    } 

    //add new resource
    const handleSubmitResource = async () => {
      if(files.length == 0){
        setAlertMessage('Please upload your file')
        setShowAlertMessage(true)
      }

      const fileNames = files.map(file => file.name);
      const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        setAlertMessage(
          `Duplicate file names detected: ${[...new Set(duplicates)].join(', ')}. Please remove duplicates.`
        );
        setShowAlertMessage(true);
        return; // Exit early
      }

      const existingResourceNames = resources.map(resource => resource.name);
      const alreadyExisting = fileNames.filter(name => existingResourceNames.includes(name));
      if (alreadyExisting.length > 0) {
        setAlertMessage(
          `The following file names already exist in resources: ${alreadyExisting.join(', ')}. Please rename or remove them.`
        );
        setShowAlertMessage(true);
        return; // Exit early
      }
      
      if (files.length !== 0 && selectedDoc!=null) {

        for (const file of files) {
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
                    selectedDoc.id,        // Replace with the actual document ID
                    file.name,     // Use the file name
                    base64Data     // Pass the file data as base64 string
                );
                setMessageSucessful('File uploaded successfully!');

                // Clear the message after 3 seconds
                setTimeout(() => {
                  setMessageSucessful('');
                }, 3000);
                await getResources()
            } catch (error) {
                console.error("Failed to upload file:", file.name, error);
            }
        }
          setShowModalAddResource(false);
        setFiles([])
    }
      
  };

  //open add resource modal
  const handleAddResource = () => {
    setShowModalAddResource(true)
    setShowAlertMessage(false)
    setAlertMessage('')
  }

  //close add resource modal
  const handleCloseModal = () => {
    setShowModalAddResource(false)
    setFiles([])
  }

  //upload new resource (inside modal not db)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files; // HTMLInputElement.files can be FileList or null
    if (fileList) {
      const oversizedFiles = Array.from(fileList).filter(file => file.size > 50 * 1024 * 1024); // 50 MB
      const notOversizedFiles = Array.from(fileList).filter(file => file.size < 50 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setAlertMessage(
          `The following files exceed 50 MB: ${oversizedFiles
            .map(file => file.name)
            .join(', ')}.`
        );
        setShowAlertMessage(true);
      }
      setFiles((prevFiles) =>  [...prevFiles, ...notOversizedFiles]);
    
    }
    event.target.value = '';
  };

  //delete uploaded file (inside modal)
  const handleDeleteFile = (index: number) => {
    setFiles((prevFiles) => 
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const truncateFileName = (fileName: string, maxLength = 35) => {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + '...';
    }
    return fileName;
  };
    
  const getResources = async () => {
    const documentId = Number(idDocument);
    const documentResources = await API.getAllResourcesData(documentId);
    setResources(documentResources);
  }

  const handleDownload = useCallback(async (idDoc: number, idRes: number, fileName: string) => {
    try {

      // Assuming the backend sends the file data as JSON with a `unit8Array` property
      const response = await API.getResourceData(idDoc,idRes);
      // Log the entire response to inspect it
      console.log("API Response:", response);

      console.log(response)

      // Step 2: Convert Uint8Array to Blob
      const blob = new Blob([new Uint8Array(response.data)], { type: "application/octet-stream" });

      // Set the href and download attributes of the static link
      const url = URL.createObjectURL(blob);
      // Create a temporary link for downloading the file
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Set the file name for the download
      a.click(); // Trigger the download
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading file:", error);
    }
  },[]);

    useEffect(() => {
        const getDocument = async () => {
            try{
                setLoading(true);  // Imposta lo stato di caricamento a true
                const documentId = Number(idDocument);
                const document = await API.getDocumentById(documentId);
                setSelectedDoc(document);
            }catch(err){
                setShowAlert(true);
            } finally {
              setLoading(false);  // Imposta lo stato di caricamento a false dopo la chiamata API
            }
        };

        getDocument().then();
    }, [idDocument])

    useEffect(() => {
      const fetchData = async () => {
          try {
              await getResources();  // Usa await per attendere la promessa
          } catch (err) {
              setShowAlert(true); // Gestisci gli errori
          } finally {
              setLoading(false); // Assicurati che setLoading venga chiamato dopo l'esecuzione
          }
      };
  
      fetchData().then();
    }, [idDocument]);

    useEffect(() => {
      // Check if we need to update the current page
      const isLastPage = totalPages < currentPage;
  
      // If the current page is the last page and we're deleting the last link on it, go to the previous page
      if (isLastPage && currentPage > 1) {
        setPaginatedResources(resources.slice(
          (currentPage - 2) * itemsPerPage, 
          (currentPage - 1) * itemsPerPage
        ))
        setCurrentPage(prevPage => prevPage - 1); // Decrement the page
      }else{
        setPaginatedResources(resources.slice(
          (currentPage - 1) * itemsPerPage, 
          currentPage * itemsPerPage
        ))
      }
      
    }, [resources]);


    if (loading) {
      return <div>Loading...</div>; 
    }

    if (selectedDoc == null){
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
               {/* Show the message if it's not empty */}
               <div className="p-4">
                  {messageSucessful && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#DFF2BF',
                        color: '#4F8A10',
                        borderRadius: '5px',
                        transition: 'opacity 0.5s ease-in-out',
                      }}
                    >
                      {messageSucessful}
                    </div>
                  )}
                </div>
              <h2 className="text-xl font-normal text-gray-600 mb-1 text-center">
                Resources of
              </h2>
              <h2 className="text-3xl font-bold text-black-600 text-center mb-6">
                {selectedDoc.title}
              </h2>

              <div className="relative mb-2">
                <div className="flex justify-between items-center mt-0">
                  {/* Add Resource Button */}
                  {props.isLogged && props.user.role === "Urban Planner" && resources.length !== 0 ? (
                    <button
                      className="flex items-center justify-center bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition duration-200"
                      onClick={handleAddResource}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      <span>Add Resource</span>
                    </button>
                  ) : (
                    <div></div> /* Empty div to maintain spacing when Add Resource is not present */
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={handlePrevPage}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="text-gray-700 mt-2">Page {currentPage} of {totalPages}</span>
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
              </div>

              
              {(resources.length === 0 && !loading) ? (
                <div className="flex flex-col items-center mt-6">
                  <FaceFrownIcon className="h-10 w-10 text-gray-400" />
                  <p className="text-lg text-gray-500 mt-2">No resources available</p>
                  {props.isLogged && props.user.role == "Urban Planner" && (
                    <button
                      className="flex items-center justify-center bg-green-600 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200 mt-4"
                      onClick={handleAddResource}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      <span>Add Resource</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg table-auto">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-4 text-left text-sm font-semibold w-[15%]">Name</th>
                        <th className="p-4 text-left text-sm font-semibold w-[15%]">Date uploaded</th>
                        {/* <th className="p-4 text-left text-sm font-semibold w-[10%]">Size</th> */}
                        <th className="p-4 text-left text-sm font-semibold w-[5%]">Actions</th>

                      </tr>
                    </thead>
                    <tbody>
                      {paginatedResources.map((resource, index) => (
                        <tr key={index} className={`border-b transition duration-200 ease-in-out 
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        `}>
                          <td className="p-4 text-sm text-gray-600 w-[15%]" >{resource.name}</td>
                          <td className="p-4 text-sm text-gray-600 w-[15%]">{String(resource.uploadTime)}</td>
                          {/* <td className="p-4 text-sm text-gray-600 w-[10%]"></td> */}
                          
                            <td className="p-3 items-center justify-center space-x-4 w-[5%]">
                                <button
                                   onClick={(e) => {
                                      e.preventDefault();
                                      handleDownload(resource.idDoc, resource.id, resource.name).then();
                                    }}
                                   className="text-blue-500 cursor-pointer hover:text-blue-700"
                                  >
                                    <ArrowDownTrayIcon className="h-5 w-5"/>
                                </button>
                              {props.isLogged && props.user.role == "Urban Planner" && (
                                <>
                                  <button
                                  
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {handleDeleteResource(resource)}}
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
          
                </>
              )}
          
              {props.isLogged && props.user.role == "Urban Planner" && (
                <>
                  <ConfirmModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onConfirm={handleDelete}
                    text={`Are you sure you want to delete ${resourceToDelete}?
                    This action cannot be undone.`}
                  />
                 
                </>
              )}

              {showModalAddResource && (
                          <Modal size="xl" show={true} onHide={handleCloseModal} aria-labelledby="example-modal-sizes-title-lg">
                          <Modal.Header closeButton className="bg-gray-100">
                            <Modal.Title id="example-modal-sizes-title-lg" className="text-2xl font-bold text-gray-800">
                              Add New Resource
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="bg-white">
                            <div className="px-6 py-4 space-y-6">
                              {/* Alerts */}
                              {showAlertMessage && (
                                <Alert
                                  message={alertMessage}
                                  onClose={() => {setShowAlertMessage(false); setAlertMessage('')}}
                                />
                              )}
                  
                              <form className="space-y-12">
                  
                                  {/* Section 4: Resources files */}
                                  <div className="space-y-12">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                      You can add resource 
                                    </h3>
                  
                                    {/* File Upload Field */}
                                    <div className="p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50">
                                        <div className="space-y-2">
                                            <label htmlFor="formFile" className="block text-sm font-medium text-gray-600">
                                                Upload File (<span style={{ color: 'red' }}>*</span>)
                                            </label>
                                            <input
                                                type="file"
                                                id="formFile"
                                                multiple
                                                onChange={handleFileChange}
                                                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 px-2 py-2"
                                            />
                                        </div>
                  
                                        {/* Selected Files Section */}
                                        {files.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Files</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {files.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between border border-gray-300 p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
                                                        >
                                                            {/* File Info */}
                                                            <div className="flex items-center space-x-2">
                                                                <DocumentIcon className="h-6 w-6 text-blue-500" />
                                                                <span className="font-medium text-gray-800 truncate">
                                                                    {truncateFileName(file.name,35)} ({(file.size / 1024).toFixed(2)} KB)
                                                                </span>
                                                            </div>
                  
                                                            {/* Delete Button */}
                                                            <button
                                                                type="button"
                                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDeleteFile(index);
                                                                }}
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                  
                              </form>
                            </div>
                          </Modal.Body>
                          <Modal.Footer className="bg-gray-100 flex justify-end space-x-4">
                            <button
                              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                              onClick={handleCloseModal}
                            >
                              Close
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-950 hover:bg-blue-500 text-white rounded-md"
                              onClick={handleSubmitResource}
                            >
                              Add
                            </button>
                          </Modal.Footer>
                        </Modal>
                        )}
            </div>
          );
          
    }

    
}

export { ResourcesTable };
