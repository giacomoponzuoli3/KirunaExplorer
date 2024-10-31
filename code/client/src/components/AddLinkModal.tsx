import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Document } from "../models/document";
import API from "../API/API";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "react-bootstrap";
import Alert from "./Alert";
import ConfirmModal from './ConfirmModal';
import { Container } from "react-dom";

function AddLinkModal(props: any) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [typesLink, setTypesLink] = useState([]);
    const [showAlert, setShowAlert] = useState(false); // alert state
    const [documents, setDocuments] = useState([]);

    const handleSubmit = () => {
        // Implement API call to add link, if necessary
        // After submission, close modal
        props.onHide();
    };

    useEffect(() => {
        //get all types of links at the load of the page
        const getTypesLink = async () => {
            try{
                const types = await API.getAllLinks();
                setTypesLink(types);
            }catch(err){
                setShowAlert(true);
            }
        };
        //get all documents excluded one at the load of the page
        const getAllDocuments = async () => {
            try{
                const allDocuments = await API.getAllDocuments();
                const documents = allDocuments.filter((d: Document) => d.id !== props.idDocument );
                setDocuments(documents);
            }catch(err){
                setShowAlert(true);
            }
        }

        getTypesLink();
        getAllDocuments();
    }, [])

    

    if (!props.show) {
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
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* Show the alert if something went wrong */}
            { showAlert &&  
                <Alert
                    message="Sorry, something went wrong..."
                    onClose={() => {
                        setShowAlert(false);
                        navigate('/');
                    }}
                />
            }
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
                
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        id="title"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="stakeholders" className="block text-gray-700 font-medium mb-2">Stakeholders</label>
                    <input
                        type="text"
                        id="stakeholders"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={stakeholders}
                        onChange={(e) => setStakeholders(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 mr-2 hover:bg-gray-400"
                        onClick={props.onHide}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                        onClick={handleSubmit}
                    >
                        Add Link
                    </button>
                </div>
            </div>
        </div>
    );
}
export {AddLinkModal}

