import styled from 'styled-components';

export const ShowcaseSection = styled.section`
  padding: 80px 20px;
  background: #05080a;
`;

export const PrototypeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 100px;
  align-items: center;

  @media (min-width: 1024px) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

export const DesktopFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  border-top: 20px solid #1a1a1a;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 20px 50px rgba(0, 247, 255, 0.15);
  
  img {
    width: 100%;
    display: block;
    border: 2px solid #1a1a1a;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 110%;
    height: 10px;
    background: #222;
    border-radius: 0 0 20px 20px;
  }
`;

export const iPhoneFrame = styled.div`
  position: relative;
  width: 200px;
  height: 410px;
  border: 8px solid #1a1a1a;
  border-radius: 30px;
  background: #000;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  /* Notch del iPhone */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 18px;
    background: #1a1a1a;
    border-radius: 0 0 10px 10px;
    z-index: 10;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;