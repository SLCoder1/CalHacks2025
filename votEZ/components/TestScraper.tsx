import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function TestScraper() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const testScrape = async () => {
    console.log('TestScraper: Button pressed, starting fetch...');
    setLoading(true);
    setError(null);
    setCandidates([]);
    setDescriptions([]);
    setOpenIndexes([]);
    try {
      const response = await fetch('http://localhost:3001/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'Hawaii', position: 'Governor' }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCandidates(data.candidates || []);
        setDescriptions(data.descriptions || []);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const toggleDropdown = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Separate candidates with and without descriptions
  const candidatesWithDesc: { candidate: string; desc: string; idx: number }[] = [];
  const candidatesNoDesc: { candidate: string; desc: string; idx: number }[] = [];
  candidates.forEach((candidate, idx) => {
    const desc = descriptions[idx];
    if (desc?.toLowerCase().includes('description not found')) {
      candidatesNoDesc.push({ candidate, desc, idx });
    } else {
      candidatesWithDesc.push({ candidate, desc, idx });
    }
  });

  return (
    <View style={{ flex: 1, margin: 20 }}>
      <Button title="Test Scraper" onPress={testScrape} />
      {loading && <ActivityIndicator />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <ScrollView style={{ marginTop: 16 }} contentContainerStyle={styles.scrollContent}>
        {/* Candidates with descriptions (dropdowns) */}
        {candidatesWithDesc.map(({ candidate, desc, idx }) => (
          <View key={idx} style={styles.candidateContainer}>
            <TouchableOpacity onPress={() => toggleDropdown(idx)} style={styles.dropdownHeader}>
              <Text style={styles.candidateName}>
                {candidate}
              </Text>
              <Text style={styles.arrow}>
                {openIndexes.includes(idx) ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {openIndexes.includes(idx) && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {desc}
                </Text>
              </View>
            )}
          </View>
        ))}
        {/* Candidates with "Description Not Found" */}
        {candidatesNoDesc.map(({ candidate, desc, idx }) => (
          <View key={idx} style={styles.candidateContainer}>
            <View style={[styles.dropdownHeader, { backgroundColor: '#fff' }]}>
              <Text style={styles.candidateName}>{candidate}</Text>
              <Text style={[styles.notFoundText]}>Description Not Found</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  candidateContainer: {
    marginVertical: 8,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    padding: 0,
    elevation: 2,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e0e8ef',
  },
  candidateName: {
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  arrow: {
    fontSize: 18,
    marginLeft: 8,
  },
  descriptionBox: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#222',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  notFoundText: {
    color: '#b00',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});