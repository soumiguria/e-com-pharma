# Razorpay Payment Gateway Integration

## Setup Instructions

### 1. Get Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to **Settings** → **API Keys**
4. Generate **Test Keys** for development
5. Copy your **Key ID** and **Key Secret**

### 2. Update Configuration

Open `services/api/razorpayConfig.ts` and update:

```typescript
export const RAZORPAY_CONFIG = {
  // Replace with your actual test keys
  TEST_KEY_ID: 'rzp_test_your_actual_key_id',
  TEST_KEY_SECRET: 'your_actual_test_secret',
  
  // Update app details
  APP_NAME: 'Your App Name',
  APP_LOGO: 'https://your-app-logo-url.com/logo.png',
  
  // Keep as 'test' for development
  ENVIRONMENT: 'test' as 'test' | 'live',
};
```

### 3. Test Payment Flow

1. **Login Required**: User must be logged in to proceed with payment
2. **Cart Items**: Add items to cart (grocery or pharmacy)
3. **Payment Methods**: Go to PaymentMethodsScreen
4. **Place Order**: Click "Place Order" button
5. **Razorpay Gateway**: Payment gateway will open with:
   - Order details
   - User pre-filled information
   - Multiple payment options (UPI, Cards, Net Banking, etc.)

### 4. Payment Flow

```
Cart → PaymentMethods → Razorpay Gateway → OrderConfirmation
```

- **If not logged in**: Cart → PaymentMethods → PhoneAuth → OTP → PaymentMethods → Razorpay Gateway
- **If logged in**: Cart → PaymentMethods → Razorpay Gateway

### 5. Features Implemented

 **Dynamic Bill Calculation**
- Subtotal from cart items
- 10% product discount
- Express delivery fee (₹49)
- Fixed coupon discount (₹20)
- Final total calculation

 **User Pre-fill**
- Email from user profile
- Mobile number from user profile
- Name from user profile

 **Order Details**
- Order ID generation
- Cart type (grocery/pharmacy)
- Delivery method
- Time slot
- Theme color matching app

 **Error Handling**
- Payment cancellation
- Payment failure
- Network errors
- User feedback with alerts

### 6. Test Mode

Currently configured for **Test Mode**:
- Use test cards for testing
- No real money transactions
- Test UPI IDs work
- All test scenarios supported

### 7. Production Setup

For production:
1. Get **Live Keys** from Razorpay Dashboard
2. Update `ENVIRONMENT: 'live'` in config
3. Replace test keys with live keys
4. Test thoroughly before going live

### 8. Supported Payment Methods

- UPI (All UPI apps)
- Credit/Debit Cards
- Net Banking
- Wallets
- EMI Options

### 9. Console Logs

The integration includes detailed console logs for debugging:
- Payment gateway opening
- Amount calculations
- Order ID generation
- Payment success/failure
- Error details

### 10. Security Notes

- Never commit real keys to version control
- Use environment variables for production
- Validate payments on your backend
- Implement webhook handling for payment verification

## Testing

Use these test cards for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## Support

For Razorpay integration issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Integration](https://razorpay.com/docs/payment-gateway/react-native-integration/)
- [Test Cards](https://razorpay.com/docs/payment-gateway/test-cards/)
