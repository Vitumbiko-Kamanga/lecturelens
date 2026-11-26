import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBreakpoint } from '../components/common/ResponsiveScreen';

const NAVY = '#14335C';
const GOLD = '#F2B13E';

const FEATURES = [
  { icon: 'mic-outline', title: 'Capture lectures', text: 'Record and keep lecture audio together.' },
  { icon: 'document-text-outline', title: 'Notes and transcripts', text: 'Review lecture text and add your own notes.' },
  { icon: 'library-outline', title: 'Organise your learning', text: 'Keep modules, lectures and resources in one place.' },
];

export default function Index() {
  const router = useRouter();
  const { isTablet, isDesktop } = useBreakpoint();
  const gutter = isDesktop ? 48 : isTablet ? 32 : 16;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero: full-bleed background, centered content */}
      <View style={[styles.hero, { paddingHorizontal: gutter, paddingVertical: isDesktop ? 88 : 56 }]}>
        <View style={styles.heroInner}>
          <Text style={[styles.brand, isDesktop && { fontSize: 36 }]}>LectureLens</Text>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="binoculars" size={40} color={NAVY} />
          </View>
          <Text style={[styles.headline, isDesktop && { fontSize: 52, lineHeight: 60 }]}>
            Learn without
          </Text>
          <Text style={[styles.headline, styles.headlineAccent, isDesktop && { fontSize: 52, lineHeight: 60 }]}>
            missing a moment.
          </Text>
          <Text style={[styles.subtitle, isDesktop && { fontSize: 18 }]}>
            Your lecture companion for capturing, organising and revisiting lecture information.
          </Text>
        </View>
      </View>

      {/* Content: centered column with padding */}
      <View style={[styles.content, { paddingHorizontal: gutter }]}>
        <View style={[styles.cards, isDesktop && styles.cardsRow]}>
          {FEATURES.map((f) => (
            <View key={f.title} style={[styles.card, isDesktop && styles.cardDesktop]}>
              <View style={styles.cardIcon}>
                <Ionicons name={f.icon} size={26} color={NAVY} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cta}>
          <Pressable
            onPress={() => router.push('/register')}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={NAVY} />
          </Pressable>

          <Text style={styles.signin}>
            Already have an account?{' '}
            <Text style={styles.signinLink} onPress={() => router.push('/login')}>
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FB' },
  pageContent: { flexGrow: 1, paddingBottom: 48 },

  hero: {
    backgroundColor: NAVY,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroInner: { width: '100%', maxWidth: 760, alignItems: 'center' },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  logo: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  headline: { color: '#fff', fontSize: 34, lineHeight: 42, fontWeight: '800', textAlign: 'center' },
  headlineAccent: { color: GOLD },
  subtitle: { color: '#E6ECF5', fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 16 },

  content: { width: '100%', maxWidth: 1100 + 96, alignSelf: 'center', marginTop: 32 },
  cards: { gap: 16 },
  cardsRow: { flexDirection: 'row' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#EEF1F6',
  },
  cardDesktop: { flex: 1, flexDirection: 'column', alignItems: 'flex-start', padding: 24 },
  cardIcon: {
    width: 54, height: 54, borderRadius: 14, backgroundColor: '#FDF3DD',
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { color: NAVY, fontSize: 17, fontWeight: '700' },
  cardDesc: { color: '#5B6778', fontSize: 14, marginTop: 4, lineHeight: 20 },

  cta: { width: '100%', maxWidth: 420, alignSelf: 'center', alignItems: 'center', marginTop: 40, gap: 18 },
  button: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: GOLD, paddingVertical: 18, borderRadius: 16,
  },
  buttonText: { color: NAVY, fontSize: 17, fontWeight: '800' },
  signin: { color: '#5B6778', fontSize: 14 },
  signinLink: { color: NAVY, fontWeight: '800' },
});