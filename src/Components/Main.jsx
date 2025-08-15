import { Grid } from '@mui/material'
import React from 'react'
import BellAlert from './BellAlert'
import SarcasticText from './SarcasticText'
import DOTrade from './DOTrade'
import BitcoinPriceComparison from './OldPriceNew'

const Main = () => {
  return (
    <Grid container spacing={2} justifyContent='space-between'>
        <Grid size={{xs:12}}>
            <BellAlert/>
        </Grid>
        <Grid size={{xs:12,sm:6,md:6,lg:5}}>
            <SarcasticText/>
        </Grid>
        <Grid size={{xs:12,sm:6,md:6,lg:5}}>
            <DOTrade/>
        </Grid>
        <Grid size={{xs:12,md: 6}}>
            <BitcoinPriceComparison/>
        </Grid>
    </Grid>
  )
}

export default Main