import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import governors from '../../data/Governers - Sheet1.json';

const PRIMARY_COLOR = '#0a7ea4'; // Used for text and some buttons
const SECONDARY_COLOR = '#7bb6e8'; // Used for main buttons
const DANGER_COLOR = '#e67c73'; // Used for restart
const GRAY_COLOR = '#b3b3b3'; // Used for back
const CARD_BG = '#f8fbff'; // Used for card backgrounds

export default function CandidatesTab() {
  const router = useRouter();
  const [officeOpen, setOfficeOpen] = useState(false);
  const [office, setOffice] = useState<string | null>(null);

  const [stateOpen, setStateOpen] = useState(false);
  const [state, setState] = useState<string | null>(null);

  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // For individual candidate detail view
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Load unique states from the JSON for governor dropdown only
  const [states, setStates] = useState<{ label: string; value: string }[]>([]);

  // Returns the full candidate data object for a given candidate name
  const getCandidateByName = (name: string) =>
    candidateOptions.find((c) => c.label === name);

  useEffect(() => {
    // Get unique states from the JSON
    const uniqueStates = Array.from(
      new Set(governors.map((row: any) => row.State && row.State.trim()).filter(Boolean))
    );
    setStates(uniqueStates.map((state: string) => ({
      label: state,
      value: state,
    })));
  }, []);

  // Effect to show comparison automatically when two are selected
  useEffect(() => {
    if (compareMode && compareSelection.length === 2) {
      setShowComparison(true);
      //setCompareMode(false);
    } else if (compareSelection.length < 2) {
      setShowComparison(false);
    }
  }, [compareSelection, compareMode]);

  // Restart logic
  const handleRestart = () => {
    setOffice(null);
    setState(null);
    setOfficeOpen(false);
    setStateOpen(false);
    setCompareMode(false);
    setCompareSelection([]);
    setShowComparison(false);
    setSelectedCandidate(null);
  };

  // When changing office, reset compare/comparison
  const handleOfficeChange = (val: string | null) => {
    setOffice(val);
    setState(null);
    setCompareMode(false);
    setCompareSelection([]);
    setShowComparison(false);
    setSelectedCandidate(null);
  };

  // When changing state, reset compare/comparison
  const handleStateChange = (val: string | null) => {
    setState(val);
    setCompareMode(false);
    setCompareSelection([]);
    setShowComparison(false);
    setSelectedCandidate(null);
  };

  // Back from comparison to candidate cards
  const handleBackFromComparison = () => {
    setShowComparison(false);
    setCompareSelection([]);
    setCompareMode(true);
  };

  // Back from candidate selection to office/state selection
  const handleBackFromCandidates = () => {
    if (office === 'governor') {
      setState(null);
    } else {
      setOffice(null);
    }
    setCompareMode(false);
    setCompareSelection([]);
    setShowComparison(false);
    setSelectedCandidate(null);
  };

  // Back from individual candidate detail to candidate list
  const handleBackFromDetail = () => {
    setSelectedCandidate(null);
  };

  // Candidate options logic
  let candidateOptions: { label: string; value: string; fullData?: any }[] = [];
  if (office === 'governor' && state) {
    // Filter governors.json for selected state and sort by name
    candidateOptions = governors
      .filter((row: any) => row.State && row.State.trim() === state)
      .sort((a: any, b: any) => (a.Candidate || '').localeCompare(b.Candidate || ''))
      .map((row: any) => ({
        label: row.Candidate,
        value: row.Candidate,
        fullData: row, // Pass all data for detail page
      }));
  }

  // Show candidate cards if office is selected and (if governor) state is selected
  const showCards =
    (office === 'governor' && state && candidateOptions.length > 0) ||
    ((office === 'president' || office === 'vice-president') && candidateOptions.length > 0);

  // Handle compare selection
  const toggleCompare = (value: string) => {
    if (compareSelection.includes(value)) {
      setCompareSelection(compareSelection.filter((v) => v !== value));
    } else if (compareSelection.length < 2) {
      setCompareSelection([...compareSelection, value]);
    }
  };

  // Get selected candidates for comparison
  const comparedCandidates = candidateOptions.filter((c) => compareSelection.includes(c.value));

  // Candidate detail view (centered, split by section)
  if (selectedCandidate && selectedCandidate.fullData) {
    const c = selectedCandidate.fullData;

    // Parse description into sections with titles and content
    function parseDescriptionSections(description: string) {
      // This regex matches **Section Title:** followed by content (including newlines), until the next ** or end of string
      const regex = /\*\*(.*?)\*\*([\s\S]*?)(?=\*\*|$)/g;
      const sections: { title: string; content: string }[] = [];
      let match;
      while ((match = regex.exec(description)) !== null) {
        const title = match[1].replace(':', '').trim();
        const content = match[2].replace(/^\s*[:\-]?\s*/, '').trim();
        if (title || content) {
          sections.push({ title, content });
        }
      }
      return sections;
    }

    // Usage in your component:
    const descriptionSections = c.Description ? parseDescriptionSections(c.Description) : [];

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8fbff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.topButtonsRow}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.arrowButton} onPress={() => setSelectedCandidate(null)}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailName}>{c.Candidate}</Text>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}></Text>
              {c.Description && c.Description.trim() !== '' ? (
                c.Description.includes('**') ? (
                  descriptionSections.length > 0 ? (
                    descriptionSections.map((section, idx) => (
                      <View key={idx} style={{ marginTop: idx === 0 ? 0 : 12 }}>
                        {section.title ? (
                          <Text style={[styles.detailSectionTitle, { fontSize: 15, textAlign: 'left' }]}>{section.title}</Text>
                        ) : null}
                        <Text style={[styles.detailSectionText, { textAlign: 'left' }]}>{section.content}</Text>
                      </View>
                    ))
                  ) : null
                ) : (
                  <Text style={[styles.detailSectionText, { textAlign: 'left' }]}>{c.Description}</Text>
                )
              ) : null}
            </View>
            {c.Agenda ? (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Agenda</Text>
                <Text style={styles.detailSectionText}>{c.Agenda}</Text>
              </View>
            ) : null}
            {c.AgendaDetail ? (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Details</Text>
                <Text style={styles.detailSectionText}>{c.AgendaDetail}</Text>
              </View>
            ) : null}
            {/* Add more sections as needed */}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Comparison view
  console.log(compareSelection);
  console.log(compareMode);
  if (compareMode && compareSelection.length === 2) {
    const [cand1, cand2] = compareSelection.map(getCandidateByName);
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8fbff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.topButtonsRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={() => {
              setCompareMode(false);
              setCompareSelection([]);
            }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.title, { flex: 1, textAlign: 'center' }]}>Compare Candidates</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.comparisonRow}>
            {compareSelection.map((selectedName, idx) => {
              const cand = candidateOptions.find(c => c.label === selectedName)?.fullData;

              // Parse description for THIS candidate only
              let descriptionSections: { title?: string; content: string }[] = [];
              if (cand?.Description && cand.Description.includes('**')) {
                const parts = cand.Description.split('**');
                if (parts[0].trim()) {
                  descriptionSections.push({ content: parts[0].trim() });
                }
                for (let i = 1; i < parts.length; i += 2) {
                  const title = parts[i]?.replace(/:$/, '').trim();
                  const content = parts[i + 1]?.trim();
                  if (title && content) {
                    descriptionSections.push({ title, content });
                  } else if (title && !content) {
                    descriptionSections.push({ title, content: '' });
                  }
                }
              } else if (cand?.Description) {
                descriptionSections.push({ content: cand.Description.trim() });
              }

              return (
                <View style={styles.comparisonCol} key={cand?.Candidate || idx}>
                  <Text
                    style={[
                      styles.detailName,
                      { textAlign: 'center', alignSelf: 'center', width: '100%' }
                    ]}
                  >
                    {cand?.Candidate}
                  </Text>
                  {cand?.Description && cand.Description.trim() !== '' ? (
                    cand.Description.includes('**') && descriptionSections.length > 0 ? (
                      descriptionSections.map((section, i) => (
                        <View key={i} style={styles.detailSection}>
                          {section.title ? (
                            <Text style={[styles.detailSectionTitle, { fontSize: 15, textAlign: 'left' }]}>{section.title}</Text>
                          ) : null}
                          <Text style={[styles.detailSectionText, { textAlign: 'left' }]}>{section.content}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.detailSectionText, { textAlign: 'left' }]}>{cand.Description}</Text>
                    )
                  ) : (
                    <Text style={[styles.detailSectionText, { textAlign: 'left' }]}>No description available.</Text>
                  )}
                  {cand?.Agenda ? (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Agenda</Text>
                      <Text style={styles.detailSectionText}>{cand.Agenda}</Text>
                    </View>
                  ) : null}
                  {cand?.AgendaDetail ? (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Details</Text>
                      <Text style={styles.detailSectionText}>{cand.AgendaDetail}</Text>
                    </View>
                  ) : null}
                  {/* Add more sections as needed */}
                </View>
              );
            })}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: CARD_BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Back button to home page */}
        {!office && (
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 8, height: 40, paddingLeft: 16 }}>
            <TouchableOpacity
              style={[styles.arrowButton, { position: 'relative', left: 0, top: 0 }]}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 40 }}>
              <Text style={styles.title}>Find a Candidate</Text>
            </View>
          </View>
        )}

        {/* Office dropdown */}
        {!office && (
          <>
            <Text style={styles.instructions}>Select the office you want to explore.</Text>
            <DropDownPicker
              open={officeOpen}
              value={office}
              items={[
                { label: 'President', value: 'president' },
                { label: 'Vice President', value: 'vice-president' },
                { label: 'Governor', value: 'governor' },
              ]}
              setOpen={setOfficeOpen}
              setValue={setOffice}
              placeholder="Select office"
              containerStyle={{ width: 260, marginBottom: 16 }}
              zIndex={3000}
            />
          </>
        )}

        {/* State dropdown for governor */}
        {office === 'governor' && !state && (
          <>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                height: 40,
                position: 'relative',
                paddingLeft: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.arrowButton, { position: 'relative', left: 0, top: 0 }]}
                onPress={() => setOffice(null)}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 40 }}>
                <Text style={styles.title}>Governor Race</Text>
              </View>
            </View>
            <Text style={styles.instructions}>Select the state for the governor race.</Text>
            <DropDownPicker
              open={stateOpen}
              value={state}
              items={states}
              setOpen={setStateOpen}
              setValue={setState}
              placeholder="Select state"
              searchable={true}
              containerStyle={{ width: 260, marginBottom: 16 }}
              zIndex={2000}
            />
          </>
        )}

        {/* Candidate cards for selected state */}
        {office === 'governor' && state && (
          <>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                height: 40,
                paddingLeft: 16,
                position: 'relative',
              }}
            >
              <TouchableOpacity
                style={[styles.arrowButton, { position: 'relative', left: 0, top: 0 }]}
                onPress={() => setState(null)}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 40 }}>
                <Text style={styles.title}>Candidates</Text>
              </View>
              {/* Compare button in top right corner */}
              <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor: '#0a7ea4', marginRight: 16 }]}
                onPress={() => {
                  setCompareMode(true);
                  setCompareSelection([]);
                }}
              >
                <Ionicons name="git-compare-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.cardsContainer}>
              {candidateOptions.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={styles.card}
                  onPress={() => {
                    if (compareMode) {
                      // Only allow up to 2 selections, do not exit compareMode automatically
                      if (
                        compareSelection.includes(c.label) ||
                        compareSelection.length < 2
                      ) {
                        toggleCompare(c.label);
                      }
                    } else {
                      setSelectedCandidate(c);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardName}>{c.label}</Text>
                  {/* Show checkmark if in compare mode and selected */}
                  {compareMode && (
                    <Ionicons
                      name={compareSelection.includes(c.label) ? "checkbox" : "square-outline"}
                      size={22}
                      color="#0a7ea4"
                      style={{ position: 'absolute', right: 16, top: 16 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Show compare instructions if in compare mode */}
            {compareMode && (
              <Text style={{ color: '#0a7ea4', textAlign: 'center', marginTop: 8 }}>
                Select two candidates to compare.
              </Text>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 56, backgroundColor: CARD_BG },
  title: { fontSize: 22, marginBottom: 12, color: PRIMARY_COLOR, fontWeight: 'bold' },
  instructions: { fontSize: 16, color: PRIMARY_COLOR, marginBottom: 24, textAlign: 'center' },
  topButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
    gap: 12,
  },
  compareButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  arrowButton: {
    backgroundColor: '#b3b3b3',
    padding: 10,
    borderRadius: 50,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  restartButton: {
    backgroundColor: '#7bb6e8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardsContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginVertical: 10,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
  },
  cardChecked: {
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: SECONDARY_COLOR,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: { fontWeight: 'bold', fontSize: 18, color: PRIMARY_COLOR, marginBottom: 8 },
  cardAgenda: { color: PRIMARY_COLOR, fontSize: 15 },
  checkmark: { fontSize: 20, color: PRIMARY_COLOR, marginLeft: 8 },
  comparisonContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  comparisonTitle: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    fontSize: 18,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  comparisonCol: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 8,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#7bb6e8',
    minHeight: 380,
    maxWidth: 760, // Make the comparison box narrower
    width: '90%',  // Ensures it doesn't stretch too much
    alignSelf: 'center',
  },
  comparisonName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: PRIMARY_COLOR,
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonSectionTitle: {
    fontWeight: 'bold',
    color: '#0a7ea4',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  comparisonSectionText: {
    color: '#0a7ea4',
    fontSize: 15,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 18,
  },
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 32,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 18,
    textAlign: 'center',
  },
  detailSection: {
    width: '100%',
    marginBottom: 18,
  },
  detailSectionTitle: {
    fontWeight: 'bold',
    color: '#0a7ea4',
    fontSize: 16,
    marginBottom: 4,
  },
  detailSectionText: {
    color: '#0a7ea4',
    fontSize: 15,
    textAlign: 'left',
  },
});

