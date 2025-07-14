import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../context/ApiContext';

const SearchScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { searchProduct, isLoading } = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    try {
      const product = await searchProduct(searchQuery.trim());
      
      // Add to search history
      if (!searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 9)]);
      }
      
      if (product) {
        navigation.navigate('Product', { product, barcode: product.barcode || 'N/A' });
      } else {
        Alert.alert(
          'No Results',
          `No product found for "${searchQuery}"`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search. Please try again.');
    }
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => setSearchHistory([]) },
      ]
    );
  };

  const searchSuggestions = [
    'Coca Cola',
    'Organic Banana',
    'Whole Wheat Bread',
    'Greek Yogurt',
    'Almonds',
    'Chicken Breast',
    'Olive Oil',
    'Dark Chocolate',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <Text style={[styles.title, { color: colors.text }]}>
            Search Products
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find detailed information about any food product
          </Text>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Enter product name or barcode..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Searches
              </Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={[styles.clearButton, { color: colors.primary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.historyContainer}>
              {searchHistory.map((query, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.historyItem, { borderColor: colors.border }]}
                  onPress={() => handleHistoryItemPress(query)}
                >
                  <Text style={[styles.historyText, { color: colors.textSecondary }]}>
                    {query}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Suggestions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Popular Searches
          </Text>
          <View style={styles.suggestionsContainer}>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionItem, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Tips */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Search Tips
          </Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>🔍</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Search by product name, brand, or ingredients
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>📱</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Use the camera to scan barcodes directly
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>🌍</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Search works in multiple languages
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>🤖</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                AI-powered analysis provides detailed insights
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.actionButtonText}>📷 Scan Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionButtonText}>🏠 Go Home</Text>
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
  searchHeader: {
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
    flexDirection: 'row',
    margin: 20,
    padding: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyContainer: {
    gap: 8,
  },
  historyItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  historyText: {
    fontSize: 14,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;