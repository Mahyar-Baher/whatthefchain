import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import Typed from 'typed.js';

// import مستقیم تصاویر
import imgCry from '../assets/wtfc/cry.png';
import imgPizza from '../assets/wtfc/pizza.png';
import imgLagh from '../assets/wtfc/lagh-bigger.png';
import imgmoon from '../assets/wtfc/moon.png';
import imgkiss from '../assets/wtfc/kissface.png';

const sarcasticData = [
  { text: "Grandpa! Why didn't you buy Bitcoin when it was just $100K? Now it's worth a million!", image: imgCry },
  { text: "DON'T REPEAT THE SAME MISTAKE!", image: imgPizza },
  { text: "Hey, remember that time you ignored BTC at $50K? Good times!", image: imgLagh },
  { text: "Oh, you still haven't bought Bitcoin? Cute.", image: imgkiss },
  { text: "Bitcoin just went to the moon 🚀 and you’re still on Earth!", image: imgmoon },
  { text: "Missed BTC at $10K? Don't worry, $1M is just around the corner... for someone else.", image: imgkiss },
];

export default function SarcasticText() {
  const el = useRef(null);
  const typedRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (typedRef.current) typedRef.current.destroy();

    if (fadeIn) {
      typedRef.current = new Typed(el.current, {
        strings: [sarcasticData[currentIndex].text],
        typeSpeed: 50,
        backSpeed: 20,
        showCursor: true,
        cursorChar: '',
      });
    }

    const changeTextInterval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sarcasticData.length);
        setFadeIn(true);
      }, 500);
    }, 10000);

    return () => {
      if (typedRef.current) typedRef.current.destroy();
      clearInterval(changeTextInterval);
    };
  }, [currentIndex, fadeIn]);

  return (
    <Fade in={fadeIn} timeout={1000}>
      <Box sx={{ 
        borderRadius: 4, 
        position: 'relative',
      }}>
        {/* تصویر با انیمیشن شناور */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            p:1,
            right: 10,
            width: 100,
            height: 100,
            backgroundImage: `url(${sarcasticData[currentIndex].image})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom right',
            opacity: fadeIn ? 0.8 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
            transform: fadeIn ? 'translateY(0px)' : 'translateY(10px)',
            animation: fadeIn ? 'float 3s infinite ease-in-out' : 'none',
            '@keyframes float': {
              '0%': {
                transform: 'translateY(0px) rotate(0deg)',
              },
              '25%': {
                transform: 'translateY(-5px) rotate(2deg)',
              },
              '50%': {
                transform: 'translateY(-10px) rotate(0deg)',
              },
              '75%': {
                transform: 'translateY(-5px) rotate(-2deg)',
              },
              '100%': {
                transform: 'translateY(0px) rotate(0deg)',
              },
            },
          }}
        />

        {/* عناصر دکوراتیو برای جلوه بصری بهتر */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
        
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            px: 0,
            minHeight: { xs: 200, md: 320 },
            maxHeight: { xs: 200, md: 320 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            zIndex: 2,
          }}
        >
          <Typography
            ref={el}
            variant='h3'
            sx={{
              zIndex: 2,
              textAlign: 'center',
              color: 'seashell',
              fontFamily: 'Paytone One',
              px: 1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: 25  , md: 40 },
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
}