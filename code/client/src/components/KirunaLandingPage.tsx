import React from 'react';
import { useNavigate } from "react-router-dom";

const KirunaLandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-100 text-gray-800">
      
      {/* Hero Section */}
        <section
          className="relative bg-cover bg-center h-[500px] text-white"
          style={{ backgroundImage: "url('/img/kiruna.png')" }}
        >
          <div className="absolute inset-0 bg-blue-900 bg-opacity-30"></div> 
          <div className="relative max-w-4xl mx-auto text-center py-24">
            <h1 className="text-5xl font-bold mb-4 text-yellow-400">Discover Kiruna</h1>
            <p className="text-lg mb-6 text-yellow-400 shadow-md">
              The northernmost gem of Sweden, where nature and adventure await.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-lg"
                onClick={() => navigate("/map")}
              >
                Go to Map
              </button>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-lg"
                onClick={() => navigate("/diagram")}
              >
                Go to Diagram
              </button>
            </div>
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
            src="/img/kiruna1.png"
            alt="Kiruna Landscape"
            className="rounded-lg shadow-lg mx-auto"
          />
        </div>
      </section>

      {/* Historical Highlights Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Kiruna's Historical Evolution</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            Kiruna’s history is deeply tied to its natural resources and the Sami culture. From its founding by Hjalmar Lundbohm
            to the current city relocation project, Kiruna embodies resilience and innovation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-2 text-blue-900">First Colonization</h3>
              <p className="text-gray-600 text-sm">
                In the late 19th century, Kiruna became central to Europe’s iron ore extraction, producing 83% of the continent's supply.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-blue-900">Kiruna's Relocation</h3>
              <p className="text-gray-600 text-sm">
                Due to mining-induced ground deformations, Kiruna has embarked on an unprecedented urban relocation project to ensure safety and sustainability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urban Transformation Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Kiruna: A City in Motion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">The Urban Relocation Project</h3>
              <p className="text-gray-600 mb-4">
                The relocation process started in 2004 and is planned to conclude by 2035. Iconic buildings, including the town
                hall and church, are being carefully moved to preserve Kiruna's cultural heritage.
              </p>
            </div>
            <img
              src="/img/kirunaRel.png"
              alt="Kiruna Relocation"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Mining Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">The Mines of Kiruna</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            Kiruna is home to the world’s largest underground iron ore mine, the Kiirunavaara mine, operated by LKAB. This mine 
            has been the cornerstone of Kiruna's economy and development since the late 19th century.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <img
              src="/img/kirunaMine.png"
              alt="Kiirunavaara Mine"
              className="rounded-lg shadow-lg"
            />
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">A Technological Marvel</h3>
              <p className="text-gray-600 mb-4">
                The Kiirunavaara mine spans over 500 kilometers of underground roads, reaching a depth of 1,365 meters. Every day, 
                68,000 tons of iron ore are extracted, making it a critical resource for Europe’s steel industry.
              </p>
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">Economic Impact</h3>
              <p className="text-gray-600">
                The mine contributes significantly to Sweden’s GDP, generating 3.5 billion euros in annual revenue and employing 
                20% of Kiruna’s population. Its success is a testament to innovation and resource management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Website Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">About This Website</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            This web app is designed to showcase the unique history, culture, and transformation of Kiruna, Sweden. 
            From its Arctic wonders to its innovative urban relocation, discover the stories that make Kiruna a truly one-of-a-kind destination.
          </p>
          <p className="text-lg text-gray-600 text-center mb-6">
            Whether you’re an urban planner, a curious visitor, or a local resident, this platform offers an interactive way 
            to explore Kiruna’s past, present, and future.
          </p>
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
