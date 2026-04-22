import React from 'react';
import Navbar from '../components/Navbar'; 
import Hero from '../components/Hero'; 
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Footer from '../components/Footer';
import FloatingBot from '../components/FloatingBot';
import ProgressWidget from '../components/ProgressWidget';
import { Reveal } from '../components/Reveal';
import Consulting from '../components/Consulting'

const Home = () => {
  return (
    <div className="min-h-screen bg-[#030712] selection:bg-blue-500/30">
      <Navbar />
      
      {/* Luces de fondo globales si las quieres mantener */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <main>
        {/* REEMPLAZAMOS TODO EL CÓDIGO LARGO ANTERIOR POR ESTO: */}
        <Reveal width="100%" delay={0.2}>
          <Hero /> 
        </Reveal>

        {/* --- RESTO DE LAS SECCIONES --- */}
        <div className="max-w-7xl mx-auto px-6">
            <Reveal width="100%" delay={0.4}>
              <Services />
            </Reveal>

            <Reveal width="100%" delay={0.6}>
              <Portfolio />
            </Reveal>

            <Reveal width="100%" delay={0.4}>
              <Consulting />
            </Reveal>

            <Footer />
        </div>

        <ProgressWidget />
        <FloatingBot />
      </main>
    </div>
  );
};

export default Home;