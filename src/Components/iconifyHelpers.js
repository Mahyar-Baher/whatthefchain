// src/utils/iconifyHelpers.js
// هِلپرهای Iconify برای انتخاب آیکن مناسب هر توکن (کریپتو/فیات)

export const CRYPTO_ICON_MAP = {
    BTC: 'cryptocurrency-color:btc',
    ETH: 'cryptocurrency-color:eth',
    SOL: 'cryptocurrency-color:sol',
    USDT: 'cryptocurrency-color:usdt',
    USDC: 'cryptocurrency-color:usdc',
    BNB: 'cryptocurrency-color:bnb',
    XRP: 'cryptocurrency-color:xrp',
    ADA: 'cryptocurrency-color:ada',
    DOGE: 'cryptocurrency-color:doge',
    TRX: 'cryptocurrency-color:trx',
    TON: 'cryptocurrency-color:ton',
    DOT: 'cryptocurrency-color:dot',
    AVAX: 'cryptocurrency-color:avax',
    SHIB: 'cryptocurrency-color:shib',
    MATIC: 'cryptocurrency-color:matic',
    DAI: 'cryptocurrency-color:dai',
    TUSD: 'cryptocurrency-color:tusd',
    BUSD: 'cryptocurrency-color:busd',
  };
  
  export const FIAT_ICON_MAP = {
    USD: 'mdi:currency-usd',
    EUR: 'mdi:currency-eur',
    GBP: 'mdi:currency-gbp',
    JPY: 'mdi:currency-jpy',
    CNY: 'mdi:currency-cny',
    AUD: 'mdi:currency-aud',
    CAD: 'mdi:currency-cad',
    CHF: 'mdi:currency-chf',
    TRY: 'mdi:currency-try',
    IRR: 'mdi:cash',
  };
  export function getIconifyName(token) {
    const sym = (token?.symbol || '').toUpperCase();
    const iconStr = token?.icon;
  
    if (typeof iconStr === 'string' && iconStr.includes(':') && !iconStr.startsWith('http')) {
      return iconStr;
    }
    if (FIAT_ICON_MAP[sym]) return FIAT_ICON_MAP[sym];
    if (CRYPTO_ICON_MAP[sym]) return CRYPTO_ICON_MAP[sym];
    if (sym) return `cryptocurrency-color:${sym.toLowerCase()}`;
    return 'mdi:currency-sign';
  }
  