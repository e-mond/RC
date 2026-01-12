# Mock Mode Guide

**Date:** 2026-01-11  
**Purpose:** Guide for using mock mode in RentalConnects frontend

---

## Overview

RentalConnects frontend supports a hybrid mock/real API system that allows the application to work in both development/demo mode (with mock data) and production mode (with real API calls).

## Enabling Mock Mode

Set the environment variable `VITE_USE_MOCK=true` in your `.env` file:

```env
VITE_USE_MOCK=true
```

Or when running the dev server:

```bash
VITE_USE_MOCK=true npm run dev
```

## Services with Mock Support

### 1. Wallet Service (`walletService.js`)

**Mock Features:**
- Wallet setup (bank account or mobile money)
- Wallet balance retrieval
- Wallet top-up (simulated)
- Transaction history
- In-memory data store (persists during session)

**Mock Data:**
- Initial wallet balance: 0 GHS
- Wallet not set up by default
- Transactions stored in memory

**Usage:**
```javascript
import { getWallet, setupWallet, topUpWallet } from '@/services/walletService';

// Get wallet (works in mock mode)
const wallet = await getWallet();

// Setup wallet (works in mock mode)
await setupWallet({
  bank_account: {
    account_number: "1234567890",
    bank_name: "GCB Bank",
    account_name: "John Doe"
  }
});

// Top up wallet (works in mock mode)
await topUpWallet({
  amount: 100,
  payment_method: "paystack",
  reference: "ref_123"
});
```

---

### 2. Ads Service (`adsService.js`)

**Mock Features:**
- Fetch ads with role-based filtering
- Filter by placement (banner, card, inline)
- Filter by ad type
- Track ad views and clicks (in-memory)
- 3 sample ads included

**Mock Ads:**
1. **Premium Property Listing** (banner, landlord)
2. **Upgrade to Premium** (card, tenant)
3. **Artisan Services Promotion** (inline, artisan)

**Usage:**
```javascript
import { getAds, trackAdView, trackAdClick } from '@/services/adsService';

// Get ads (works in mock mode)
const ads = await getAds({
  is_active: true,
  placement: 'banner',
  target_roles: 'landlord'
});

// Track ad view (works in mock mode)
await trackAdView('ad_001');

// Track ad click (works in mock mode)
await trackAdClick('ad_001');
```

---

### 3. Paystack Service (`paystackService.js`)

**Mock Features:**
- Payment initialization (simulated)
- Payment verification (always succeeds in mock mode)
- Premium upgrade payments
- Wallet top-up payments
- No Paystack script loading required

**Mock Behavior:**
- Payments always succeed
- 1-2 second simulated delay
- Returns mock payment reference
- Verification always returns success

**Usage:**
```javascript
import { 
  initiatePayment, 
  verifyPaystackPayment,
  initiatePremiumUpgrade,
  initiateWalletTopUp 
} from '@/services/paystackService';

// Initiate payment (works in mock mode)
await initiatePayment({
  email: 'user@example.com',
  amount: 4900, // GHS 49.00 in kobo
  currency: 'GHS',
  type: 'premium_upgrade',
  onSuccess: async (reference) => {
    // Verify payment (works in mock mode)
    const verification = await verifyPaystackPayment(reference);
    console.log('Payment verified:', verification);
  },
  onCancel: () => {
    console.log('Payment cancelled');
  },
  onError: (error) => {
    console.error('Payment error:', error);
  }
});

// Premium upgrade (works in mock mode)
await initiatePremiumUpgrade({
  email: 'user@example.com',
  plan: 'monthly',
  user: { id: 'user_123', full_name: 'John Doe' },
  onSuccess: (reference) => {
    console.log('Upgrade successful:', reference);
  }
});

// Wallet top-up (works in mock mode)
await initiateWalletTopUp({
  email: 'user@example.com',
  amount: 100, // GHS 100.00
  user: { id: 'user_123' },
  onSuccess: (reference) => {
    console.log('Top-up successful:', reference);
  }
});
```

---

## Testing in Mock Mode

### Wallet Setup Flow

1. **Check if wallet is set up:**
   ```javascript
   const wallet = await getWallet();
   if (!wallet.is_setup) {
     // Show wallet setup modal
   }
   ```

2. **Setup wallet:**
   ```javascript
   await setupWallet({
     bank_account: {
       account_number: "1234567890",
       bank_name: "GCB Bank",
       account_name: "John Doe"
     }
   });
   ```

3. **Top up wallet:**
   ```javascript
   await topUpWallet({
     amount: 100,
     payment_method: "paystack",
     reference: "ref_123"
   });
   ```

### Ads Display Flow

1. **Fetch ads:**
   ```javascript
   const { ads } = useAds({
     placement: 'banner',
     limit: 1
   });
   ```

2. **Track ad view:**
   ```javascript
   useEffect(() => {
     if (ads.length > 0) {
       trackAdView(ads[0].id);
     }
   }, [ads]);
   ```

3. **Track ad click:**
   ```javascript
   const handleAdClick = () => {
     trackAdClick(ad.id);
     window.open(ad.click_url, '_blank');
   };
   ```

### Payment Flow

1. **Initiate payment:**
   ```javascript
   await initiatePayment({
     email: user.email,
     amount: 4900,
     currency: 'GHS',
     type: 'premium_upgrade',
     onSuccess: async (reference) => {
       const verification = await verifyPaystackPayment(reference);
       if (verification.success) {
         // Update user subscription
       }
     }
   });
   ```

---

## Switching Between Mock and Real Mode

### Development (Mock Mode)
```env
VITE_USE_MOCK=true
```

### Production (Real API)
```env
VITE_USE_MOCK=false
# or simply don't set it
```

---

## Mock Data Persistence

- **Wallet data:** Persists in memory during the session (resets on page refresh)
- **Ads data:** Static mock data (always available)
- **Transactions:** Stored in memory (resets on page refresh)

---

## Notes

- Mock mode is intended for development and demos
- All mock operations simulate realistic delays (300-600ms)
- Mock payments always succeed (no error simulation)
- Mock data is not persisted across page refreshes
- Real API mode takes precedence when `VITE_USE_MOCK` is not set or false

---

## Troubleshooting

### Wallet not working in mock mode
- Ensure `VITE_USE_MOCK=true` is set
- Check browser console for errors
- Verify wallet service is imported correctly

### Ads not showing in mock mode
- Check that ads are filtered by role correctly
- Verify placement type matches mock ad placement
- Check browser console for errors

### Payments not working in mock mode
- Ensure `VITE_USE_MOCK=true` is set
- Check that email is provided
- Verify amount is valid (> 0)
- Check browser console for errors

---

## Future Enhancements

- [ ] Persist mock wallet data in localStorage
- [ ] Add more mock ads
- [ ] Add payment error simulation
- [ ] Add mock transaction history with more data
- [ ] Add mock wallet withdrawal functionality

