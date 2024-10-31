
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Document } from "../models/document";
import API from "../API/API";
import Alert from "./Alert";


function AddLinkModal(props: any) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(''); //title of document
    const [stakeholders, setStakeholders] = useState([]); //vector of stakeholders
    const [typesLink, setTypesLink] = useState([]); //vector of types of links
    const [documents, setDocuments] = useState([]); //vector of all documents expect one

    const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]); // Selected stakeholders in the form

    const [showAlert, setShowAlert] = useState(false); // alert state

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
        };

        //get all stakeholders
        const getAllStakeholders = async () => {
            try{
                const allStakeholders = await API.getAllStakeholders();
                setStakeholders(allStakeholders);
            }catch(err){
                setShowAlert(true);
            }
        };

        getAllStakeholders();
        getTypesLink();
        getAllDocuments();
    }, [])

    // Update selected stakeholders when the user selects or deselects an option
    const handleStakeholderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions: string[] = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedStakeholders( selectedOptions  );
    };


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
                    <select
                        id="stakeholders"
                        multiple
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedStakeholders}
                        onChange={handleStakeholderChange}
                    >
                        {stakeholders.map((stakeholder: any) => (
                            <option key={stakeholder.id} value={stakeholder.id}>
                                {stakeholder.name} ({stakeholder.category})
                            </option>
                        ))}
                    </select>
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

