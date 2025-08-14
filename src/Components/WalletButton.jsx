import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import WalletIcon from '@mui/icons-material/Wallet';
import useWalletStore from '../stores/walletStore';

const WalletButton = () => {
  const { address, isConnected, connect, disconnect } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <>
      <Tooltip title={isConnected ? 'Disconnect Wallet' : 'Connect to MetaMask'}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WalletIcon />}
          onClick={handleClick}
          sx={{
            background: 'linear-gradient(135deg, #7000E0 0%, #300060 100%)',
            color: 'seashell',
            fontWeight: 600,
            fontSize: { xs: 14, md: 16 },
            px: { xs: 2, md: 3 },
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(112, 0, 224, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(112, 0, 224, 0.4)',
              background: 'linear-gradient(135deg, #8000FF 0%, #400080 100%)',
            },
            '&:disabled': {
              background: 'rgba(112, 0, 224, 0.5)',
            },
          }}
          disabled={loading}
        >
          {loading ? 'Connecting...' : isConnected ? shortenedAddress : 'Connect Wallet'}
        </Button>
      </Tooltip>

      <Dialog
        open={!!error}
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
          Wallet Connection Error
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: { xs: 14, md: 16 } }}>
            {error}
          </Typography>
          {error?.includes('MetaMask is not installed') && (
            <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: 12, md: 14 } }}>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#8000FF', textDecoration: 'underline' }}
              >
                Install MetaMask
              </a>{' '}
              to connect your wallet.
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
  );
};

export default WalletButton;