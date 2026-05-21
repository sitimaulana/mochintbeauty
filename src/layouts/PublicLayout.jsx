import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "../components/member/Navbar";
import Footer from "../components/common/Footer";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Navbar diletakkan di atas (Sticky opsional) */}
      <Navbar />

      {/* 2. Main content dibiarkan tumbuh (flex-grow) tanpa dikunci overflow-nya */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Footer component */}
      <Footer />
    </div>
  );
};

export default PublicLayout;