import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
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
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <ThemedText type="title" style={styles.title}>votEZ</ThemedText>
            <View style={styles.headerRight}>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Candidates</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Simplified Propositions</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <ThemedText style={styles.disclaimer}>
        </ThemedText>
      </View>
      <TouchableOpacity style={styles.floatingChatButton} onPress={() => console.log('Chat pressed')}>
        <ThemedText style={styles.floatingChatText}>?</ThemedText>
      </TouchableOpacity>
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
    height: 140,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 24,
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
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#007AFF',
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
  floatingChatButton: {
    position: 'absolute',
    bottom: 90,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingChatText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
