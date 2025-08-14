// src/components/TokenSelector.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Modal,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Backdrop,
  Fade,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  IconButton,
  Badge,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Icon } from '@iconify/react';
import { getIconifyName } from './iconifyHelpers';

// استایل‌ها
const GlassPaper = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  maxHeight: '90vh',
  overflow: 'hidden',
  borderRadius: 24,
  padding: theme.spacing(3),
  background: 'rgba(0, 0, 10, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 12px 32px 0 rgba(0, 0, 40, 0.3)',
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translate(-50%, -45%)' },
    to: { opacity: 1, transform: 'translate(-50%, -50%)' },
  },
  '&:focus': {
    outline: 'none',
  },
}));

// دسته‌بندی‌ها
const CATEGORIES = [
  { id: 'all', label: 'All Tokens', icon: <CurrencyExchangeIcon /> },
  { id: 'favorites', label: 'Favorites', icon: <FavoriteBorderIcon /> },
  { id: 'trending', label: 'Trending', icon: <TrendingUpIcon /> },
  { id: 'hot', label: 'Hot Pairs', icon: <LocalFireDepartmentIcon /> },
  { id: 'stable', label: 'Stablecoins', icon: <CurrencyExchangeIcon /> },
];

const TokenSelector = ({ open, onClose, tokens, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFavorite = (tokenId) => {
    if (favorites.includes(tokenId)) {
      setFavorites(favorites.filter(id => id !== tokenId));
    } else {
      setFavorites([...favorites, tokenId]);
    }
  };

  const filteredTokens = tokens.filter(token => {
    const categoryMatch =
      selectedCategory === 'all' ||
      (selectedCategory === 'favorites' && favorites.includes(token.id)) ||
      (Array.isArray(token.category) && token.category.includes(selectedCategory));

    const searchMatch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          background: 'rgba(0, 0, 10, 0.6)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <Fade in={open}>
        <GlassPaper elevation={24}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" color="white" fontWeight={700}>
              Select Token
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* نوار جستجو */}
          <TextField
            fullWidth
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} size="small">
                    <CloseIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                '& input': {
                  padding: '12px 16px',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
            sx={{ mb: 3 }}
          />

          {/* دسته‌بندی‌ها */}
          <Box sx={{ mb: 3, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            <ButtonGroup variant="outlined" sx={{ flexWrap: 'nowrap' }}>
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  startIcon={category.icon}
                  sx={{
                    textTransform: 'none',
                    color: selectedCategory === category.id ? '#fff' : 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    background: selectedCategory === category.id ? 'rgba(93, 80, 195, 0.4)' : 'transparent',
                    borderRadius: '12px !important',
                    marginRight: 1,
                    minWidth: 120,
                    '&:hover': {
                      background: 'rgba(93, 80, 195, 0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* لیست توکن‌ها */}
          <Box sx={{ height: '50vh', overflowY: 'auto', pr: 1 }}>
            {filteredTokens.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="rgba(255,255,255,0.5)" variant="body1">
                  No tokens found
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredTokens.map((token) => (
                  <ListItem
                    key={token.id}
                    button
                    onClick={() => onSelect(token)}
                    sx={{
                      borderRadius: 3,
                      mb: 1,
                      transition: 'all 0.2s',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        background: 'rgba(93, 80, 195, 0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(93, 80, 195, 0.2)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(token.id);
                            }}
                            sx={{
                              background: 'rgba(93, 80, 195, 0.3)',
                              '&:hover': { background: 'rgba(93, 80, 195, 0.5)' }
                            }}
                          >
                            {favorites.includes(token.id) ? (
                              <FavoriteIcon fontSize="small" sx={{ color: '#ff4081' }} />
                            ) : (
                              <FavoriteBorderIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                            )}
                          </IconButton>
                        }
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: 'rgba(93, 80, 195, 0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <Icon icon={getIconifyName(token)} width="28" height="28" />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600} color="white">
                            {token.name}
                          </Typography>
                          <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ ml: 1 }}>
                            {token.symbol}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          ${token.priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />

                    <Box textAlign="right">
                      <Typography
                        variant="body1"
                        color={token.change24h >= 0 ? '#4caf50' : '#f44336'}
                        fontWeight={500}
                      >
                        {token.change24h >= 0 ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.5)">
                        ${(token.priceUSD * 1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* تراکنش‌های اخیر */}
          <Box mt={2} p={2} sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3 }}>
            <Typography variant="subtitle1" color="white" fontWeight={600} mb={1}>
              Recent Transactions
            </Typography>
            <Box display="flex" justifyContent="space-between" color="rgba(255,255,255,0.7)" fontSize="0.9rem">
              <div>BTC → USDT</div>
              <div>0.5 BTC</div>
              <div>Completed</div>
            </Box>
            <Box display="flex" justifyContent="space-between" color="rgba(255,255,255,0.7)" fontSize="0.9rem" mt={1}>
              <div>ETH → BTC</div>
              <div>2.5 ETH</div>
              <div>Completed</div>
            </Box>
          </Box>
        </GlassPaper>
      </Fade>
    </Modal>
  );
};

export default TokenSelector;
