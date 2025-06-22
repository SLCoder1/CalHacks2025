import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function TestScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Test Page' }} />
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="title">You are logged in!</ThemedText>
      </ThemedView>
    </>
  );
}