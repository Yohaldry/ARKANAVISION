import React from 'react';
import { 
  ShowcaseSection, PrototypeCard, DesktopFrame, iPhoneFrame 
} from './Prototypes.styles';

const WebShowcase = () => {
  return (
    <ShowcaseSection>
      <h2 style={{ 
        fontFamily: 'Orbitron', color: '#00f7ff', textAlign: 'center', 
        letterSpacing: '5px', marginBottom: '60px' 
      }}>
        PROTOTIPOS DISPONIBLES
      </h2>

      {webPrototypes.map((proto) => (
        <PrototypeCard key={proto.id}>
          {/* Vista Computadora */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '10px', letterSpacing: '3px', marginBottom: '10px' }}>DESKTOP VIEW</p>
            <DesktopFrame>
              <img src={proto.desktopImg} alt={proto.name} />
            </DesktopFrame>
          </div>

          {/* Vista iPhone */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '10px', letterSpacing: '3px', marginBottom: '10px' }}>MOBILE EXPERIENCE</p>
            <iPhoneFrame>
              <img src={proto.mobileImg} alt={proto.name} />
            </iPhoneFrame>
          </div>

          {/* Información del Proyecto */}
          <div style={{ maxWidth: '300px' }}>
            <h3 style={{ color: '#00f7ff', fontFamily: 'Orbitron' }}>{proto.name}</h3>
            <p style={{ color: '#adbcbf', fontSize: '12px' }}>{proto.category}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {proto.tech.map(t => (
                <span key={t} style={{ border: '1px solid #00ff44', color: '#00ff44', padding: '4px 8px', fontSize: '10px' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </PrototypeCard>
      ))}
    </ShowcaseSection>
  );
};

export default WebShowcase;