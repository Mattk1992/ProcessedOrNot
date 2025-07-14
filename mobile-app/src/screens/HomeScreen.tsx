import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { colors, theme } = useTheme();

  const features = [
    {
      title: 'Scan Barcode',
      description: 'Quickly scan product barcodes with your camera',
      icon: '📷',
      action: () => navigation.navigate('Scanner'),
      gradient: ['#3B82F6', '#8B5CF6'],
    },
    {
      title: 'Search Products',
      description: 'Search for products by name or description',
      icon: '🔍',
      action: () => navigation.navigate('Search'),
      gradient: ['#10B981', '#059669'],
    },
    {
      title: 'Settings',
      description: 'Customize your app experience',
      icon: '⚙️',
      action: () => navigation.navigate('Settings'),
      gradient: ['#F59E0B', '#D97706'],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            ProcessedOrNot Scanner
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Analyze food products with AI-powered insights
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={feature.action}
              style={styles.featureCard}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureContent}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <View style={[styles.aboutSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>
            About ProcessedOrNot Scanner
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Our AI-powered app helps you make informed decisions about food products by analyzing ingredients, 
            processing levels, and nutritional information. Scan barcodes or search for products to get instant 
            insights about what you're eating.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>14+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Food Databases
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>AI</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Powered Analysis
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>7</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Languages
            </Text>
          </View>
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
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    padding: 20,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureGradient: {
    padding: 20,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  aboutSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;