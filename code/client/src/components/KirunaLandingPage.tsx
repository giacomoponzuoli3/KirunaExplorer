import React from 'react';
import { useNavigate } from "react-router-dom";

const KirunaLandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[500px] text-white"
        style={{ backgroundImage: "url('/img/kiruna.jpg')" }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center py-24">
          <h1 className="text-5xl font-bold mb-4 text-yellow-400">Discover Kiruna</h1>
          <p className="text-lg mb-6 text-yellow-200">
            The northernmost gem of Sweden, where nature and adventure await.
          </p>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-lg"
            onClick={() => navigate("/map")}
          >
            Start To Explore
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Welcome to Kiruna</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            Nestled in the heart of Swedish Lapland, Kiruna is a breathtaking destination known for its unique
            combination of natural wonders and cultural heritage. Experience the magic of the Northern Lights, the
            Midnight Sun, and the world-famous Icehotel.
          </p>
          <img
            src="/img/kiruna2.jpg"
            alt="Kiruna Landscape"
            className="rounded-lg shadow-lg mx-auto"
          />
        </div>
      </section>

      {/* Attractions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Top Attractions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Icehotel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400">
              <img src="/img/kiruna3.jpg" alt="Icehotel" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2 text-blue-900">The Icehotel</h3>
                <p className="text-gray-600 text-sm">
                  Sleep in a room sculpted entirely out of ice and snow, a true wonder of art and nature.
                </p>
              </div>
            </div>

            {/* Northern Lights */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400">
              <img src="/img/kiruna4.jpg" alt="Northern Lights" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2 text-blue-900">Northern Lights</h3>
                <p className="text-gray-600 text-sm">
                  Witness the dazzling Aurora Borealis, a spectacle that lights up Kiruna’s skies.
                </p>
              </div>
            </div>

            {/* Kebnekaise */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400">
              <img src="/img/kiruna5.jpg" alt="Kebnekaise" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2 text-blue-900">Kebnekaise</h3>
                <p className="text-gray-600 text-sm">
                  Hike to the summit of Sweden's highest peak and enjoy unparalleled views.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Adventures Await</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">Dog Sledding</h3>
              <p className="text-gray-600 mb-4">
                Glide through snowy landscapes led by a team of eager sled dogs. A must-try experience for thrill-seekers!
              </p>
            </div>
            <img
              src="/img/kiruna6.jpg"
              alt="Dog Sledding"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-blue-900 text-yellow-200">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm">&copy; 2024 Kiruna Explorer. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default KirunaLandingPage;
