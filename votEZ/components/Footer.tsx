import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Information sourced from ballotopedia.org. Data is from 2022-2024, so varying information may be outdated.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#e0e8ef',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#555',
  },
});