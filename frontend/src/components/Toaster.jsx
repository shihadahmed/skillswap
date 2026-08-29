'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
      style={{ zIndex: 9999 }}
      toastStyle={{
        borderRadius: '12px',
        fontFamily: 'inherit',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
      }}
    />
  );
}
