import React, { useState, useEffect, useRef } from 'react';
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
  Box,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme, keyframes } from '@mui/material/styles';
import WalletIcon from '@mui/icons-material/Wallet';
import useWalletStore from '../stores/walletStore';
import { Icon } from '@iconify/react/dist/iconify.js';

// انیمیشن‌ها
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(112, 0, 224, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(112, 0, 224, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(112, 0, 224, 0); }
`;

// آیکون‌های کیف پول‌ها (موقت - در عمل باید آیکون‌های واقعی استفاده شوند)
const MetaMaskIcon = () => (
  <Box sx={{ 
    width: 24, 
    height: 24, 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }}>
    <Icon icon="logos:metamask-icon" width="256" height="240" />
  </Box>
);

const CoinbaseIcon = () => (
  <Box sx={{ 
    width: 24, 
    height: 24, 
    bgcolor: '#1652F0', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }}>
    <Icon icon="token-branded:coinbase" width="24" height="24" />
  </Box>
);

const BinanceIcon = () => (
  <Box sx={{ 
    width: 24, 
    height: 24, 
    bgcolor: '#000', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }}>
    <Icon icon="token-branded:binance" width="24" height="24" />
  </Box>
);

const WalletButton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { address, isConnected, walletType, connect, disconnect } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [installDialog, setInstallDialog] = useState({ open: false, wallet: null });
  const anchorRef = useRef(null);

  // لیست کیف پول‌های پشتیبانی شده
  const wallets = [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      icon: <MetaMaskIcon />,
      detected: !!window.ethereum?.isMetaMask,
      installUrl: 'https://metamask.io/download/'
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase Wallet', 
      icon: <CoinbaseIcon />,
      detected: !!window.ethereum?.isCoinbaseWallet,
      installUrl: 'https://www.coinbase.com/wallet'
    },
    { 
      id: 'binance', 
      name: 'Binance Wallet', 
      icon: <BinanceIcon />,
      detected: !!window.BinanceChain,
      installUrl: 'https://www.binance.com/en/wallet'
    }
  ];

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
      setPopoverOpen(true);
    }
  };

  const handleWalletSelect = async (wallet) => {
    if (!wallet.detected) {
      setInstallDialog({ open: true, wallet });
      return;
    }
    setLoading(true);
    try {
      await connect(wallet.id);
      setPopoverOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseInstallDialog = () => {
    setInstallDialog({ open: false, wallet: null });
  };

  const shortenedAddress = address ? `${address.slice(0, 4)}...${address.slice(-3)}` : '';
  const walletName = walletType ? wallets.find(w => w.id === walletType)?.name || 'Wallet' : 'Wallet';

  // محاسبه اندازه‌ها بر اساس موبایل بودن
  const buttonSize = isMobile ? 40 : 48;
  const iconSize = isMobile ? 24 : 28;
  const indicatorSize = isMobile ? 8 : 10;
  const indicatorPosition = isMobile ? 3 : 4;

  return (
    <>
      <Box 
        ref={anchorRef}
        sx={{ display: 'inline-block' }}
      >
        <Tooltip 
          title={isConnected ? `Connected: ${shortenedAddress} (${walletName})` : 'Connect Wallet'} 
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
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${pulseAnimation ? pulse : 'none'} 1.5s ease-in-out`,
              '&:hover': {
                transform: 'scale(1.08)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                background: isConnected 
                  ? 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)' 
                  : 'linear-gradient(135deg, #8E24AA 0%, #5E35B1 100%)',
              },
              '&:disabled': {
                background: 'rgba(112, 0, 224, 0.5)',
                transform: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
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
      </Box>

      {/* Popover for wallet selection */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorRef.current}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          mt: 1.5,
          '& .MuiPopover-paper': {
            background: 'linear-gradient(135deg, rgba(25, 30, 50, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            width: 280,
            overflow: 'hidden',
            transition: 'opacity 0.2s ease-in-out',
          },
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              mb: 1
            }}
          >
            Connect a wallet
          </Typography>
          
          <List dense sx={{ py: 0 }}>
            {wallets.map((wallet) => (
              <ListItem
                button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {wallet.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)' }}>
                      {wallet.name}
                    </Typography>
                  }
                />
                {wallet.detected && (
                  <Typography 
                    variant="caption" 
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.15)',
                      color: '#4CAF50',
                      px: 1,
                      py: 0.3,
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                    }}
                  >
                    Detected
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
        
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '0.7rem',
              lineHeight: 1.4
            }}
          >
            By connecting a wallet, you agree to wtfc Labs’ 
            <a 
              href="#" 
              style={{ 
                color: 'rgba(128, 0, 255, 0.8)', 
                textDecoration: 'none',
                marginLeft: 4,
                fontWeight: 500 
              }}
            >
              Terms of Service
            </a> 
            {' '}and consent to its{' '}
            <a 
              href="#" 
              style={{ 
                color: 'rgba(128, 0, 255, 0.8)', 
                textDecoration: 'none',
                marginLeft: 4,
                fontWeight: 500 
              }}
            >
              Privacy Policy
            </a>.
          </Typography>
        </Box>
      </Popover>

      {/* Error Dialog */}
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
          {error?.includes('is not installed') && (
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: isMobile ? 12 : 14,
              mt: 2
            }}>
              <a
                href={wallets.find(w => error.includes(w.name))?.installUrl}
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
                Install {wallets.find(w => error.includes(w.name))?.name}
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

      {/* Install Dialog */}
      <Dialog
        open={installDialog.open}
        onClose={handleCloseInstallDialog}
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
          Install {installDialog.wallet?.name}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: isMobile ? 14 : 16,
            mb: 2
          }}>
            {installDialog.wallet?.name} is not installed. Please install it to connect.
          </Typography>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: isMobile ? 12 : 14,
            mt: 2
          }}>
            <a
              href={installDialog.wallet?.installUrl}
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
              Install {installDialog.wallet?.name}
            </a>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseInstallDialog}
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