import React from 'react';
import { SKIN_TYPES } from '../constants';

const SkinTypeCarousel = ({ currentIndex, onPrevious, onNext }) => {
  const currentSkin = SKIN_TYPES[currentIndex];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      {/* Single Slide Carousel */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Image Container */}
        <div className="w-full max-w-xs mb-6">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl overflow-hidden shadow-md">
            <img
              src={currentSkin.image}
              alt={currentSkin.name}
              className="w-full h-full object-cover transition-transform duration-500"
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/400?text=' + currentSkin.name;
              }}
            />
          </div>
        </div>

        {/* Nama Jenis Kulit */}
        <h3 className="text-3xl font-bold text-[#5D4037] mb-4">
          {currentSkin.name}
        </h3>

        {/* Deskripsi */}
        <p className="text-gray-600 leading-relaxed max-w-md mb-6 text-sm">
          {currentSkin.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={onPrevious}
          className="w-12 h-12 rounded-full bg-[#C4A57B] text-white hover:bg-[#B89968] transition-colors flex items-center justify-center shadow-md font-bold text-xl"
        >
          ‹
        </button>

        {/* Indicator Dots */}
        <div className="flex gap-3">
          {SKIN_TYPES.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all cursor-pointer ${
                index === currentIndex
                  ? 'w-4 h-4 bg-[#C4A57B]'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          className="w-12 h-12 rounded-full bg-[#C4A57B] text-white hover:bg-[#B89968] transition-colors flex items-center justify-center shadow-md font-bold text-xl"
        >
          ›
        </button>
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-6 text-gray-500 text-sm">
        {currentIndex + 1} / {SKIN_TYPES.length}
      </div>
    </div>
  );
};

export default SkinTypeCarousel;
