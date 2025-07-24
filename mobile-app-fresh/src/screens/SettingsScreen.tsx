import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }: any) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [hapticFeedback, setHapticFeedback] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(false);

  const handleAbout = () => {
    Alert.alert(
      'About ProcessedOrNot Scanner',
      'Version 1.0.0\n\nAI-powered food product analysis app that helps you make informed decisions about what you eat.\n\nDeveloped with ❤️ for better nutrition awareness.',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'We value your feedback! Please send your suggestions to feedback@processedornot.com',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We only collect necessary data to provide our service and never share personal information with third parties.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    showArrow = true 
  }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={switchValue ? '#FFFFFF' : colors.textSecondary}
        />
      ) : showArrow ? (
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
      ) : null}
    </TouchableOpacity>
  );

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

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <SettingItem
            title="Dark Mode"
            subtitle={`Currently using ${theme} theme`}
            showSwitch={true}
            switchValue={theme === 'dark'}
            onSwitchChange={toggleTheme}
          />
        </View>

        {/* Scanner Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scanner Settings</Text>
          
          <SettingItem
            title="Haptic Feedback"
            subtitle="Vibrate when barcode is detected"
            showSwitch={true}
            switchValue={hapticFeedback}
            onSwitchChange={setHapticFeedback}
          />
          
          <SettingItem
            title="Sound Effects"
            subtitle="Play sound when scanning"
            showSwitch={true}
            switchValue={soundEnabled}
            onSwitchChange={setSoundEnabled}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <SettingItem
            title="Push Notifications"
            subtitle="Get updates about new features"
            showSwitch={true}
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
          
          <SettingItem
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
          
          <SettingItem
            title="Send Feedback"
            subtitle="Help us improve the app"
            onPress={handleFeedback}
          />
          
          <SettingItem
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacy}
          />
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <SettingItem
            title="Scan Product"
            subtitle="Start camera scanner"
            onPress={() => navigation.navigate('Scanner')}
          />
          
          <SettingItem
            title="Search Products"
            subtitle="Manual product search"
            onPress={() => navigation.navigate('Search')}
          />
        </View>

        {/* App Statistics */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            App Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>14+</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Food Databases
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>7</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Languages
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>AI</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Powered
              </Text>
            </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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

export default SettingsScreen;