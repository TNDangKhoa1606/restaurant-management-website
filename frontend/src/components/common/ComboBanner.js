import React from 'react';
import comboImage from '../../assets/images/imgcombo.png';

const ComboBanner = () => {
  return (
    <div className="combo-banner-container">
      <div className="container mx-auto">
        <img src={comboImage} alt="Combo promotion" className="w-full" />
      </div>
    </div>
  );
};

export default ComboBanner;