import { useEffect } from 'react';
import './App.css';
import Footer from './Components/Footer';
import Header from './Components/Header';
import Main from './Components/Main';

export default function App() {
  useEffect(() => {
    let val = 90;
    let dir = -1;
  
    const interval = setInterval(() => {
      document.body.style.setProperty('--black-radius', val + '%');
      val += dir;
      if (val <= 0 || val >= 90) dir *= -1;
    }, 50);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <Header />
    <Main />
    <Footer />
    </>
  );
}