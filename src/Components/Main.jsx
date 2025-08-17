import { Grid, Modal, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import BellAlert from './BellAlert';
import SarcasticText from './SarcasticText';
import DOTrade from './DOTrade';
import BitcoinPriceComparison from './OldPriceNew';
import ScratchGame from './ScratchGame';

const Main = () => {
  const [showScratchGame, setShowScratchGame] = useState(false);

  useEffect(() => {
    const hasSeenScratch = localStorage.getItem('hasSeenScratchGame');
    if (!hasSeenScratch) {
      setShowScratchGame(true);
      localStorage.setItem('hasSeenScratchGame', 'true');
    }
  }, []);

  const handleCloseScratch = () => setShowScratchGame(false);

  return (
    <>
      {/* Main Content */}
        <Grid container spacing={2} justifyContent='space-between' >
            <Grid size={{xs:12}}>
                <BellAlert/>
            </Grid>
            <Grid size={{xs:12,sm:6,md:6,lg:5}} display={{xs:'none',md:'block'}}>
                <SarcasticText/>
            </Grid>
            <Grid size={{xs:12,sm:6,md:6,lg:5}}>
                <DOTrade/>
            </Grid>
            <Grid size={{xs:12,sm:6,md:6,lg:5}} display={{xs:'block',md:'none'}}>
                <SarcasticText/>
            </Grid>
            <Grid size={{xs:12,md: 5}} display={{xs:'flex',md:'none'}}>
                <BitcoinPriceComparison/>
            </Grid>
        </Grid>

      {/* Scratch Game Modal */}
      <Modal
        open={showScratchGame}
        onClose={handleCloseScratch}
        aria-labelledby="scratch-game-modal"
        aria-describedby="scratch-game"
        closeAfterTransition
        disableEscapeKeyDown
        sx={{
          display: {xs: 'nonezz',md:'flex'},
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: { xs: '90%', sm: 900 },
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 2,
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <ScratchGame onComplete={handleCloseScratch} />
        </Box>
      </Modal>
    </>
  );
};

export default Main;
