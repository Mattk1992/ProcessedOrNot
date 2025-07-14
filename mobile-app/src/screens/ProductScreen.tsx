import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ProductScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { product, barcode } = route.params;

  const getProcessingLevelColor = (score: number) => {
    if (score <= 3) return colors.success;
    if (score <= 6) return colors.warning;
    return colors.error;
  };

  const getProcessingLevelText = (score: number) => {
    if (score <= 3) return 'Minimally Processed';
    if (score <= 6) return 'Moderately Processed';
    return 'Highly Processed';
  };

  const getGlycemicLevelColor = (index: number) => {
    if (index <= 55) return colors.success;
    if (index <= 70) return colors.warning;
    return colors.error;
  };

  const getGlycemicLevelText = (index: number) => {
    if (index <= 55) return 'Low';
    if (index <= 70) return 'Medium';
    return 'High';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          {product.imageUrl && (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          )}
          <View style={styles.headerContent}>
            <Text style={[styles.productName, { color: colors.text }]}>
              {product.productName || 'Unknown Product'}
            </Text>
            {product.brands && (
              <Text style={[styles.brandName, { color: colors.textSecondary }]}>
                {product.brands}
              </Text>
            )}
            <Text style={[styles.barcode, { color: colors.textSecondary }]}>
              Barcode: {barcode}
            </Text>
          </View>
        </View>

        {/* Processing Analysis */}
        {product.processingScore !== undefined && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Processing Level Analysis
            </Text>
            <View style={styles.scoreContainer}>
              <View style={[
                styles.scoreCircle,
                { backgroundColor: getProcessingLevelColor(product.processingScore) }
              ]}>
                <Text style={styles.scoreText}>{product.processingScore}/10</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={[
                  styles.scoreLabel,
                  { color: getProcessingLevelColor(product.processingScore) }
                ]}>
                  {getProcessingLevelText(product.processingScore)}
                </Text>
                <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
                  {product.processingExplanation || 'No explanation available'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Glycemic Index */}
        {product.glycemicIndex !== undefined && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Glycemic Impact
            </Text>
            <View style={styles.glycemicContainer}>
              <View style={styles.glycemicItem}>
                <Text style={[styles.glycemicLabel, { color: colors.textSecondary }]}>
                  Glycemic Index
                </Text>
                <Text style={[
                  styles.glycemicValue,
                  { color: getGlycemicLevelColor(product.glycemicIndex) }
                ]}>
                  {product.glycemicIndex} - {getGlycemicLevelText(product.glycemicIndex)}
                </Text>
              </View>
              {product.glycemicLoad !== undefined && (
                <View style={styles.glycemicItem}>
                  <Text style={[styles.glycemicLabel, { color: colors.textSecondary }]}>
                    Glycemic Load
                  </Text>
                  <Text style={[styles.glycemicValue, { color: colors.text }]}>
                    {product.glycemicLoad}
                  </Text>
                </View>
              )}
            </View>
            {product.glycemicExplanation && (
              <Text style={[styles.explanation, { color: colors.textSecondary }]}>
                {product.glycemicExplanation}
              </Text>
            )}
          </View>
        )}

        {/* Ingredients */}
        {product.ingredientsText && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Ingredients
            </Text>
            <Text style={[styles.ingredientsText, { color: colors.textSecondary }]}>
              {product.ingredientsText}
            </Text>
          </View>
        )}

        {/* Nutrition Facts */}
        {product.nutriments && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Nutrition Facts (per 100g)
            </Text>
            <View style={styles.nutritionGrid}>
              {Object.entries(product.nutriments).map(([key, value]) => {
                if (typeof value === 'number') {
                  const label = key.replace(/_/g, ' ').replace(/100g/g, '').trim();
                  return (
                    <View key={key} style={styles.nutritionItem}>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        {label}
                      </Text>
                      <Text style={[styles.nutritionValue, { color: colors.text }]}>
                        {value}g
                      </Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          </View>
        )}

        {/* Data Source */}
        {product.dataSource && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Data Source
            </Text>
            <Text style={[styles.dataSource, { color: colors.textSecondary }]}>
              {product.dataSource}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.actionButtonText}>Scan Another Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.actionButtonText}>Search Products</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    marginBottom: 4,
  },
  barcode: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  glycemicContainer: {
    marginBottom: 12,
  },
  glycemicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  glycemicLabel: {
    fontSize: 14,
  },
  glycemicValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
  },
  ingredientsText: {
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
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataSource: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductScreen;