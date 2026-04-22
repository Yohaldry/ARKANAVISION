import React from 'react';
import HeroDesktop from './HeroDesktop';
import HeroMobile from './HeroMobile';

const Hero = () => {
  return (
    <>
      {/* Se muestra solo en pantallas grandes (lg) */}
      <div className="hidden lg:block">
        <HeroDesktop />
      </div>
      
      {/* Se muestra solo en pantallas pequeñas y medianas */}
      <div className="block lg:hidden">
        <HeroMobile />
      </div>
    </>
  );
};

export default Hero;