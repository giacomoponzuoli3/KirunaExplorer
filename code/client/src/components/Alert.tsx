import React from 'react';
import AlertIcon from '../img/alert-icon.png'

interface AlertProps {
    message: string;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-red-700 text-white p-6 rounded shadow-lg">
                <div className="flex items-center">
                    <img src={AlertIcon} alt="Alert Icon" className="text-white h-6 w-6 mr-2" />
                    <span>{message}</span>
                    <button className="ml-4 text-white" onClick={onClose}>
                        &times;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;
