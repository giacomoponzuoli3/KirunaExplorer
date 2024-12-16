import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../API/API";
import Alert from "./Alert";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "../models/link";
import { DocCoordinates } from "../models/document_coordinate";

function AddLinkModal(props: any) {
    const navigate = useNavigate();

    const [typesLink, setTypesLink] = useState<Link[]>([]); // vector of types of links
    const [documents, setDocuments] = useState<DocCoordinates[]>([]); // vector of all documents except one

    const [selectedDocument, setSelectedDocument] = useState<number | null>(null); // Selected document
    const [selectedTypeLink, setSelectedTypeLink] = useState<number | null>(null); // Selected type of link

    const [showAlert, setShowAlert] = useState(false); // alert state
    const [showDocumentDropdown, setShowDocumentDropdown] = useState(false); // State to show document dropdown
    const [showTypeLinkDropdown, setShowTypeLinkDropdown] = useState(false); // State to show type link dropdown

    const [hasError, setHasError] = useState(false); // To track if there's an error

    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = async () => {
        // Check for errors
        if (!selectedDocument || !selectedTypeLink) {
            setHasError(true);
            return; // Prevent submission if there are errors
        }

        try{
            // Implement API call to add link
            await API.addLink(props.idDocument, selectedDocument, selectedTypeLink);

            props.onHide();
            props.refreshLinks(); // Richiama la funzione di aggiornamento
            //reset of values
            setSelectedDocument(null)
            setSelectedTypeLink(null)
        }catch(err){
            setShowAlert(true);
        }
    };

    const handleHide = () =>{
        props.onHide();
        setSelectedDocument(null);
        setSelectedTypeLink(null);
    }

    useEffect(() => {
        const getTypesLink = async () => {
            try {
                const types = await API.getAllLinks();
                setTypesLink(types);
            } catch (err) {
                setShowAlert(true);
            }
        };

        const getAllDocuments = async () => {
            try {
                const allDocuments = await API.getAllDocumentsCoordinates();
                const documents = allDocuments.filter((d: DocCoordinates) => d.id != props.idDocument);
                setDocuments(documents);
            } catch (err) {
                setShowAlert(true);
            }
        };

        getTypesLink().then();
        getAllDocuments().then();
    }, []);

    // Handle document selection
    const handleDocumentChange = (id: number) => {
        setSelectedDocument(id);
        setShowDocumentDropdown(false); // Close dropdown after selection
    };

    // Handle type link selection
    const handleTypeLinkChange = (id: number) => {
        setSelectedTypeLink(id);
        setShowTypeLinkDropdown(false); // Close dropdown after selection
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!props.show) {
        return (
            <div className="p-4">
                {showAlert && <Alert
                    message="Sorry, something went wrong..."
                    onClose={() => {
                        setShowAlert(false);
                        navigate('/');
                    }}
                />}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-slide-in-left">
            {showAlert &&
                <Alert
                    message="Sorry, the connection already exists..."
                    onClose={() => {
                        setShowAlert(false);
                    }}
                />
            }
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 relative">
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={handleHide} // Usa la stessa funzione per nascondere il modal
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
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
                            className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none ${hasError && !selectedDocument ? 'border-red-500' : 'border-gray-300'}`}
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
                                
                                <div className="=p-2">
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
                                            onClick={() => handleDocumentChange(document.id)}
                                        >
                                            <span className="text-gray-700">{document.title}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {hasError && !selectedDocument && (
                        <span className="text-red-500 text-sm">This field is required</span>
                    )}
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
                            className={`w-full border rounded-md p-2 flex items-center justify-between focus:outline-none ${hasError && !selectedTypeLink ? 'border-red-500' : 'border-gray-300'}`}
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
                                            onClick={() => handleTypeLinkChange(type.id)}
                                        >
                                            <span className="text-gray-700">{type.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {hasError && !selectedTypeLink && (
                        <span className="text-red-500 text-sm">This field is required</span>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end">
                    <button
                        className="bg-blue-950 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                        onClick={handleSubmit}
                    >
                        Add Link
                    </button>
                </div>
                
                {/* Required Fields Note */}
                <p className="text-sm text-gray-500 mt-4 text-center">
                    <span className="text-red-500">*</span> Fields marked with an asterisk are mandatory
                </p>
            </div>
        </div>
    );
}

export { AddLinkModal };
