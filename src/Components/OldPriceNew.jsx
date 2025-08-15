import React, { useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import useSWR from 'swr';

// Fetcher function for CoinLore API
const fetcher = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const BitcoinPriceComparison = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [animation, setAnimation] = useState(false);

  // Use SWR to fetch Bitcoin price from CoinLore
  const { data, error, isLoading } = useSWR(
    'https://api.coinlore.net/api/tickers/?start=0&limit=100',
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 1800000, // Dedupe requests within 30 minutes
      onSuccess: () => {
        setAnimation(true);
        setTimeout(() => setAnimation(false), 1000);
      },
    }
  );

  // Extract Bitcoin price (USD) from CoinLore data
  const currentPrice = data?.data?.find((coin) => coin.symbol.toLowerCase() === 'btc')?.price_usd;

  const formatPrice = (price) => {
    if (!price) return '';
    return parseFloat(price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const priceChange = () => {
    if (!currentPrice) return 0;
    return ((currentPrice - 1) / 1) * 100;
  };

  const lineAnimation = keyframes`
    0% { 
      ${isMobile ? 'height: 0' : 'width: 0'};
      opacity: 0; 
    }
    100% { 
      ${isMobile ? 'height: 100%' : 'width: 100%'};
      opacity: 1; 
    }
  `;

  const fadeIn = keyframes`
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  `;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: isMobile ? 2 : 0,
        borderRadius: 2,
        background: 'transparent',
        width: '100%',
        maxWidth: isMobile ? '100%' : 700,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        animation: `${fadeIn} 0.8s ease-out`,
      }}
    >
      {isMobile ? (
        // Mobile layout - vertical
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            mt: 0.5,
          }}
        >
          {/* Historical Price - 2010 */}
          <PriceBox year="2010" price="$1" subtitle="Starting Price" isMobile={isMobile} />

          {/* Connecting Line with Bitcoin Icon - vertical */}
          <Box
            sx={{
              position: 'relative',
              width: 1,
              height: 90,
              my: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 2,
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.5))',
                animation: `${lineAnimation} 1.5s ease-in-out`,
              }}
            />
            <Box
              sx={{
                width: isMobile ? 36 : 42,
                height: isMobile ? 36 : 42,
                borderRadius: '50%',
                bgcolor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 2,
              }}
            >
              <svg
                width={isMobile ? 18 : 22}
                height={isMobile ? 18 : 22}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.5 16.5H9V14H13.5V16.5ZM13.5 13H9V10.5H13.5V13ZM15 7H8C7.17 7 6.5 7.67 6.5 8.5V15.5C6.5 16.33 7.17 17 8 17H16C16.83 17 17.5 16.33 17.5 15.5V10L15 7Z"
                  fill="rgba(255,255,255,0.8)"
                />
              </svg>
            </Box>
          </Box>

          {/* Current Price */}
          <PriceBox
            year="2025"
            price={isLoading ? 'Loading...' : error ? 'Error' : formatPrice(currentPrice)}
            current
            subtitle="Today's Price"
            change={priceChange()}
            animation={animation}
            isMobile={isMobile}
          />
        </Box>
      ) : (
        // Desktop layout - horizontal
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            mt: 0,
          }}
        >
          {/* Historical Price - 2010 */}
          <PriceBox
            year="2010"
            price="$1"
            position="left"
            subtitle="Starting Price"
            isMobile={isMobile}
          />

          {/* Connecting Line with Bitcoin Icon */}
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              height: 1,
              mx: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.5))',
                animation: `${lineAnimation} 1.5s ease-in-out`,
              }}
            />
          </Box>

          {/* Current Price */}
          <PriceBox
            year="2025"
            price={isLoading ? 'Loading...' : error ? 'Error' : formatPrice(currentPrice)}
            position="right"
            current
            subtitle="Today's Price"
            change={priceChange()}
            animation={animation}
            isMobile={isMobile}
          />
        </Box>
      )}
    </Box>
  );
};

// PriceBox Component
const PriceBox = ({ year, price, position, current = false, subtitle, animation, isMobile }) => {
  const fadeIn = keyframes`
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  `;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: isMobile ? 1 : 1.5,
        minWidth: isMobile ? '100%' : 140,
        justifyContent: isMobile ? 'center' : position === 'left' ? 'flex-start' : 'flex-end',
        position: 'relative',
        zIndex: 1,
        animation: animation ? `${fadeIn} 0.5s ease` : 'none',
        textAlign: isMobile ? 'center' : position === 'left' ? 'left' : 'right',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            mb: 0.5,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 800,
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            letterSpacing: '0.5px',
          }}
        >
          {subtitle}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: current ? 500 : 700,
            fontSize: current ? (isMobile ? '1.8rem' : '2.2rem') : isMobile ? '1.5rem' : '1.8rem',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1,
            mb: 0.5,
            letterSpacing: current ? '0.5px' : '0px',
          }}
        >
          {price}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 600,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            letterSpacing: '0.5px',
          }}
        >
          {year}
        </Typography>
      </Box>
      {current && (
        <Icon
          icon="formkit:bitcoin"
          width={isMobile ? 32 : 40}
          height={isMobile ? 32 : 40}
          style={{ color: 'rgba(255,255,255,0.8)' }}
        />
      )}
    </Box>
  );
};

export default BitcoinPriceComparison;