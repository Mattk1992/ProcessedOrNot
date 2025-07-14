import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }: any) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoScan, setAutoScan] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Dark Mode',
          subtitle: 'Toggle between light and dark themes',
          type: 'switch',
          value: theme === 'dark',
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Scanning',
      items: [
        {
          title: 'Auto-scan',
          subtitle: 'Automatically scan when barcode is detected',
          type: 'switch',
          value: autoScan,
          onToggle: setAutoScan,
        },
        {
          title: 'Haptic Feedback',
          subtitle: 'Vibrate when scanning barcodes',
          type: 'switch',
          value: hapticFeedback,
          onToggle: setHapticFeedback,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          title: 'Save Search History',
          subtitle: 'Store your recent searches locally',
          type: 'switch',
          value: saveHistory,
          onToggle: setSaveHistory,
        },
        {
          title: 'Clear Search History',
          subtitle: 'Remove all saved searches',
          type: 'button',
          onPress: () => {
            Alert.alert(
              'Clear History',
              'Are you sure you want to clear all search history?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => Alert.alert('Success', 'Search history cleared') },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive updates about new features',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & FAQ',
          subtitle: 'Get help with using the app',
          type: 'button',
          onPress: () => Alert.alert('Help', 'Help documentation coming soon!'),
        },
        {
          title: 'Report a Bug',
          subtitle: 'Send feedback about issues',
          type: 'button',
          onPress: () => Alert.alert('Bug Report', 'Bug reporting feature coming soon!'),
        },
        {
          title: 'Rate the App',
          subtitle: 'Leave a review in the app store',
          type: 'button',
          onPress: () => Alert.alert('Rate App', 'Thank you for your feedback!'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          title: 'Developer',
          subtitle: 'ProcessedOrNot Scanner Team',
          type: 'info',
        },
        {
          title: 'Privacy Policy',
          subtitle: 'View our privacy policy',
          type: 'button',
          onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon!'),
        },
        {
          title: 'Terms of Service',
          subtitle: 'View terms and conditions',
          type: 'button',
          onPress: () => Alert.alert('Terms of Service', 'Terms of service coming soon!'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity
            key={index}
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={item.onPress}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        );
      case 'info':
        return (
          <View key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
            <Text style={[styles.groupTitle, { color: colors.text }]}>
              {group.title}
            </Text>
            {group.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionButtonText}>🏠 Go Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.actionButtonText}>📷 Scan Product</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ProcessedOrNot Scanner v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            AI-powered food analysis for better health decisions
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
  settingsGroup: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;