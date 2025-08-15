import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Button, IconButton, 
  Drawer, List, ListItem, ListItemText, Divider, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled, keyframes } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import liveImg from '../assets/wtfc/pizza.png';
import WalletButton from './WalletButton';

// Animations
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

const pizzaSpin = keyframes`
  0% {
    transform: scale(1) rotate(0);
    filter: drop-shadow(0 0 0 rgba(112, 0, 224, 0.8));
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    filter: drop-shadow(0 0 8px rgba(112, 0, 224, 1));
  }
  100% {
    transform: scale(1) rotate(360deg);
    filter: drop-shadow(0 0 3px rgba(112, 0, 224, 0.6));
  }
`;

const LiveIconContainer = styled('div')(({ theme }) => ({
  display: 'inline-block',
  marginLeft: 0,
  '&:hover img': {
    animation: `${pizzaSpin} 0.6s ease-out both`,
  },
  [theme.breakpoints.down('md')]: {
    '&:active img': {
      animation: `${pizzaSpin} 0.6s ease-out both`,
    }
  }
}));

const LiveIconImg = styled('img')(() => ({
  width: 40,
  height: 40,
  animation: `${float} 2.5s infinite ease-in-out`,
  transition: 'all 0.3s',
  cursor: 'pointer',
  transformOrigin: 'center',
}));

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ 
      width: "100%", 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(112, 0, 224, 1) 0%, rgba(48, 0, 96, 0.9) 45%, rgba(0, 0, 0, 1) 95%)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 25px rgba(112, 0, 224, 0.4) inset'
    }}>
      {/* Header */}
      <Box sx={{ 
        width: "100%",
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Button 
          href='/' 
          sx={{ 
            fontWeight: 800, 
            color: '#FFF', 
            fontSize: 18,
            letterSpacing: '-0.5px',
            textShadow: '0 0 10px rgba(255,255,255,0.3)',
            '&:hover': {
              textShadow: '0 0 15px rgba(255,255,255,0.5)'
            }
          }} 
          variant='text'
        >
          Whatthefchain
        </Button>
        <IconButton 
          onClick={handleDrawerToggle} 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Navigation Items */}
      <List sx={{ 
        flexGrow: 1,
        py: 2,
        '& .MuiListItem-root': {
          transition: 'all 0.3s ease',
          borderRadius: '0 12px 12px 0',
          mx: 1,
          width: 'auto',
          '&:hover': {
            background: 'linear-gradient(90deg, rgba(112,0,224,0.4) 0%, rgba(48,0,96,0.2) 100%)',
            boxShadow: '0 0 10px rgba(112, 0, 224, 0.3)'
          }
        }
      }}>
        {['TRADE', 'EXPLORE', 'POOL'].map((text) => (
          <ListItem 
            key={text} 
            button 
            component="a" 
            href={`/${text.toLowerCase()}`}
            onClick={handleDrawerToggle}
            sx={{
              py: 1.5,
            }}
          >
            <ListItemText 
              primary={text} 
              primaryTypographyProps={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 600,
                fontSize: 18,
                pl: 2,
                letterSpacing: '1px'
              }} 
            />
            <Box sx={{
              width: 8,
              height: 8,
              bgcolor: 'rgba(112,0,224,0.8)',
              borderRadius: '50%',
              ml: 1,
              boxShadow: '0 0 8px rgba(112,0,224,1)'
            }} />
          </ListItem>
        ))}
      </List>
      
      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <WalletButton />
        </Box>
        <Typography 
          variant="body2" 
          mt={2} 
          color="rgba(255,255,255,0.5)"
          sx={{ fontSize: 14 }}
        >
          © {new Date().getFullYear()} Whatthefchain Labs
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)', px: { xs: 1, md: 0 } }}>
        <Toolbar sx={{ 
          width:"100%",
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 2,
          paddingX: isMobile ? 1 : 3 
        }}>
          <Box sx={{ 
            width:"100%",
            display: 'flex', 
            justifyContent: { xs: 'space-between', md: 'flex-start' }, 
            alignItems: 'center',
            gap: 2,
            paddingX: isMobile ? 1 : 3 
          }}>
            {/* Logo and images */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button href='/' sx={{ fontWeight: 900, color: 'seashell', fontSize: isMobile ? 16 : 20 }} variant='text'>
                Whatthefchain
              </Button>
              <LiveIconContainer>
                <LiveIconImg src={liveImg} alt="Live Icon" />
              </LiveIconContainer>
            </Box>

            {/* Desktop buttons */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button href="/trade" variant="text" sx={{ color: 'seashell', fontSize: 15, fontWeight: 600 }}>TRADE</Button>
                <Button href="/explore" variant="text" sx={{ color: 'seashell', fontSize: 15, fontWeight: 600 }}>EXPLORE</Button>
                <Button href="/pool" variant="text" sx={{ color: 'seashell', fontSize: 15, fontWeight: 600 }}>POOL</Button>
              </Box>
            )}

            {/* Mobile hamburger menu */}
            {isMobile && (
              <Box width="100%" display="flex" justifyContent='end' >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ color: 'seashell' }}
              >
                <MenuIcon />
              </IconButton>
              </Box>
            )}
          </Box>
          {!isMobile && (
            <Box>
              <WalletButton />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}