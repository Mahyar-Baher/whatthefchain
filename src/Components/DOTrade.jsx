// src/components/DOTrade.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useSWR from 'swr';
import TokenSelector from './TokenSelector';
import { Icon } from '@iconify/react';
import { getIconifyName } from './iconifyHelpers';

// استایل‌ها
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
  fontSize: '1.2rem',
  borderRadius: '12px',
  minWidth: '100px',
  height: '200px',
}));

const InputBox = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

// توابع کمکی
const fetcher = (url) => fetch(url).then((res) => res.json());

// توکن‌های اولیه با اطلاعات کامل
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
  const [fromToken, setFromToken] = useState(initialTokens[0]);
  const [toToken, setToToken] = useState(initialTokens[1]);
  const [amountFrom, setAmountFrom] = useState('');
  const [modalOpen, setModalOpen] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // دریافت داده‌های زنده از CoinGecko API
  const { data, error } = useSWR(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
    fetcher,
    {
      refreshInterval: 60000,
      dedupingInterval: 30000,
    }
  );

  // به‌روزرسانی توکن‌ها با داده‌های زنده
  const tokens = useMemo(() => {
    if (!data || error) return initialTokens;

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
  }, [data, error]);

  // محاسبه مقدار هدف
  const amountTo = useMemo(() => {
    if (!amountFrom) return '';
    const value = parseFloat(amountFrom);
    if (isNaN(value)) return '';
    const valueInUSD = value * fromToken.priceUSD;
    const result = valueInUSD / toToken.priceUSD;
    return result.toFixed(6);
  }, [amountFrom, fromToken, toToken]);

  // محاسبه مقدار دلاری
  const usdValue = useMemo(() => {
    if (!amountFrom) return 0;
    const value = parseFloat(amountFrom);
    return isNaN(value) ? 0 : value * fromToken.priceUSD;
  }, [amountFrom, fromToken]);

  // متن دکمه بر اساس مقدار
  const getButtonText = () => {
  const v = Number(usdValue) || 0;
  if (v === 0) return 'DO 🚀 IT';
  if (v < 1) return 'DO 🫠 IT';
  if (v < 10) return 'DO 🥲 IT';
  if (v < 100) return 'DO 😬 IT';
  if (v < 500) return 'DO 😏 IT';
  if (v < 1000) return 'DO 😎 IT';
  if (v < 5000) return 'DO 🤡 IT';
  if (v < 10000) return 'DO 🤩 IT';
  if (v < 25000) return 'DO 🤑 IT';
  if (v < 50000) return 'DO 🤯 IT';
  if (v < 100000) return 'DO 💰 IT';
  if (v < 300000) return 'DO 🧨💸 IT';
  if (v < 1000000) {
    const extra = Math.min(6, Math.floor(v / 100000)); // cap repeat
    return `DO 🤣${'💰'.repeat(extra)} IT`;
  }
  if (v < 5000000) return 'DO 🚀🤩 IT';
  if (v < 10000000) return 'DO 🤯 IT';
  return 'DO 💎 IT';
};


  // انتخاب توکن
  const handleSelectToken = (token) => {
    if (modalOpen === 'from') {
      setFromToken(token);
    } else if (modalOpen === 'to') {
      setToToken(token);
    }
    setModalOpen(null);
  };

  // تغییر مقدار ورودی
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmountFrom(value);
    }
  };

  // انجام معامله
  const handleTrade = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAmountFrom('');
    }, 2000);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={350}
      gap={0}
      p={0}
      borderRadius={2}
    >
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
          <LeftBox>
            <Button
              variant="text"
              sx={{
                width: '100%',
                height: '100%',
                fontSize: {xs:12,md:32},
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
                    <IconButton
                      onClick={() => setModalOpen('from')}
                      sx={{
                        '&:hover': {
                          background: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'transparent',
                        }}
                      >
                        <Icon icon={getIconifyName(fromToken)} width="40" height="40" />
                      </Avatar>
                      {/* <Typography
                        color="white"
                        ml={1}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {fromToken.symbol}
                      </Typography> */}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: 2,
                input: {
                  color: 'white',
                  fontSize: 35,
                  textAlign: 'right',
                  padding: '12px 16px',
                  fontWeight: 600,
                },
                '& fieldset': { border: 'none' },
              }}
            />

            <Divider
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                height: 2,
                my: 1,
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
                    <IconButton
                      onClick={() => setModalOpen('to')}
                      sx={{
                        '&:hover': {
                          background: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'transparent',
                        }}
                      >
                        <Icon icon={getIconifyName(toToken)} width="40" height="40" />
                      </Avatar>
                      {/* <Typography
                        color="white"
                        ml={1}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {toToken.symbol}
                      </Typography> */}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: 2,
                input: {
                  color: 'white',
                  fontSize: 30,
                  textAlign: 'right',
                  padding: '12px 16px',
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
        </>
      )}
    </Box>
  );
};

export default DOTrade;