import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, ArrowRight } from 'lucide-react-native';
import { APP_RELEASE_NOTES } from '../utils/releaseNotes';
import { THEME } from '../constants/theme';

const { width } = Dimensions.get('window');

interface ReleaseNotesScreenProps {
  onContinue: () => void;
}

export default function ReleaseNotesScreen({ onContinue }: ReleaseNotesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[THEME.colors.surface, THEME.colors.background]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Rocket color={THEME.colors.primary} size={40} />
          </View>
          <Text style={styles.title}>Yenilikler</Text>
          <Text style={styles.version}>Sürüm {APP_RELEASE_NOTES.version}</Text>
        </View>

        <ScrollView 
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              {APP_RELEASE_NOTES.notes}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Devam Et</Text>
              <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 16,
    color: THEME.colors.secondary,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  notesCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  notesText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#CBD5E1',
    letterSpacing: 0.3,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: THEME.colors.primary,
    elevation: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});
