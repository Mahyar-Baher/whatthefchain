import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BackgroundWithCursor from './Components/BackgroundWithCursor';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
  
  <BackgroundWithCursor
      particleCount={200}
      particleSpread={10}
      speed={0.1}
      particleColors={["#ffffff", "#00ff00", "#0000ff", "#ff5000"]} // Example colors
      moveParticlesOnHover={true}
      particleHoverFactor={1}
      alphaParticles={true}
      particleBaseSize={100}
      sizeRandomness={1}
      cameraDistance={20}
      disableRotation={false}
    >
    <App />
    </BackgroundWithCursor>
  </StrictMode>,
);