import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../context/ApiContext';

const SearchScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { searchProduct, isLoading } = useApi();
  const [query, setQuery] = useState('');
  const [recentSearches] = useState([
    'Coca Cola',
    'Nutella',
    'Oreo cookies',
    'Pringles',
    'Yogurt',
  ]);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a product name or barcode');
      return;
    }

    try {
      const product = await searchProduct(query.trim());
      
      if (product) {
        navigation.navigate('Product', { product, barcode: query });
      } else {
        Alert.alert(
          'Product Not Found',
          `No product found for: ${query}`,
          [
            { text: 'Try Again', onPress: () => setQuery('') },
            { text: 'Use Camera', onPress: () => navigation.navigate('Scanner') },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Search Error',
        'Failed to search for product. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Search Products
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter product name or barcode number
          </Text>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Enter product name or barcode..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
          
          <TouchableOpacity
            style={[
              styles.searchButton,
              { 
                backgroundColor: query.trim() ? colors.primary : colors.textSecondary,
                opacity: query.trim() ? 1 : 0.5 
              }
            ]}
            onPress={handleSearch}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Tips */}
        <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Search Tips:
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Enter the exact product name as it appears on packaging
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Include brand name for better results
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Try searching with barcode numbers (8-13 digits)
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Use specific terms like "organic" or "whole wheat"
          </Text>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentContainer}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>
            Popular Searches:
          </Text>
          <View style={styles.recentTags}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recentTag, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleRecentSearch(search)}
              >
                <Text style={[styles.recentTagText, { color: colors.text }]}>
                  {search}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alternative Actions */}
        <View style={styles.alternativeActions}>
          <TouchableOpacity
            style={[styles.alternativeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.alternativeIcon}>📷</Text>
            <Text style={[styles.alternativeText, { color: colors.text }]}>
              Use Camera Scanner
            </Text>
            <Text style={[styles.alternativeSubtext, { color: colors.textSecondary }]}>
              Point camera at barcode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={[styles.helpContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            Need Help?
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            If you can't find a product, try using the camera scanner for better accuracy. 
            Our database includes products from 14+ major food databases worldwide.
          </Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  searchButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  recentContainer: {
    margin: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  recentTagText: {
    fontSize: 14,
  },
  alternativeActions: {
    margin: 16,
  },
  alternativeButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  alternativeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alternativeSubtext: {
    fontSize: 14,
  },
  helpContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SearchScreen;