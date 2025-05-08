import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import logoUrl from '../assets/logo.png';

interface ReceiptData {
  transactionId: number;
  userId: number;
  userName: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  date: Date;
  paymentMethod: string;
  externalTransactionId?: string;
  processingFee?: string;
  paymentDetails?: string;
  investmentId?: number;
  planName?: string;
  adminProcessor?: string;
  digitalSignature?: string;
  ipAddress?: string;
  country?: string;
}

/**
 * Formats a date to a locale string format
 */
const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
};

/**
 * Generates a simple digital signature for transaction verification
 */
const generateDigitalSignature = (data: ReceiptData): string => {
  // In production, this would use a proper cryptographic signature
  // This is a simplified version for demonstration purposes
  const signatureInput = `${data.transactionId}-${data.userId}-${data.amount}-${data.date.toISOString()}`;
  return btoa(signatureInput); // Base64 encode the signature for demonstration
};

/**
 * Generate a verification QR code with enhanced transaction details
 */
const generateQRCode = async (data: ReceiptData): Promise<string> => {
  // Generate a digital signature if not present
  const signature = data.digitalSignature || generateDigitalSignature(data);
  
  const verificationData = {
    transactionId: data.transactionId,
    amount: data.amount,
    currency: data.currency,
    date: data.date.toISOString(),
    userId: data.userId,
    userName: data.userName,
    type: data.type,
    status: data.status,
    paymentMethod: data.paymentMethod,
    externalTransactionId: data.externalTransactionId || '',
    investmentId: data.investmentId || '',
    planName: data.planName || '',
    adminProcessor: data.adminProcessor || '',
    digitalSignature: signature,
    ipAddress: data.ipAddress || '',
    country: data.country || '',
    verificationUrl: `https://millionairewith25.com/verify/${data.transactionId}`
  };
  
  try {
    return await QRCode.toDataURL(JSON.stringify(verificationData));
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

/**
 * Generate a PDF receipt for a transaction
 */
export const generateReceipt = async (receiptData: ReceiptData): Promise<string> => {
  // Generate digital signature if not provided
  if (!receiptData.digitalSignature) {
    receiptData.digitalSignature = generateDigitalSignature(receiptData);
  }
  
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 30; // Starting y position
  
  // Add logo
  const logoSize = 15;
  doc.addImage(logoUrl, 'PNG', 20, 10, logoSize, logoSize);
  
  // Add branding
  doc.setFontSize(24);
  doc.setTextColor(242, 135, 5); // Orange color
  doc.text('MillionaireWith$25', pageWidth / 2, 20, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(242, 135, 5);
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);
  
  // Receipt title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`${receiptData.type.toUpperCase()} RECEIPT`, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Transaction details
  doc.setFontSize(12);
  doc.text(`Receipt #: ${receiptData.transactionId}`, 20, y);
  y += 8;
  
  doc.text(`Date: ${formatDate(receiptData.date)}`, 20, y);
  y += 8;
  
  doc.text(`Status: ${receiptData.status.toUpperCase()}`, 20, y);
  y += 14;
  
  // User info
  doc.setFontSize(14);
  doc.text('User Information', 20, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.text(`User ID: ${receiptData.userId}`, 20, y);
  y += 8;
  
  doc.text(`Name: ${receiptData.userName}`, 20, y);
  y += 14;
  
  // Transaction details
  doc.setFontSize(14);
  doc.text('Transaction Details', 20, y);
  y += 8;
  
  doc.setFontSize(12);
  
  // Draw table
  const tableTop = y;
  const tableWidth = pageWidth - 40;
  const rowHeight = 10;
  
  // Table header
  doc.setFillColor(242, 135, 5);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 25, y + 7);
  doc.text('Amount', pageWidth - 45, y + 7);
  y += rowHeight;
  
  // Table row
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.text(`${receiptData.type.charAt(0).toUpperCase() + receiptData.type.slice(1)} via ${receiptData.paymentMethod}`, 25, y + 7);
  doc.text(`${receiptData.currency} ${receiptData.amount}`, pageWidth - 45, y + 7);
  y += rowHeight;
  
  // Processing fee if applicable
  if (receiptData.processingFee) {
    doc.rect(20, y, tableWidth, rowHeight, 'F');
    doc.text('Processing Fee', 25, y + 7);
    doc.text(`${receiptData.currency} ${receiptData.processingFee}`, pageWidth - 45, y + 7);
    y += rowHeight;
  }
  
  // Total row
  doc.setFillColor(235, 235, 235);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 25, y + 7);
  
  // Calculate total (amount + fee or just amount)
  const totalAmount = receiptData.processingFee 
    ? (parseFloat(receiptData.amount) + parseFloat(receiptData.processingFee)).toFixed(2) 
    : receiptData.amount;
    
  doc.text(`${receiptData.currency} ${totalAmount}`, pageWidth - 45, y + 7);
  y += rowHeight + 15;
  
  // Additional details
  doc.setFont('helvetica', 'normal');
  if (receiptData.paymentDetails) {
    doc.text('Payment Details:', 20, y);
    y += 8;
    doc.text(receiptData.paymentDetails, 25, y);
    y += 8;
  }
  
  if (receiptData.externalTransactionId) {
    doc.text(`External Transaction ID: ${receiptData.externalTransactionId}`, 20, y);
    y += 15;
  }
  
  // Generate QR Code for verification
  const qrCodeDataUrl = await generateQRCode(receiptData);
  if (qrCodeDataUrl) {
    const qrSize = 40;
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - qrSize - 20, pageHeight - qrSize - 40, qrSize, qrSize);
    doc.setFontSize(10);
    doc.text('Scan to verify transaction', pageWidth - qrSize/2 - 20, pageHeight - 30, { align: 'center' });
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('This is an automatically generated receipt.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('For questions, please contact support@millionairewith25.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Save the PDF and return filename
  const filename = `receipt-${receiptData.transactionId}-${new Date().getTime()}.pdf`;
  doc.save(filename);
  
  return filename;
};

/**
 * Generate and download a receipt
 */
export const downloadReceipt = async (receiptData: ReceiptData): Promise<void> => {
  try {
    await generateReceipt(receiptData);
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt');
  }
};

/**
 * Generate receipt as base64 data URL
 */
export const generateReceiptAsBase64 = async (receiptData: ReceiptData): Promise<string> => {
  // Generate digital signature if not provided
  if (!receiptData.digitalSignature) {
    receiptData.digitalSignature = generateDigitalSignature(receiptData);
  }
  
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 30; // Starting y position
  
  // Add logo
  const logoSize = 15;
  doc.addImage(logoUrl, 'PNG', 20, 10, logoSize, logoSize);
  
  // Add branding
  doc.setFontSize(24);
  doc.setTextColor(242, 135, 5); // Orange color
  doc.text('MillionaireWith$25', pageWidth / 2, 20, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(242, 135, 5);
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);
  
  // Receipt title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`${receiptData.type.toUpperCase()} RECEIPT`, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Transaction details
  doc.setFontSize(12);
  doc.text(`Receipt #: ${receiptData.transactionId}`, 20, y);
  y += 8;
  
  doc.text(`Date: ${formatDate(receiptData.date)}`, 20, y);
  y += 8;
  
  doc.text(`Status: ${receiptData.status.toUpperCase()}`, 20, y);
  y += 14;
  
  // User info
  doc.setFontSize(14);
  doc.text('User Information', 20, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.text(`User ID: ${receiptData.userId}`, 20, y);
  y += 8;
  
  doc.text(`Name: ${receiptData.userName}`, 20, y);
  y += 14;
  
  // Transaction details
  doc.setFontSize(14);
  doc.text('Transaction Details', 20, y);
  y += 8;
  
  doc.setFontSize(12);
  
  // Draw table
  const tableTop = y;
  const tableWidth = pageWidth - 40;
  const rowHeight = 10;
  
  // Table header
  doc.setFillColor(242, 135, 5);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 25, y + 7);
  doc.text('Amount', pageWidth - 45, y + 7);
  y += rowHeight;
  
  // Table row
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.text(`${receiptData.type.charAt(0).toUpperCase() + receiptData.type.slice(1)} via ${receiptData.paymentMethod}`, 25, y + 7);
  doc.text(`${receiptData.currency} ${receiptData.amount}`, pageWidth - 45, y + 7);
  y += rowHeight;
  
  // Processing fee if applicable
  if (receiptData.processingFee) {
    doc.rect(20, y, tableWidth, rowHeight, 'F');
    doc.text('Processing Fee', 25, y + 7);
    doc.text(`${receiptData.currency} ${receiptData.processingFee}`, pageWidth - 45, y + 7);
    y += rowHeight;
  }
  
  // Total row
  doc.setFillColor(235, 235, 235);
  doc.rect(20, y, tableWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 25, y + 7);
  
  // Calculate total (amount + fee or just amount)
  const totalAmount = receiptData.processingFee 
    ? (parseFloat(receiptData.amount) + parseFloat(receiptData.processingFee)).toFixed(2) 
    : receiptData.amount;
    
  doc.text(`${receiptData.currency} ${totalAmount}`, pageWidth - 45, y + 7);
  y += rowHeight + 15;
  
  // Additional details
  doc.setFont('helvetica', 'normal');
  if (receiptData.paymentDetails) {
    doc.text('Payment Details:', 20, y);
    y += 8;
    doc.text(receiptData.paymentDetails, 25, y);
    y += 8;
  }
  
  if (receiptData.externalTransactionId) {
    doc.text(`External Transaction ID: ${receiptData.externalTransactionId}`, 20, y);
    y += 15;
  }
  
  // Generate QR Code for verification
  const qrCodeDataUrl = await generateQRCode(receiptData);
  if (qrCodeDataUrl) {
    const qrSize = 40;
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - qrSize - 20, pageHeight - qrSize - 40, qrSize, qrSize);
    doc.setFontSize(10);
    doc.text('Scan to verify transaction', pageWidth - qrSize/2 - 20, pageHeight - 30, { align: 'center' });
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('This is an automatically generated receipt.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('For questions, please contact support@millionairewith25.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Return base64 encoded PDF
  return doc.output('datauristring');
};