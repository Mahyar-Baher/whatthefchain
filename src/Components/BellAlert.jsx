import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import bellIcon from '@iconify/icons-mdi/bell';

export default function BellAlert() {
  const fullText =
    "🚀 A rocket just passed by! If you can hit it receive 0.0000001 BTC, Hurry up!";
  const [displayedText, setDisplayedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const intervalRef = useRef(null);

  // تایپینگ حرف به حرف
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDisplayedText(fullText.slice(0, typingIndex + 1));
      setTypingIndex((prev) => prev + 1);
      if (typingIndex >= fullText.length) clearInterval(intervalRef.current);
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [typingIndex, fullText]);

  return (
    <Box sx={{width:"100%", display: 'flex', justifyContent: 'center',pt:3, px:{xs:3,sm:0}}}>
      <Box
        sx={{
          position: 'relative',
          width: {xs:290, sm: 400,md: 600},
          p: 1.5,
          borderRadius: 3,
          boxShadow: 4,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          fontFamily: "'Paytone One', sans-serif",
        }}
      >
        {/* Bell Icon بالا سمت چپ */}
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: -12,
            background: '#fff',
            borderRadius: '50%',
            p: 0.5,
            boxShadow: 2,
          }}
        >
          <Icon
            icon={bellIcon}
            width={30}
            height={25}
            style={{
              animation: 'bellShake 1.6s infinite alternate',
              color: '#300060',
            }}
          />
        </Box>

        {/* متن تایپینگ با cursor چشمک‌زن */}
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.6 }}>
          {displayedText}
          <span
            style={{
              display: 'inline-block',
              width: 10,
              marginLeft: 2,
              animation: 'blink 1s infinite',
            }}
          >
            |
          </span>
        </Typography>
      </Box>
    </Box>
  );
}
