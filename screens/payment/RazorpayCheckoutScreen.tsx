import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { getRazorpayKeys } from '../../services/api/razorpayConfig';

// Navigation types
type RootStackParamList = {
  RazorpayCheckout: {
    amount: number;
    currency?: string;
    name?: string;
    description: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    orderId: string;
    cartType: 'grocery' | 'pharmacy';
    deliveryMethod: string;
  };
  PaymentMethods: undefined;
  OrderConfirmation: {
    paymentData?: any;
    orderId?: string;
    amount?: number;
  };
};

type RazorpayCheckoutRouteProp = RouteProp<RootStackParamList, 'RazorpayCheckout'>;
type RazorpayCheckoutNavigationProp = StackNavigationProp<RootStackParamList, 'RazorpayCheckout'>;

const RazorpayCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<RazorpayCheckoutNavigationProp>();
  const route = useRoute<RazorpayCheckoutRouteProp>();
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');

  const {
    amount,
    currency = 'INR',
    name = 'E-Comm App',
    description,
    prefill = {},
    orderId,
    cartType,
    deliveryMethod,
  } = route.params;

  const { keyId } = getRazorpayKeys();

  // Generate Razorpay checkout HTML
  const generateRazorpayHTML = () => {
    const amountInPaise = Math.round(amount * 100);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment - ${name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 30px;
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            margin: 20px 0;
          }
          
          .description {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
          }
          
          .pay-btn {
            background: ${theme.colors.primary};
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-bottom: 20px;
            transition: opacity 0.3s;
          }
          
          .pay-btn:hover {
            opacity: 0.9;
          }
          
          .pay-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .loading {
            display: none;
            color: #666;
            margin-top: 10px;
          }
          
          .spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid ${theme.colors.primary};
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error {
            color: #f44336;
            margin-top: 10px;
            display: none;
            font-size: 14px;
          }
          
          .status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 8px;
            display: none;
            font-size: 14px;
          }
          
          .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">${name}</div>
          <div class="amount">₹${amount}</div>
          <div class="description">${description}</div>
          <button class="pay-btn" id="payBtn" onclick="openRazorpay()">
            Pay Now
          </button>
          <div class="loading" id="loading">
            <div class="spinner"></div>
            Processing payment...
          </div>
          <div class="error" id="error">
            Payment failed. Please try again.
          </div>
          <div class="status" id="status"></div>
        </div>
        
        <script>
          let razorpayLoaded = false;
          let retryCount = 0;
          const maxRetries = 3;
          
          // Function to load Razorpay script
          function loadRazorpayScript() {
            return new Promise((resolve, reject) => {
              if (typeof window.Razorpay !== 'undefined') {
                razorpayLoaded = true;
                resolve();
                return;
              }
              
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.async = true;
              script.onload = function() {
                console.log('Razorpay script loaded successfully');
                razorpayLoaded = true;
                resolve();
              };
              script.onerror = function(error) {
                console.error('Failed to load Razorpay script:', error);
                reject(new Error('Failed to load Razorpay script'));
              };
              document.head.appendChild(script);
            });
          }
          
          // Function to show status
          function showStatus(message, type) {
            const statusEl = document.getElementById('status');
            if (statusEl) {
              statusEl.textContent = message;
              statusEl.className = 'status ' + type;
              statusEl.style.display = 'block';
            }
          }
          
          // Function to hide status
          function hideStatus() {
            const statusEl = document.getElementById('status');
            if (statusEl) {
              statusEl.style.display = 'none';
            }
          }
          
          // Function to show loading
          function showLoading() {
            const loadingEl = document.getElementById('loading');
            const payBtnEl = document.getElementById('payBtn');
            if (loadingEl) loadingEl.style.display = 'block';
            if (payBtnEl) payBtnEl.disabled = true;
            hideStatus();
          }
          
          // Function to hide loading
          function hideLoading() {
            const loadingEl = document.getElementById('loading');
            const payBtnEl = document.getElementById('payBtn');
            if (loadingEl) loadingEl.style.display = 'none';
            if (payBtnEl) payBtnEl.disabled = false;
          }
          
          // Function to show error
          function showError(message) {
            const errorEl = document.getElementById('error');
            if (errorEl) {
              errorEl.textContent = message;
              errorEl.style.display = 'block';
            }
            hideLoading();
          }
          
          // Function to hide error
          function hideError() {
            const errorEl = document.getElementById('error');
            if (errorEl) {
              errorEl.style.display = 'none';
            }
          }
          
          // Function to send message to React Native
          function sendMessageToRN(type, data) {
            try {
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                const message = JSON.stringify({ type, data });
                window.ReactNativeWebView.postMessage(message);
                console.log('Message sent to RN:', type);
              } else {
                console.warn('ReactNativeWebView not available');
              }
            } catch (error) {
              console.error('Error sending message to RN:', error);
            }
          }
          
          // Main function to open Razorpay
          async function openRazorpay() {
            try {
              console.log('Starting payment process...');
              showLoading();
              hideError();
              
              // Load Razorpay script if not already loaded
              if (!razorpayLoaded) {
                showStatus('Loading payment gateway...', 'success');
                await loadRazorpayScript();
              }
              
              // Wait a bit for script to initialize
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Check if Razorpay is available
              if (typeof window.Razorpay === 'undefined') {
                throw new Error('Razorpay object is not available after script load');
              }
              
              console.log('Razorpay object available, creating options...');
              
              const options = {
                key: '${keyId}',
                amount: ${amountInPaise},
                currency: '${currency}',
                name: '${name}',
                description: '${description}',
                image: 'https://your-app-logo-url.com/logo.png',
                order_id: '${orderId}',
                prefill: {
                  name: '${prefill.name || 'User Name'}',
                  email: '${prefill.email || 'user@example.com'}',
                  contact: '${prefill.contact || '9999999999'}'
                },
                theme: {
                  color: '${theme.colors.primary}'
                },
                notes: {
                  cart_type: '${cartType}',
                  delivery_method: '${deliveryMethod}'
                },
                handler: function (response) {
                  console.log('Payment Success:', response);
                  showStatus('Payment successful! Redirecting...', 'success');
                  sendMessageToRN('PAYMENT_SUCCESS', response);
                },
                modal: {
                  ondismiss: function() {
                    console.log('Payment Cancelled');
                    hideLoading();
                    sendMessageToRN('PAYMENT_CANCELLED');
                  }
                }
              };
              
              console.log('Opening Razorpay with options:', options);
              
              const rzp = new window.Razorpay(options);
              rzp.open();
              
            } catch (error) {
              console.error('Razorpay Error:', error);
              showError('Payment failed: ' + error.message);
              
              // Retry logic
              if (retryCount < maxRetries) {
                retryCount++;
                showStatus('Retrying... (' + retryCount + '/' + maxRetries + ')', 'error');
                setTimeout(() => {
                  hideStatus();
                  openRazorpay();
                }, 2000);
              } else {
                sendMessageToRN('PAYMENT_ERROR', { error: error.message || 'Unknown error' });
              }
            }
          }
          
          // Auto-open payment after page loads
          window.addEventListener('load', () => {
            console.log('Page loaded, starting payment process...');
            setTimeout(() => {
              openRazorpay();
            }, 1000);
          });
          
          // Fallback if window load doesn't fire
          setTimeout(() => {
            if (!razorpayLoaded) {
              console.log('Fallback: Starting payment process...');
              openRazorpay();
            }
          }, 2000);
        </script>
      </body>
      </html>
    `;
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', message);

      switch (message.type) {
        case 'PAYMENT_SUCCESS':
          console.log('Payment successful:', message.data);
          setPaymentStatus('success');
          // Navigate to order confirmation
          navigation.replace('OrderConfirmation', {
            paymentData: message.data,
            orderId: orderId,
            amount: amount,
          });
          break;
          
        case 'PAYMENT_CANCELLED':
          console.log('Payment cancelled by user');
          setPaymentStatus('cancelled');
          // Go back to payment methods
          navigation.goBack();
          break;
          
        case 'PAYMENT_ERROR':
          console.log('Payment error:', message.data);
          setPaymentStatus('failed');
          Alert.alert(
            'Payment Failed',
            message.data?.error || 'Payment could not be processed. Please try again.',
            [
              { text: 'Try Again', onPress: () => webViewRef.current?.reload() },
              { text: 'Go Back', onPress: () => navigation.goBack() }
            ]
          );
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Handle WebView load
  const handleWebViewLoad = () => {
    console.log('WebView loaded');
    setIsLoading(false);
  };

  // Handle WebView error
  const handleWebViewError = (error: any) => {
    console.error('WebView Error:', error);
    setPaymentStatus('failed');
    setIsLoading(false);
    
    Alert.alert(
      'Loading Error',
      'Failed to load payment page. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => webViewRef.current?.reload() },
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            {paymentStatus === 'loading' ? 'Loading payment...' : 'Processing payment...'}
          </Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: generateRazorpayHTML() }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView HTTP Error:', nativeEvent);
          setPaymentStatus('failed');
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          console.log('WebView load ended');
          setIsLoading(false);
        }}
        onLoadStart={() => {
          console.log('WebView load started');
          setIsLoading(true);
        }}
        renderError={(errorDomain, errorCode, errorDesc) => {
          console.log('WebView Render Error:', errorDomain, errorCode, errorDesc);
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load payment page</Text>
              <Text style={styles.errorSubtext}>
                {errorDesc || 'Please check your internet connection and try again.'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  console.log('Retrying WebView load...');
                  webViewRef.current?.reload();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        // Additional props for better compatibility
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Security settings
        originWhitelist={['*']}
        allowsFullscreenVideo={false}
        // Performance optimizations
        cacheEnabled={true}
        incognito={false}
        // Enable JavaScript execution
        injectedJavaScript={`
          window.ReactNativeWebView = window.ReactNativeWebView || {};
          
          // Force Razorpay to work in WebView
          if (typeof window.Razorpay === 'undefined') {
            console.log('Razorpay not available, loading...');
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = function() {
              console.log('Razorpay loaded in WebView');
            };
            document.head.appendChild(script);
          }
          
          true;
        `}
        // Allow navigation to external URLs for Razorpay
        onShouldStartLoadWithRequest={(request) => {
          console.log('WebView navigation request:', request.url);
          return true;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RazorpayCheckoutScreen;