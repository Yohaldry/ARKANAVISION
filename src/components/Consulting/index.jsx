import React from 'react';
import ConsultingDesktop from './ConsultingDesktop';
import ConsultingMobile from './ConsultingMobile';

const ConsultingPromo = () => {
  return (
    <>
      <div id="consulting" className="hidden lg:block"><ConsultingDesktop /></div>
      <div id="consulting" className="block lg:hidden"><ConsultingMobile /></div>
    </>
  );
};

export default ConsultingPromo;