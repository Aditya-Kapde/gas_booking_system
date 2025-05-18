import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message }) => {
    return (
        <div className="loading-overlay">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <h2>{message}</h2>
                {message.includes('Payment') && (
                    <>
                        <p>Please complete the payment in your UPI app</p>
                        <p>Do not close this window</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner; 