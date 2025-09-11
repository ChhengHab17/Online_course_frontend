// ModalLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModalLayout({ children }) {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 sm:p-6">
            {React.cloneElement(children, { onClose: handleClose })}
        </div>
    );
}