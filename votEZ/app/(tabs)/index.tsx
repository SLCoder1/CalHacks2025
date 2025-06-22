import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePageContext } from '@/components/PageContext';

export default function HomeScreen() {
  const router = useRouter();
  const { setCurrentPageContent } = usePageContext();

  useEffect(() => {
    setCurrentPageContent({
      title: 'Home',
      type: 'home',
      content: `Welcome to votEZ - Your Voting Assistant

We help you understand elections with simple words, clear pictures, and voice guidance.
No reading needed — just tap, listen, and learn.

Available Features:
- Candidates: View and compare political candidates
- Simplified Propositions: Understand ballot measures in simple terms

Bias Disclaimer: We strive to present information as neutrally as possible. However, some bias may remain. Please use multiple sources to make your decisions.`,
    });

    return () => setCurrentPageContent(null);
  }, [setCurrentPageContent]);

  return (
    <ThemedView
      style={{ flex: 1 }}
      lightColor="#FFFFFF"
      darkColor="#FFFFFF"
    >
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/votEZ logo.png')}
            style={styles.logo}
          />

          {/* Introduction */}
          <View style={{ marginBottom: 32, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 16, color: '#0a7ea4', textAlign: 'center', fontWeight: '500' }}>
              We help you understand elections with simple words, clear pictures, and voice guidance.
              {"\n"}No reading needed — just tap, listen, and learn.
            </Text>
          </View>

          {/* Candidates Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/candidates')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/propositions')}
          >
            <ThemedText style={styles.buttonText}>Simplified Propositions</ThemedText>
          </TouchableOpacity>

          {/* Bias Disclaimer below "Simplified Propositions" */}
          <View
            style={{
              backgroundColor: 'white',
              marginTop: 8,
              padding: 10,
              borderRadius: 6,
              width: '90%',
            }}
          >
            <Text style={{ color: '#0a7ea4', fontSize: 14, textAlign: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>Bias Disclaimer:{"\n"}</Text>
              We strive to present information as neutrally as possible. However, some bias may remain. Please use multiple sources to make your decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <ThemedText style={styles.disclaimer}>
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    height: 160,
    width: 300,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    color: '#007AFF',
    textAlign: 'center',
    fontFamily: '',
    fontSize: 30,
  },
  button: {
    backgroundColor: '#7bb6e8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  disclaimer: {
    textAlign: 'center',
    color: 'grey',
  },
});
