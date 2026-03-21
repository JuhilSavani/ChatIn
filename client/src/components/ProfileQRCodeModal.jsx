import React, { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from 'react-toastify';

const ProfileQRCodeModal = ({ dialogRef, user, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Generate the full URL with the user's email as a connect parameter
  const connectUrl = `${window.location.protocol}//${window.location.host}/?connect=${encodeURIComponent(user?.email || '')}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(connectUrl);
      setIsCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="absolute top-1/2 left-1/2 w-[min(430px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-black/25 border-b-[5px] bg-bisque text-primary-black backdrop:bg-primary-black/25"
    >
      <div className="p-5 sm:p-8 flex flex-col items-center">
        <h3 className="w-full text-center text-lg border-b-[3px] border-dashed border-primary-black mb-4 pb-2">Your Profile QR</h3>
        
        <p className="text-sm font-medium mb-4 text-center">
          Show this code to a friend, or share your link so they can easily connect with you!
        </p>

        <div className="bg-primary-white p-4 rounded-md border-2 border-primary-black/25 mb-4">
          {user?.email && (
            <QRCode 
              value={connectUrl} 
              size={200}
              bgColor="#FFFFFF"
              fgColor="#333333"
              level="M"
            />
          )}
        </div>

        <h4 className="text-md font-bold text-center m-0 leading-tight">{user?.name}</h4>
        <span className="text-sm opacity-80 mb-6">{user?.email}</span>

        <div className="flex w-full justify-center gap-4">
          <button 
            type="button" 
            className="flex-1 bg-primary-white text-sm py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center justify-center font-semibold hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" 
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="flex-1 bg-primary-black text-white text-sm py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center justify-center font-semibold hover:bg-secondary-black cursor-pointer"
            onClick={handleCopyLink}
          >
             {isCopied ? <><i className="bx bx-check mr-2 text-md"></i>Copied</> : <><i className="bx bx-link-alt mr-2 text-md"></i>Copy Link</>}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileQRCodeModal;
