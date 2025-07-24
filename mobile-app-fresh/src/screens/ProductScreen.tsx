import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ProductScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { product, barcode } = route.params || {};

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out this product analysis: ${product?.product_name || 'Unknown Product'} - Analyzed by ProcessedOrNot Scanner`,
        title: 'Product Analysis',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getProcessingLevel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'minimal':
        return { text: 'Minimally Processed', color: colors.success };
      case 'processed':
        return { text: 'Processed', color: colors.warning };
      case 'ultra-processed':
        return { text: 'Ultra-Processed', color: colors.error };
      default:
        return { text: 'Unknown', color: colors.textSecondary };
    }
  };

  const processingInfo = getProcessingLevel(product?.processing_level);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.productName, { color: colors.text }]}>
            {product?.product_name || 'Unknown Product'}
          </Text>
          {product?.brands && (
            <Text style={[styles.brand, { color: colors.textSecondary }]}>
              by {product.brands}
            </Text>
          )}
          {barcode && (
            <Text style={[styles.barcode, { color: colors.textSecondary }]}>
              Barcode: {barcode}
            </Text>
          )}
        </View>

        {/* Processing Level */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Processing Level
          </Text>
          <View style={[styles.processingBadge, { backgroundColor: processingInfo.color }]}>
            <Text style={styles.processingText}>{processingInfo.text}</Text>
          </View>
          {product?.processing_explanation && (
            <Text style={[styles.explanation, { color: colors.textSecondary }]}>
              {product.processing_explanation}
            </Text>
          )}
        </View>

        {/* Nutritional Information */}
        {product?.nutriments && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Nutritional Information (per 100g)
            </Text>
            <View style={styles.nutritionGrid}>
              {product.nutriments.energy_100g && (
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                    Energy
                  </Text>
                  <Text style={[styles.nutritionValue, { color: colors.text }]}>
                    {product.nutriments.energy_100g} kJ
                  </Text>
                </View>
              )}
              {product.nutriments.fat_100g && (
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                    Fat
                  </Text>
                  <Text style={[styles.nutritionValue, { color: colors.text }]}>
                    {product.nutriments.fat_100g}g
                  </Text>
                </View>
              )}
              {product.nutriments.carbohydrates_100g && (
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                    Carbs
                  </Text>
                  <Text style={[styles.nutritionValue, { color: colors.text }]}>
                    {product.nutriments.carbohydrates_100g}g
                  </Text>
                </View>
              )}
              {product.nutriments.proteins_100g && (
                <View style={styles.nutritionItem}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                    Protein
                  </Text>
                  <Text style={[styles.nutritionValue, { color: colors.text }]}>
                    {product.nutriments.proteins_100g}g
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Ingredients */}
        {product?.ingredients_text && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ingredients
            </Text>
            <Text style={[styles.ingredients, { color: colors.textSecondary }]}>
              {product.ingredients_text}
            </Text>
          </View>
        )}

        {/* Health Insights */}
        {product?.health_insights && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Health Insights
            </Text>
            <Text style={[styles.insights, { color: colors.textSecondary }]}>
              {product.health_insights}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={shareProduct}
          >
            <Text style={styles.actionButtonText}>Share Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Scan Another
            </Text>
          </TouchableOpacity>
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
    padding: 20,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    marginBottom: 4,
  },
  barcode: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  processingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  processingText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredients: {
    fontSize: 14,
    lineHeight: 20,
  },
  insights: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ProductScreen;