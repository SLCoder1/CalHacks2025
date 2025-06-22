import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = "https://hroezpgvorugvgpttrwj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyb2V6cGd2b3J1Z3ZncHR0cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjQ5NzUsImV4cCI6MjA2NjEwMDk3NX0.6QaLQQ8MW_jbn4LtiPoPhc8_hiJWY85j1T4w4TWh4jw"

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isBrowser ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// Only add AppState listener in browser environment
if (isBrowser) {
  // Tells Supabase Auth to continuously refresh the session automatically
  // if the app is in the foreground. When this is added, you will continue
  // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
  // `SIGNED_OUT` event if the user's session is terminated. This should
  // only be registered once.
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}