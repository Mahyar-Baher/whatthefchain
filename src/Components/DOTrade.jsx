/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import useSWR from 'swr';
import { useSwipeable } from 'react-swipeable';
import TokenSelector from './TokenSelector';
import { Icon } from '@iconify/react';
import { getIconifyName } from './iconifyHelpers';
import useWalletStore from '../stores/walletStore';
import Magnet from './Magnet';

// Game-like slot machine animation
const slotSpin = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(10deg) scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) rotate(-5deg) scale(1.15);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
`;

// Preview fade-in animation
const previewFade = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const SuccessBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  background: 'linear-gradient(135deg, #1a1f39 0%, #0d1025 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  color: 'white',
  padding: theme.spacing(4),
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
}));

const LeftBox = styled(Box)(({ theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  borderRadius: '12px',
  minWidth: '100px',
  height: '130px',
}));

const InputBox = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overscrollBehavior: 'contain',
  touchAction: 'none',
}));

// Helper functions
const fetcher = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('CoinGecko API fetch error:', error);
    throw error;
  }
};

// Initial tokens (fallback)
const initialTokens = [
  {
    id: 'usd',
    symbol: 'USD',
    name: 'US Dollar',
    icon: 'mdi:currency-usd',
    priceUSD: 1,
    change24h: 0,
    volume24h: 0,
    category: ['stable'],
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: 'cryptocurrency-color:btc',
    priceUSD: 60000,
    change24h: 2.5,
    volume24h: 28000000000,
    category: ['trending', 'hot'],
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'cryptocurrency-color:eth',
    priceUSD: 3500,
    change24h: 1.8,
    volume24h: 18000000000,
    category: ['trending', 'hot'],
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    icon: 'cryptocurrency-color:usdt',
    priceUSD: 1,
    change24h: 0.1,
    volume24h: 50000000000,
    category: ['stable'],
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'cryptocurrency-color:usdc',
    priceUSD: 1,
    change24h: 0.05,
    volume24h: 3500000000,
    category: ['stable'],
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: 'cryptocurrency-color:sol',
    priceUSD: 150,
    change24h: 5.2,
    volume24h: 2500000000,
    category: ['trending', 'hot'],
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    icon: 'cryptocurrency-color:ada',
    priceUSD: 0.45,
    change24h: -0.8,
    volume24h: 800000000,
    category: ['trending'],
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'Ripple',
    icon: 'cryptocurrency-color:xrp',
    priceUSD: 0.52,
    change24h: 1.2,
    volume24h: 1200000000,
    category: ['trending'],
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: 'cryptocurrency-color:doge',
    priceUSD: 0.12,
    change24h: -2.3,
    volume24h: 900000000,
    category: ['hot'],
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    icon: 'cryptocurrency-color:dot',
    priceUSD: 6.80,
    change24h: 3.1,
    volume24h: 700000000,
    category: ['trending'],
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    icon: 'cryptocurrency-color:avax',
    priceUSD: 35.20,
    change24h: 4.5,
    volume24h: 950000000,
    category: ['hot'],
  },
];

const DOTrade = () => {
  const { isConnected } = useWalletStore();
  const [fromToken, setFromToken] = useState(initialTokens[0]);
  const [toToken, setToToken] = useState(initialTokens[1]);
  const [amountFrom, setAmountFrom] = useState('');
  const [modalOpen, setModalOpen] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const lastScrollTime = useRef(0);
  const [isFromHovered, setIsFromHovered] = useState(false);
  const [isToHovered, setIsToHovered] = useState(false);
  const fromButtonRef = useRef(null);
  const toButtonRef = useRef(null);

  // Fetch live data from CoinGecko
  const { data, error: fetchError, isLoading } = useSWR(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 15000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (err) => {
        setApiError('Failed to fetch live prices. Using fallback data.');
        console.error('SWR error:', err);
      },
    }
  );

  // Update tokens with live data
  const tokens = useMemo(() => {
    if (!data || fetchError) {
      return initialTokens;
    }
    return initialTokens.map((token) => {
      if (token.symbol === 'USD') return token;
      const apiToken = data.find(
        (coin) => (coin.symbol || '').toUpperCase() === token.symbol.toUpperCase()
      );
      if (apiToken) {
        return {
          ...token,
          priceUSD: apiToken.current_price,
          change24h: apiToken.price_change_percentage_24h,
          volume24h: apiToken.total_volume,
        };
      }
      return token;
    });
  }, [data, fetchError]);

  // Update fromToken and toToken if their prices change
  useEffect(() => {
    const updatedFromToken = tokens.find((token) => token.id === fromToken.id);
    const updatedToToken = tokens.find((token) => token.id === toToken.id);
    if (updatedFromToken) setFromToken(updatedFromToken);
    if (updatedToToken) setToToken(updatedToToken);
  }, [tokens]);

  // Calculate target amount
  const amountTo = useMemo(() => {
    if (!amountFrom || fromToken.id === toToken.id) return '';
    const value = parseFloat(amountFrom);
    if (isNaN(value)) return '';
    const valueInUSD = value * fromToken.priceUSD;
    const result = valueInUSD / toToken.priceUSD;
    return result.toFixed(6);
  }, [amountFrom, fromToken, toToken]);

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!amountFrom) return 0;
    const value = parseFloat(amountFrom);
    return isNaN(value) ? 0 : value * fromToken.priceUSD;
  }, [amountFrom, fromToken]);

  // Button text based on USD value
  const getButtonText = () => {
    const v = Number(usdValue) || 0;
    if (v === 0) return 'B🫡y IT';
    if (v < 1) return 'B🫠y IT';
    if (v < 10) return 'B🥲y IT';
    if (v < 100) return 'B😬y IT';
    if (v < 500) return 'B😏y IT';
    if (v < 1000) return 'B😎y IT';
    if (v < 5000) return 'B🤡y IT';
    if (v < 10000) return 'B🤩y IT';
    if (v < 25000) return 'B🤑y IT';
    if (v < 50000) return 'B🤯y IT';
    if (v < 100000) return 'B💰y IT';
    if (v < 300000) return 'B🧨💸 IT';
    if (v < 1000000) {
      const extra = Math.min(6, Math.floor(v / 100000));
      return `D🤣 ${'💰'.repeat(extra)} IT`;
    }
    if (v < 5000000) return 'B🤩y 🚀 IT';
    if (v < 10000000) return 'B🤯y IT';
    return 'B💎y IT';
  };

  // Handle token selection
  const handleSelectToken = (token) => {
    if (modalOpen === 'from') {
      if (token.id === toToken.id) {
        const currentIndex = tokens.findIndex((t) => t.id === toToken.id);
        const nextIndex = (currentIndex + 1) % tokens.length;
        setToToken(tokens[nextIndex]);
      }
      setFromToken(token);
    } else if (modalOpen === 'to') {
      if (token.id === fromToken.id) {
        const currentIndex = tokens.findIndex((t) => t.id === fromToken.id);
        const nextIndex = (currentIndex + 1) % tokens.length;
        setFromToken(tokens[nextIndex]);
      }
      setToToken(token);
    }
    setModalOpen(null);
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmountFrom(value);
    }
  };

  // Handle token switching
  const changeToken = (type, direction) => {
    const now = Date.now();
    const debounceDelay = 150;
    if (now - lastScrollTime.current < debounceDelay) return;
    lastScrollTime.current = now;

    const currentToken = type === 'from' ? fromToken : toToken;
    const currentIndex = tokens.findIndex(token => token.id === currentToken.id);
    let newIndex = (currentIndex + direction + tokens.length) % tokens.length;

    // Skip if the new token is the same as the other field
    while (tokens[newIndex].id === (type === 'from' ? toToken.id : fromToken.id)) {
      newIndex = (newIndex + direction + tokens.length) % tokens.length;
    }

    const newToken = tokens[newIndex];
    if (type === 'from') {
      setFromToken(newToken);
    } else {
      setToToken(newToken);
    }
  };

  // Handle mouse wheel for token switching
  const handleWheel = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    const deltaThreshold = 10;
    let direction = 0;
    
    if (e.deltaY > deltaThreshold) {
      direction = 1;
    } else if (e.deltaY < -deltaThreshold) {
      direction = -1;
    }
    
    if (direction !== 0) {
      changeToken(type, direction);
    }
  };

  // Swipe handlers for mobile
  const fromSwipeHandlers = useSwipeable({
    onSwipedLeft: () => changeToken('from', 1),
    onSwipedRight: () => changeToken('from', -1),
    delta: 15,
    trackTouch: true,
    preventDefaultTouchmoveEvent: true,
  });

  const toSwipeHandlers = useSwipeable({
    onSwipedLeft: () => changeToken('to', 1),
    onSwipedRight: () => changeToken('to', -1),
    delta: 15,
    trackTouch: true,
    preventDefaultTouchmoveEvent: true,
  });

  // Get next and previous tokens for preview
  const getPreviewTokens = (currentToken) => {
    const currentIndex = tokens.findIndex((token) => token.id === currentToken.id);
    let prevIndex = (currentIndex - 1 + tokens.length) % tokens.length;
    let nextIndex = (currentIndex + 1) % tokens.length;

    // Skip if the preview token is the same as the other field
    while (tokens[prevIndex].id === (currentToken.id === fromToken.id ? toToken.id : fromToken.id)) {
      prevIndex = (prevIndex - 1 + tokens.length) % tokens.length;
    }
    while (tokens[nextIndex].id === (currentToken.id === fromToken.id ? toToken.id : fromToken.id)) {
      nextIndex = (nextIndex + 1) % tokens.length;
    }

    return {
      prevToken: tokens[prevIndex],
      nextToken: tokens[nextIndex],
    };
  };

  // Prevent page scroll on wheel and touch events
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.target === fromButtonRef.current || e.target === toButtonRef.current) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // Handle trade
  const handleTrade = () => {
    if (!isConnected) {
      setError('Please connect your wallet to trade.');
      return;
    }
    if (!amountFrom || parseFloat(amountFrom) <= 0) {
      setError('Please enter a valid amount to trade.');
      return;
    }
    if (fromToken.id === toToken.id) {
      setError('Cannot trade the same token.');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAmountFrom('');
    }, 2000);
  };

  // Close error dialog
  const handleCloseError = () => {
    setError(null);
    setApiError(null);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={350}
      gap={0}
      pr={{xs:3, md:5}}
      pl={{xs:3,md:0}}
      borderRadius={2}
      sx={{ overscrollBehavior: 'contain', position: 'relative' }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            zIndex: 10,
          }}
        >
          <CircularProgress sx={{ color: '#8000FF' }} />
        </Box>
      )}
      {showSuccess ? (
        <SuccessBox>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Purchase Completed!
          </Typography>
          <Typography variant="body1">
            {`${amountFrom || 0} ${fromToken.symbol} → ${amountTo || 0} ${toToken.symbol}`}
          </Typography>
        </SuccessBox>
      ) : (
        <>
          <Magnet padding={50} disabled={false} magnetStrength={10}>
            <LeftBox>
              <Button
                variant="text"
                sx={{
                  cursor: 'none',
                  width: '100%',
                  height: '100%',
                  fontSize: { xs: 12, md: 32 },
                  color: '#e0e0ff',
                  p: 1,
                  fontWeight: 800,
                  letterSpacing: 1,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  },
                }}
                onClick={handleTrade}
              >
                {getButtonText()}
              </Button>
            </LeftBox>
          </Magnet>

          <InputBox>
            <TextField
              value={amountFrom}
              onChange={handleAmountChange}
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={() => setIsFromHovered(true)}
                      onMouseLeave={() => setIsFromHovered(false)}
                      {...fromSwipeHandlers}
                    >
                      <Tooltip title="Scroll or swipe to switch tokens or click it!">
                        <IconButton
                          ref={fromButtonRef}
                          onClick={() => setModalOpen('from')}
                          onWheel={(e) => handleWheel(e, 'from')}
                        >
                          {isFromHovered && (
                            <>
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  position: 'absolute',
                                  top: -1.5,
                                  left: -1.5,
                                  background: 'linear-gradient(135deg, rgba(112, 0, 224, 0.3), rgba(48, 0, 96, 0.3))',
                                  animation: `${previewFade} 0.3s ease-in-out`,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Icon
                                  icon={getIconifyName(getPreviewTokens(fromToken).prevToken)}
                                  width="20"
                                  height="20"
                                />
                              </Avatar>
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  position: 'absolute',
                                  top: -1.5,
                                  right: -1.5,
                                  background: 'linear-gradient(135deg, rgba(112, 0, 224, 0.3), rgba(48, 0, 96, 0.3))',
                                  animation: `${previewFade} 0.3s ease-in-out`,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Icon
                                  icon={getIconifyName(getPreviewTokens(fromToken).nextToken)}
                                  width="20"
                                  height="20"
                                />
                              </Avatar>
                            </>
                          )}
                          <Avatar
                            key={`from-${fromToken.id}`}
                            sx={{
                              cursor: 'none',
                              width: 40,
                              height: 40,
                              background: 'transparent',
                              animation: `${slotSpin} 0.4s ease-in-out`,
                              '&:hover': {
                                boxShadow: '0 0 8px rgba(112, 0, 224, 0.5)',
                              },
                            }}
                          >
                            <Icon icon={getIconifyName(fromToken)} width="40" height="40" />
                          </Avatar>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: 2,
                color:'white',
                input: {
                  cursor: 'none',
                  color: 'white',
                  fontSize: 35,
                  textAlign: 'left',
                  padding: '2px 10px',
                  fontWeight: 600,
                },'& input::placeholder': { color: 'white' },
                '& fieldset': { border: 'none' },
              }}
            />

            <Divider
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                height: 2,
                my: -1,
              }}
            />

            <TextField
              value={amountTo}
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={() => setIsToHovered(true)}
                      onMouseLeave={() => setIsToHovered(false)}
                      {...toSwipeHandlers}
                    >
                      <Tooltip title="Scroll or swipe to switch tokens or click it!">
                        <IconButton
                          ref={toButtonRef}
                          onClick={() => setModalOpen('to')}
                          onWheel={(e) => handleWheel(e, 'to')}
                        >
                          {isToHovered && (
                            <>
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  position: 'absolute',
                                  bottom: -1.5,
                                  left: -1.5,
                                  background: 'linear-gradient(135deg, rgba(112, 0, 224, 0.3), rgba(48, 0, 96, 0.3))',
                                  animation: `${previewFade} 0.3s ease-in-out`,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Icon
                                  icon={getIconifyName(getPreviewTokens(toToken).prevToken)}
                                  width="20"
                                  height="20"
                                />
                              </Avatar>
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  position: 'absolute',
                                  bottom: -1.5,
                                  right: -1.5,
                                  background: 'linear-gradient(135deg, rgba(112, 0, 224, 0.3), rgba(48, 0, 96, 0.3))',
                                  animation: `${previewFade} 0.3s ease-in-out`,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Icon
                                  icon={getIconifyName(getPreviewTokens(toToken).nextToken)}
                                  width="20"
                                  height="20"
                                />
                              </Avatar>
                            </>
                          )}
                          <Avatar
                            key={`to-${toToken.id}`}
                            sx={{
                              cursor: 'none',
                              width: 40,
                              height: 40,
                              animation: `${slotSpin} 0.4s ease-in-out`,
                              background: 'transparent',
                              '&:hover': {
                                boxShadow: '0 0 12px rgba(112, 0, 224, 0.5)',
                              },
                            }}
                          >
                            <Icon icon={getIconifyName(toToken)} width="40" height="40" />
                          </Avatar>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                cursor: 'none',
                borderRadius: 2,
                input: {
                  cursor: 'none',
                  color: 'white',
                  fontSize: 35,
                  textAlign: 'left',
                  padding: '2px 10px',
                  fontWeight: 600,
                },
                '& fieldset': { border: 'none' },
              }}
            />
          </InputBox>

          <TokenSelector
            open={!!modalOpen}
            onClose={() => setModalOpen(null)}
            tokens={tokens}
            onSelect={handleSelectToken}
          />

          <Dialog
            open={!!error || !!apiError}
            onClose={handleCloseError}
            sx={{
              '& .MuiDialog-paper': {
                background: 'linear-gradient(135deg, rgba(112, 0, 224, 0.9) 0%, rgba(48, 0, 96, 0.9) 33%, rgba(0, 0, 0, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxWidth: 400,
                width: '90%',
                color: 'seashell',
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 600, fontSize: { xs: 18, md: 20 } }}>
              {error ? 'Trade Error' : 'API Error'}
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: { xs: 14, md: 16 } }}>
                {error || apiError}
              </Typography>
              {error?.includes('connect your wallet') && (
                <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: 12, md: 14 } }}>
                  <a
                    href="/"
                    style={{ color: '#8000FF', textDecoration: 'underline' }}
                  >
                    Connect Wallet
                  </a>{' '}
                  to proceed with the trade.
                </Typography>
              )}
              {apiError && (
                <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: 12, md: 14 } }}>
                  Prices may be outdated. Please try again later.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseError}
                sx={{
                  color: 'seashell',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

// Error boundary wrapper
class DOTradeErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={350}
          sx={{ color: 'white', textAlign: 'center' }}
        >
          <Typography variant="h6">
            Something went wrong. Please refresh the page.
          </Typography>
        </Box>
      );
    }
    return <DOTrade />;
  }
}

export default DOTradeErrorBoundary;