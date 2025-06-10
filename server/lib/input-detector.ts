/**
 * Detects whether input is a barcode or plain text
 */
export function detectInputType(input: string): 'barcode' | 'text' {
  const trimmed = input.trim();
  
  // Check if it's primarily numeric (barcodes are usually numeric)
  const numericRatio = (trimmed.match(/\d/g) || []).length / trimmed.length;
  
  // Common barcode patterns
  const barcodePatterns = [
    /^\d{8}$/, // EAN-8
    /^\d{12}$/, // UPC-A
    /^\d{13}$/, // EAN-13
    /^\d{14}$/, // GTIN-14
    /^\d{4,18}$/, // General numeric codes
  ];
  
  // Check if it matches common barcode patterns
  const matchesBarcodePattern = barcodePatterns.some(pattern => pattern.test(trimmed));
  
  // If it's mostly numeric or matches barcode patterns, consider it a barcode
  if (numericRatio > 0.8 || matchesBarcodePattern) {
    return 'barcode';
  }
  
  // Check for specific barcode prefixes (GS1 company prefixes)
  const barcodeStartPatterns = [
    /^0\d+/, // UPC-A starting with 0
    /^[1-9]\d+/, // Various GS1 prefixes
  ];
  
  const hasNumericStart = barcodeStartPatterns.some(pattern => pattern.test(trimmed));
  
  // If it starts like a barcode and is reasonably long
  if (hasNumericStart && trimmed.length >= 6 && numericRatio > 0.7) {
    return 'barcode';
  }
  
  // Otherwise, treat as text
  return 'text';
}