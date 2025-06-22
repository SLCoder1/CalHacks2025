import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Proposition {
  id: string;
  title: string;
  description: string;
  simplifiedDescription: string;
  impact: string;
  state: string;
}

export default function PropositionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample propositions data - you can expand this
  const [propositionsData] = useState<Proposition[]>([
    {
      id: '1',
      title: 'Proposition 1',
      description: 'Constitutional amendment to protect reproductive freedom',
      simplifiedDescription: 'This proposition would add the right to abortion and contraception to the California Constitution.',
      impact: 'If passed, abortion and contraception would be protected rights in California, even if federal laws change.',
      state: 'California'
    },
    {
      id: '2',
      title: 'Proposition 2',
      description: 'Bond measure for climate change and clean energy',
      simplifiedDescription: 'This proposition would allow the state to borrow money to fund climate change programs and clean energy projects.',
      impact: 'If passed, California could borrow up to $10 billion for climate programs, which would be paid back with interest over time.',
      state: 'California'
    },
    {
      id: '3',
      title: 'Proposition A',
      description: 'Property tax relief for homeowners',
      simplifiedDescription: 'This proposition would reduce property taxes for homeowners by increasing the homestead exemption.',
      impact: 'If passed, homeowners would pay less in property taxes, but local governments might have less money for services.',
      state: 'Texas'
    },
    {
      id: '4',
      title: 'Proposal 1',
      description: 'Environmental bond act',
      simplifiedDescription: 'This proposal would allow the state to borrow money for environmental projects like clean water and climate change.',
      impact: 'If passed, New York could borrow up to $4.2 billion for environmental projects, paid back over time.',
      state: 'New York'
    },
    {
      id: '5',
      title: 'Amendment 1',
      description: 'Voting rights and election security',
      simplifiedDescription: 'This amendment would require voter ID and limit mail-in voting options.',
      impact: 'If passed, voters would need to show ID to vote and mail-in voting would be more restricted.',
      state: 'Florida'
    },
    {
      id: '6',
      title: 'Measure 110',
      description: 'Drug decriminalization and treatment',
      simplifiedDescription: 'This measure would decriminalize possession of small amounts of drugs and fund addiction treatment.',
      impact: 'If passed, drug possession would be treated as a health issue rather than a crime, with more funding for treatment programs.',
      state: 'Oregon'
    }
  ]);

  // Filter propositions based on search query
  const filteredPropositions = useMemo(() => {
    if (!searchQuery.trim()) {
      return propositionsData;
    }
    
    const query = searchQuery.toLowerCase();
    return propositionsData.filter(proposition => 
      proposition.title.toLowerCase().includes(query) ||
      proposition.description.toLowerCase().includes(query) ||
      proposition.simplifiedDescription.toLowerCase().includes(query) ||
      proposition.state.toLowerCase().includes(query)
    );
  }, [propositionsData, searchQuery]);

  const renderProposition = ({ item }: { item: Proposition }) => (
    <View style={styles.propositionCard}>
      <View style={styles.propositionHeader}>
        <ThemedText style={styles.propositionTitle}>{item.title}</ThemedText>
        <View style={styles.stateBadge}>
          <ThemedText style={styles.stateBadgeText}>{item.state}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.propositionDescription}>
        {item.simplifiedDescription}
      </ThemedText>
      <View style={styles.impactContainer}>
        <ThemedText style={styles.impactLabel}>Impact:</ThemedText>
        <ThemedText style={styles.impactText}>{item.impact}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Simplified Propositions</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search propositions, states, or topics..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsContainer}>
          <ThemedText style={styles.resultsText}>
            {filteredPropositions.length} result{filteredPropositions.length !== 1 ? 's' : ''} found
          </ThemedText>
        </View>
      )}

      {/* Propositions List */}
      <FlatList
        data={filteredPropositions}
        renderItem={renderProposition}
        keyExtractor={(item) => item.id}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>
              {searchQuery.length > 0 
                ? `No propositions found for "${searchQuery}"`
                : 'No propositions available at this time.'
              }
            </ThemedText>
            {searchQuery.length > 0 && (
              <ThemedText style={styles.emptyStateSubtext}>
                Try searching for a different term or state
              </ThemedText>
            )}
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  propositionCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  propositionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  propositionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  stateBadge: {
    backgroundColor: '#E3F2FD',
    padding: 4,
    borderRadius: 4,
  },
  stateBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  propositionDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  impactContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 