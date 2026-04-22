import React from 'react';
import ConsultingDesktop from './ConsultingDesktop';
import ConsultingMobile from './ConsultingMobile';

const ConsultingPromo = () => {
  return (
    <>
      <div className="hidden lg:block"><ConsultingDesktop /></div>
      <div className="block lg:hidden"><ConsultingMobile /></div>
    </>
  );
};

export default ConsultingPromo;