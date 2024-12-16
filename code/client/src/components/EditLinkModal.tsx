import { useState, useEffect } from "react";
import API from "../API/API";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import Link from "../models/link";
import { DocCoordinates } from "../models/document_coordinate";

function EditLinkModal(props: any) {
    const navigate = useNavigate();

    const [typesLink, setTypesLink] = useState<Link[]>([]); // vector of types of links except one
    const [documents, setDocuments] = useState<DocCoordinates[]>([]); // vector of all documents except one

    const [selectedNewTypeLink, setSelectedNewTypeLink] = useState<number | null>(null); // Selected new type of link
    const [showTypeLinkDropdown, setShowTypeLinkDropdown] = useState(false); // State to show type link dropdown
    const [hasError, setHasError] = useState(false); // To track if there's an error
    const [showAlert, setShowAlert] = useState(false); // alert state

    const handleSubmit = async () => {
        try {
            // Check for errors if the new type link is not selected
            if (!selectedNewTypeLink) {
                setHasError(true);
                return; // Prevent submission if there are errors
            } else {
                await API.editLink(props.firstDocument.id, props.secondDocument.id, props.secondDocument.relatedLink.id, selectedNewTypeLink);
            }

            props.refreshLinks(); // Refresh the links list
            props.onHide();

            // Reset the selected type link value
            setSelectedNewTypeLink(null);
        } catch (err) {
            setShowAlert(true);
        }
    };

    // Handle type link selection
    const handleTypeLinkChange = (id: number) => {
        setSelectedNewTypeLink(id);
        setShowTypeLinkDropdown(false); // Close dropdown after selection
    };

    // When the modal is closed
    const handleHide = () => {
        props.onHide();
        setSelectedNewTypeLink(null);
    };

    useEffect(() => {
        const getTypesLink = async () => {
            try {
                const allTypes = await API.getAllLinks();
                const types = allTypes.filter(
                    (link: Link) => link.id !== props.secondDocument.relatedLink.id
                );
                setTypesLink(types);
            } catch (err) {
                setShowAlert(true);
            }
        };

        const getAllDocuments = async () => {
            try {
                const allDocuments = await API.getAllDocumentsCoordinates();
                const documents = allDocuments.filter(
                    (d: DocCoordinates) => d.id !== props.firstDocument.id
                );
                setDocuments(documents);
            } catch (err) {
                setShowAlert(true);
            }
        };

        getTypesLink().then();
        getAllDocuments().then();
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 transition-opacity animate-slide-in-left">
            <div className="bg-white rounded-lg shadow-lg w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/2 p-6 relative">
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={handleHide} // Usa la funzione che nasconde il modal
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {/* Modal Header */}
                <div className="mb-4 border-b pb-4">   
                    <h2 className="text-3xl font-semibold text-gray-800 text-center">
                        Modify Link Type
                    </h2>
                    <p className="text-center text-sm text-gray-600 mt-2">
                        You are about to modify the link type between the documents below.
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                    <span className="text-blue-600 text-xl block">
                        {props.firstDocument.title}
                    </span>
                    <span className="text-gray-500 text-sm block mt-2">
                        is linked with
                    </span>
                    <span className="text-gray-700 text-xl block mt-2">
                        {props.secondDocument.title}
                    </span>

                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Current link type: </span>
                        <span className="font-medium text-blue-700">
                        {props.secondDocument.relatedLink?.name || 'None'}
                        </span>
                    </div>
                </h3>


                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Select the New Link Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowTypeLinkDropdown(!showTypeLinkDropdown)}
                            className={`w-full px-4 py-2 border ${hasError && !selectedNewTypeLink ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none transition-all ease-in-out duration-300 hover:ring-2 ring-blue-500`}
                        >
                            {selectedNewTypeLink
                                ? typesLink.find((link) => link.id === selectedNewTypeLink)?.name
                                : "Choose a new link type"}
                        </button>
                        {showTypeLinkDropdown && (
                            <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 transition-all ease-in-out duration-500 opacity-100">
                                {typesLink.map((link) => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleTypeLinkChange(link.id)}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {hasError && !selectedNewTypeLink && (
                        <p className="text-red-500 text-xs mt-1">* Please select a link type.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-600 transition duration-200 ease-in-out"
                    >
                        Update
                    </button>
                </div>
            </div>

            {showAlert && (
                <Alert
                    message="Sorry, the connection already exists..."
                    onClose={() => {
                        setShowAlert(false);
                        navigate('/');
                    }}
                />
            )}
        </div>
    );
}

export { EditLinkModal };
