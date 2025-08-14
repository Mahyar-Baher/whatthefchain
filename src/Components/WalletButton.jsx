import React, { useState, useEffect } from 'react';
import { 
  Button, 
  CircularProgress, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography,
  useMediaQuery,
  Box
} from '@mui/material';
import {useTheme, keyframes,} from '@mui/material/styles';
import WalletIcon from '@mui/icons-material/Wallet';
import useWalletStore from '../stores/walletStore';

// انیمیشن‌ها
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(112, 0, 224, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(112, 0, 224, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(112, 0, 224, 0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
  60% { transform: translateY(-3px); }
`;

const WalletButton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // تشخیص دستگاه موبایل
  const { address, isConnected, connect, disconnect } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      setLoading(true);
      try {
        await connect();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const shortenedAddress = address ? `${address.slice(0, 4)}...${address.slice(-3)}` : '';

  // محاسبه اندازه‌ها بر اساس موبایل بودن
  const buttonSize = isMobile ? 40 : 48;
  const iconSize = isMobile ? 24 : 28;
  const indicatorSize = isMobile ? 8 : 10;
  const indicatorPosition = isMobile ? 3 : 4;

  return (
    <>
      <Tooltip 
        title={isConnected ? `Connected: ${shortenedAddress}` : 'Connect Wallet'} 
        placement="bottom"
        arrow
      >
        <Button
          variant="contained"
          onClick={handleClick}
          disabled={loading}
          sx={{
            minWidth: 0,
            width: buttonSize,
            height: buttonSize,
            background: isConnected 
              ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
              : 'linear-gradient(135deg, #7000E0 0%, #300060 100%)',
            color: 'white',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease',
            animation: `${pulseAnimation ? pulse : 'none'} 1.5s ease-in-out, ${bounce} 1s ease`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(112, 0, 224, 0.5)',
            },
            position: 'relative',
            overflow: 'visible',
            p: 0,
          }}
        >
          {loading ? (
            <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
          ) : (
            <WalletIcon sx={{ fontSize: iconSize }} />
          )}
          
          {/* Indicator for connected state */}
          {isConnected && !loading && (
            <Box sx={{
              position: 'absolute',
              top: indicatorPosition,
              right: indicatorPosition,
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              boxShadow: '0 0 8px #4CAF50',
            }} />
          )}
        </Button>
      </Tooltip>

      <Dialog
        open={!!error}
        onClose={handleCloseError}
        sx={{
          '& .MuiDialog-paper': {
            background: 'linear-gradient(135deg, rgba(25, 30, 50, 0.95) 0%, rgba(10, 15, 30, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: isMobile ? '90%' : 350,
            width: '100%',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            mx: isMobile ? 2 : 0,
          },
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: isMobile ? 18 : 20,
          textAlign: 'center',
          pt: 3,
          pb: 1,
        }}>
          Wallet Connection Error
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: isMobile ? 14 : 16,
            mb: 2
          }}>
            {error}
          </Typography>
          {error?.includes('MetaMask is not installed') && (
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: isMobile ? 12 : 14,
              mt: 2
            }}>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#8000FF', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <WalletIcon fontSize={isMobile ? "small" : "medium"} /> 
                Install MetaMask
              </a>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseError}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
              px: isMobile ? 2 : 3,
              py: isMobile ? 0.5 : 1,
              fontWeight: 500,
              fontSize: isMobile ? 14 : 16,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletButton;