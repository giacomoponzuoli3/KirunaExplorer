import React from 'react';

interface StepperProps {
    steps: string[];
    activeStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, activeStep }) => {
    return (
        <div className="flex items-center justify-center space-x-5">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                    {/* Step Circle */}
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            index <= activeStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}
                    >
                        {index + 1}
                    </div>
                    {/* Step Label */}
                    <div
                        className={`text-sm ${
                            index <= activeStep ? 'text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        {step}
                    </div>
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`flex-1 h-0.5 ${
                                index < activeStep ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        ></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export { Stepper };