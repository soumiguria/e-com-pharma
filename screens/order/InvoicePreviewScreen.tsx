import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { generateInvoiceFromOrder, InvoiceData, TransactionItem } from '../../services/api/invoiceService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'InvoicePreview'>;
type RouteProp = { params: { orderData: any } };

const InvoicePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute() as unknown as RouteProp;
  const { theme } = useTheme();
  const { orderData } = route.params || {};
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (orderData) {
      const invoice = generateInvoiceFromOrder(orderData);
      console.log('📄 Invoice data generated:', JSON.stringify(invoice, null, 2));
      console.log('📄 Store ID in invoice:', invoice.storeId);
      setInvoiceData(invoice);
    }
  }, [orderData]);

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${isNaN(num) ? '0.00' : num.toFixed(2)}`;
  };

  const handleDownload = async () => {
    if (!invoiceData) return;

    try {
      setIsGenerating(true);
      
      // Generate HTML for PDF
      const htmlContent = generateInvoiceHTML(invoiceData);
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Complete', `Invoice saved to: ${uri}`);
      }
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInvoiceHTML = (invoice: InvoiceData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .order-info { margin-bottom: 20px; }
          .order-info-row { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total-section { margin-top: 20px; text-align: right; }
          .total-row { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">INVOICE</div>
          <div>Order Number: ${invoice.orderNumber}</div>
        </div>
        
        <div class="order-info">
          <div class="order-info-row"><strong>Order Date:</strong> ${new Date(invoice.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          ${invoice.storeName ? `<div class="order-info-row"><strong>Store Name:</strong> ${invoice.storeName}</div>` : ''}
          ${invoice.storeId && invoice.storeId.trim() !== '' && invoice.storeId !== 'N/A' ? `<div class="order-info-row"><strong>Store ID:</strong> <span style="font-family: monospace;">${invoice.storeId}</span></div>` : ''}
          ${invoice.customerName ? `<div class="order-info-row"><strong>Customer:</strong> ${invoice.customerName}</div>` : ''}
          ${invoice.customerAddress ? `<div class="order-info-row"><strong>Delivery Address:</strong> ${invoice.customerAddress}</div>` : ''}
          ${invoice.deliveryMethod ? `<div class="order-info-row"><strong>Delivery Method:</strong> ${invoice.deliveryMethod}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.proname}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.billrate)}</td>
                <td>${formatCurrency(item.discountAmount)}</td>
                <td>${formatCurrency(item.taxamount)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">Subtotal: ${formatCurrency(Math.max(0, invoice.totalAmount - invoice.totalTax - invoice.totalDiscount))}</div>
          ${invoice.totalDiscount > 0 ? `<div class="total-row">Discount: -${formatCurrency(invoice.totalDiscount)}</div>` : ''}
          ${invoice.totalTax > 0 ? `<div class="total-row">Tax: ${formatCurrency(invoice.totalTax)}</div>` : ''}
          <div class="total-row grand-total">Total: ${formatCurrency(invoice.totalAmount)}</div>
        </div>

        ${invoice.paymentStatus ? `<div style="margin-top: 20px;"><strong>Payment Status:</strong> ${invoice.paymentStatus.toUpperCase()}</div>` : ''}
        ${invoice.paymentMode ? `<div><strong>Payment Mode:</strong> ${invoice.paymentMode.toUpperCase()}</div>` : ''}
      </body>
      </html>
    `;
  };

  if (!invoiceData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Invoice Preview</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={{ color: theme.colors.secondary }}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Invoice Preview</Text>
        <TouchableOpacity
          onPress={handleDownload}
          style={[styles.downloadButton, { backgroundColor: theme.colors.primary }]}
          disabled={isGenerating}
        >
          <MaterialIcons name="download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>
            {isGenerating ? 'Generating...' : 'Download'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Invoice Header */}
        <View style={[styles.invoiceHeader, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.invoiceTitle, { color: theme.colors.text }]}>INVOICE</Text>
          <Text style={[styles.orderNumber, { color: theme.colors.secondary }]}>
            Order Number: {invoiceData.orderNumber}
          </Text>
        </View>

        {/* Order Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          {/* Order Date */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.secondary }]}>Order Date:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text, fontWeight: '600' }]}>
              {new Date(invoiceData.orderDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          {/* Store Name */}
          {invoiceData.storeName && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondary }]}>Store Name:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text, fontWeight: '600' }]}>
                {invoiceData.storeName}
              </Text>
            </View>
          )}
          
          {/* Store ID - Always show if available */}
          {invoiceData.storeId && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondary }]}>Store ID:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }]}>
                {invoiceData.storeId}
              </Text>
            </View>
          )}
          
          {/* Delivery Address */}
          {invoiceData.customerAddress && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondary }]}>Delivery Address:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {invoiceData.customerAddress}
              </Text>
            </View>
          )}
          
          {/* Delivery Method */}
          {invoiceData.deliveryMethod && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondary }]}>Delivery Method:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {invoiceData.deliveryMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={[styles.tableCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.tableHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 2 }]}>Item</Text>
            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 1 }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 1 }]}>Rate</Text>
            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 1 }]}>Amount</Text>
          </View>

          {invoiceData.items.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.tableCell, { color: theme.colors.text, flex: 2 }]} numberOfLines={2}>
                {item.proname}
              </Text>
              <Text style={[styles.tableCell, { color: theme.colors.text, flex: 1 }]}>{item.qty}</Text>
              <Text style={[styles.tableCell, { color: theme.colors.text, flex: 1 }]}>
                {formatCurrency(item.billrate)}
              </Text>
              <Text style={[styles.tableCell, { color: theme.colors.text, flex: 1 }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Subtotal:</Text>
            <Text style={[styles.totalValue, { color: theme.colors.text }]}>
              {formatCurrency(Math.max(0, invoiceData.totalAmount - invoiceData.totalTax - invoiceData.totalDiscount))}
            </Text>
          </View>
          {invoiceData.totalDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#4CAF50' }]}>
                -{formatCurrency(invoiceData.totalDiscount)}
              </Text>
            </View>
          )}
          {invoiceData.totalTax > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Tax:</Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {formatCurrency(invoiceData.totalTax)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={[styles.grandTotalLabel, { color: theme.colors.text }]}>Total:</Text>
            <Text style={[styles.grandTotalValue, { color: theme.colors.primary }]}>
              {formatCurrency(invoiceData.totalAmount)}
            </Text>
          </View>

          {invoiceData.paymentStatus && (
            <View style={[styles.totalRow, { marginTop: 10 }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.secondary }]}>Payment Status:</Text>
              <Text style={[styles.totalValue, { 
                color: invoiceData.paymentStatus === 'paid' ? '#4CAF50' : 
                       invoiceData.paymentStatus === 'pending' ? '#FF9800' : '#F44336' 
              }]}>
                {invoiceData.paymentStatus.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceHeader: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  tableCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tableCell: {
    fontSize: 14,
    textAlign: 'center',
  },
  totalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default InvoicePreviewScreen;

