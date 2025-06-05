import { InsertProduct } from "@shared/schema";
import { storage } from "../storage";

interface SearchSuggestion {
  barcode: string;
  productName: string;
  brands?: string;
  similarity: number;
  reason: string;
}

export async function generateSearchSuggestions(originalBarcode: string): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];
  
  try {
    // Get all products from database for similarity matching
    const allProducts = await getAllProductsFromDatabase();
    
    // Generate barcode variations
    const barcodeVariations = generateBarcodeVariations(originalBarcode);
    
    // Find products with similar barcodes
    for (const product of allProducts) {
      const similarity = calculateBarcodeSimilarity(originalBarcode, product.barcode);
      
      if (similarity > 0.6) { // 60% similarity threshold
        suggestions.push({
          barcode: product.barcode,
          productName: product.productName || 'Unknown Product',
          brands: product.brands || undefined,
          similarity,
          reason: similarity > 0.9 ? 'Very similar barcode' : 'Similar barcode pattern'
        });
      }
    }
    
    // Find products with similar names if we have product name hints
    const nameHints = extractProductNameHints(originalBarcode);
    if (nameHints.length > 0) {
      for (const product of allProducts) {
        if (product.productName) {
          const nameSimilarity = calculateNameSimilarity(nameHints, product.productName);
          if (nameSimilarity > 0.5) {
            suggestions.push({
              barcode: product.barcode,
              productName: product.productName,
              brands: product.brands || undefined,
              similarity: nameSimilarity,
              reason: 'Similar product name'
            });
          }
        }
      }
    }
    
    // Sort by similarity and remove duplicates
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, array) => 
        array.findIndex(s => s.barcode === suggestion.barcode) === index
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Top 5 suggestions
    
    return uniqueSuggestions;
    
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [];
  }
}

async function getAllProductsFromDatabase(): Promise<InsertProduct[]> {
  // This would need to be implemented in your storage layer
  // For now, return empty array - you'd implement this based on your database structure
  return [];
}

function generateBarcodeVariations(barcode: string): string[] {
  const variations: string[] = [];
  
  // Remove/add check digits
  if (barcode.length === 13) {
    variations.push(barcode.slice(0, 12)); // EAN-13 to UPC-A
  }
  if (barcode.length === 12) {
    variations.push('0' + barcode); // UPC-A to EAN-13
  }
  
  // Try with leading zeros removed/added
  variations.push(barcode.replace(/^0+/, ''));
  variations.push('0' + barcode);
  variations.push('00' + barcode);
  
  // Try common OCR mistakes (6->5, 8->3, etc.)
  const ocrMistakes = {
    '0': '8', '1': '7', '2': '7', '3': '8', '4': '9',
    '5': '6', '6': '5', '7': '1', '8': '0', '9': '4'
  };
  
  for (let i = 0; i < barcode.length; i++) {
    const char = barcode[i];
    if (ocrMistakes[char as keyof typeof ocrMistakes]) {
      const variation = barcode.substring(0, i) + 
                       ocrMistakes[char as keyof typeof ocrMistakes] + 
                       barcode.substring(i + 1);
      variations.push(variation);
    }
  }
  
  return variations.filter(v => v !== barcode && v.length >= 8);
}

function calculateBarcodeSimilarity(barcode1: string, barcode2: string): number {
  if (barcode1 === barcode2) return 1.0;
  
  const len1 = barcode1.length;
  const len2 = barcode2.length;
  const maxLen = Math.max(len1, len2);
  
  // Levenshtein distance
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = barcode1[i - 1] === barcode2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  return 1 - (distance / maxLen);
}

function extractProductNameHints(barcode: string): string[] {
  // Extract potential product name hints from barcode patterns
  // This is a simplified implementation - in practice, you might have
  // more sophisticated barcode-to-product-type mappings
  
  const hints: string[] = [];
  
  // GS1 company prefixes for known brands
  const companyPrefixes: { [key: string]: string[] } = {
    '30': ['Kellogg', 'cereal', 'breakfast'],
    '04': ['Coca Cola', 'drink', 'beverage'],
    '01': ['Pepsi', 'drink', 'beverage'],
    '36': ['Nestle', 'chocolate', 'candy'],
    '76': ['Unilever', 'food', 'personal care']
  };
  
  const prefix = barcode.substring(0, 2);
  if (companyPrefixes[prefix]) {
    hints.push(...companyPrefixes[prefix]);
  }
  
  return hints;
}

function calculateNameSimilarity(hints: string[], productName: string): number {
  const productNameLower = productName.toLowerCase();
  let maxSimilarity = 0;
  
  for (const hint of hints) {
    const hintLower = hint.toLowerCase();
    if (productNameLower.includes(hintLower)) {
      maxSimilarity = Math.max(maxSimilarity, 0.8);
    } else {
      // Simple word overlap similarity
      const hintWords = hintLower.split(' ');
      const productWords = productNameLower.split(' ');
      const overlap = hintWords.filter(word => productWords.includes(word)).length;
      const similarity = overlap / Math.max(hintWords.length, productWords.length);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
  }
  
  return maxSimilarity;
}