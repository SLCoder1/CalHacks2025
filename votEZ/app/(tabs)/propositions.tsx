import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// If you have ThemedText and ThemedView, import them. Otherwise, use Text and View.
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePageContext } from '@/components/PageContext';
import DropDownPicker from 'react-native-dropdown-picker';
import propositions from '../../data/Propositions 2024 - Sheet1.json';

interface Proposition {
  State: string;
  Proposition: string;
  Description: string;
}

export default function PropositionsScreen() {
  const router = useRouter();
  const { setCurrentPageContent } = usePageContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateOpen, setStateOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Get unique states from the JSON file
  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(
      new Set(propositions.map((row: any) => row.State && row.State.trim()).filter(Boolean))
    );
    return uniqueStates.map((state: string) => ({
      label: state,
      value: state,
    }));
  }, []);

  // Filter propositions for the selected state and search query
  const filteredPropositions = useMemo(() => {
    let filtered = propositions;
    if (selectedState) {
      filtered = filtered.filter((row: any) => row.State && row.State.trim() === selectedState);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((proposition: any) =>
        (proposition.Proposition && proposition.Proposition.toLowerCase().includes(query)) ||
        (proposition.Description && proposition.Description.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [selectedState, searchQuery]);

  // Update page content when search query or filtered propositions change
  useEffect(() => {
    let content = 'Simplified Propositions Page\n\n';
    
    if (searchQuery) {
      content += `Search Query: "${searchQuery}"\n`;
      content += `Found ${filteredPropositions.length} result${filteredPropositions.length !== 1 ? 's' : ''}\n\n`;
    }
    
    if (filteredPropositions.length > 0) {
      content += 'Available Propositions:\n';
      filteredPropositions.forEach(proposition => {
        content += `\n${proposition.title} (${proposition.state})\n`;
        content += `Description: ${proposition.simplifiedDescription}\n`;
        content += `Impact: ${proposition.impact}\n`;
      });
    } else {
      content += 'No propositions found matching your search.';
    }

    setCurrentPageContent({
      title: 'Simplified Propositions',
      type: 'propositions',
      content: content,
      metadata: {
        searchQuery: searchQuery,
        totalResults: filteredPropositions.length,
        states: [...new Set(filteredPropositions.map(p => p.state))],
      }
    });

    return () => setCurrentPageContent(null);
  }, [searchQuery, filteredPropositions, setCurrentPageContent]);

  const renderProposition = ({ item }: { item: Proposition }) => (
    <View style={styles.propositionCard}>
      <View style={styles.propositionHeader}>
        <ThemedText style={styles.propositionTitle}>{item.Proposition}</ThemedText>
        <View style={styles.stateBadge}>
          <ThemedText style={styles.stateBadgeText}>{item.State}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.propositionDescription}>
        {item.Description}
      </ThemedText>
    </View>
  );

  // If no state selected, show only state picker
  if (!selectedState) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomWidth: 0 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Simplified Propositions</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.instructions}>Select your state to view 2024 ballot propositions.</Text>
        <DropDownPicker
          open={stateOpen}
          value={selectedState}
          items={stateOptions}
          setOpen={setStateOpen}
          setValue={setSelectedState}
          placeholder="Select state"
          searchable={true}
          containerStyle={{ width: 260, marginBottom: 16, alignSelf: 'center' }}
          zIndex={2000}
        />
      </ThemedView>
    );
  }

  // After state is selected, show search and proposition UI
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedState(null)}
        >
          <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{selectedState} Propositions</ThemedText>
        <View style={styles.placeholder} />
      </View>
      {/* Thin line above search bar */}
      <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }} />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search propositions or topics..."
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
        keyExtractor={(_, idx) => idx.toString()}
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
                Try searching for a different term
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
    // REMOVE or comment out the next two lines to remove the thin horizontal line:
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
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
  instructions: { fontSize: 16, color: '#0a7ea4', marginBottom: 24, textAlign: 'center' },
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