import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const states = [
  { label: 'California', value: 'CA' },
  { label: 'Texas', value: 'TX' },
  { label: 'New York', value: 'NY' },
  { label: 'Florida', value: 'FL' },
  { label: 'Illinois', value: 'IL' },
  // ...add more states as needed
];

const candidates = {
  president: [
    {
      label: 'Alice Johnson',
      value: 'alice',
      agenda: 'Universal healthcare, climate action, education reform.',
      agendaDetail: 'Alice Johnson supports a single-payer healthcare system, aggressive carbon reduction targets, and increased federal funding for public schools and universities.',
    },
    {
      label: 'Bob Smith',
      value: 'bob',
      agenda: 'Tax cuts, infrastructure, national security.',
      agendaDetail: 'Bob Smith proposes broad tax reductions for individuals and businesses, a $1 trillion infrastructure plan, and increased defense spending for border and cyber security.',
    },
  ],
  'vice-president': [
    {
      label: 'Carol Lee',
      value: 'carol',
      agenda: 'Affordable housing, tech innovation, public safety.',
      agendaDetail: 'Carol Lee advocates for federal grants for affordable housing, investment in tech startups, and police reform for safer communities.',
    },
    {
      label: 'David Kim',
      value: 'david',
      agenda: 'Small business support, education, healthcare.',
      agendaDetail: 'David Kim supports tax credits for small businesses, STEM education initiatives, and expanding Medicaid coverage.',
    },
  ],
  governor: {
    CA: [
      {
        label: 'Eve Martinez',
        value: 'eve',
        agenda: 'Green energy, wildfire prevention, affordable housing.',
        agendaDetail: 'Eve Martinez plans to expand solar and wind energy, fund wildfire prevention programs, and increase affordable housing construction.',
      },
      {
        label: 'Frank Wu',
        value: 'frank',
        agenda: 'Water management, education, tech jobs.',
        agendaDetail: 'Frank Wu proposes new water conservation projects, increased teacher salaries, and incentives for tech companies to hire locally.',
      },
    ],
    TX: [
      {
        label: 'Grace Lin',
        value: 'grace',
        agenda: 'Border security, oil & gas, education.',
        agendaDetail: 'Grace Lin supports increased border patrol funding, deregulation for oil & gas, and school voucher programs.',
      },
      {
        label: 'Henry Ford',
        value: 'henry',
        agenda: 'Property tax reform, healthcare, infrastructure.',
        agendaDetail: 'Henry Ford proposes capping property taxes, expanding rural healthcare, and repairing state highways.',
      },
    ],
    NY: [
      {
        label: 'Ivy Chen',
        value: 'ivy',
        agenda: 'Public transit, affordable housing, climate action.',
        agendaDetail: 'Ivy Chen wants to modernize subways, fund affordable housing, and implement a state-wide carbon tax.',
      },
      {
        label: 'Jack Lee',
        value: 'jack',
        agenda: 'Crime reduction, business growth, education.',
        agendaDetail: 'Jack Lee supports community policing, tax incentives for businesses, and charter school expansion.',
      },
    ],
    FL: [
      {
        label: 'Karen White',
        value: 'karen',
        agenda: 'Hurricane preparedness, tourism, healthcare.',
        agendaDetail: 'Karen White will increase hurricane relief funds, promote tourism, and expand Medicaid.',
      },
      {
        label: 'Leo Brown',
        value: 'leo',
        agenda: 'Education, environment, public safety.',
        agendaDetail: 'Leo Brown supports teacher pay raises, Everglades restoration, and police training programs.',
      },
    ],
    IL: [
      {
        label: 'Mona Patel',
        value: 'mona',
        agenda: 'Gun safety, healthcare, jobs.',
        agendaDetail: 'Mona Patel supports universal background checks, Medicaid expansion, and job training programs.',
      },
      {
        label: 'Nate Green',
        value: 'nate',
        agenda: 'Tax reform, education, infrastructure.',
        agendaDetail: 'Nate Green proposes simplifying the tax code, increasing school funding, and repairing bridges and roads.',
      },
    ],
    // ...other states
  },
};

export default function CandidatesTab() {
  const [officeOpen, setOfficeOpen] = useState(false);
  const [office, setOffice] = useState<string | null>(null);

  const [stateOpen, setStateOpen] = useState(false);
  const [state, setState] = useState<string | null>(null);

  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // For individual candidate detail view
  const [selectedCandidate, setSelectedCandidate] = useState<null | { label: string; value: string; agenda?: string; agendaDetail?: string }>(null);

  // Effect to show comparison automatically when two are selected
  useEffect(() => {
    if (compareMode && compareSelection.length === 2) {
      setShowComparison(true);
      setCompareMode(false);
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

  // Candidate options
  let candidateOptions: { label: string; value: string; agenda?: string; agendaDetail?: string }[] = [];
  if (office === 'governor' && state && candidates.governor[state]) {
    candidateOptions = candidates.governor[state];
  } else if (office && office !== 'governor' && candidates[office]) {
    candidateOptions = candidates[office];
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

  // --- INDIVIDUAL CANDIDATE DETAIL VIEW ---
  if (selectedCandidate) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8fbff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.topButtonsRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackFromDetail}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>{selectedCandidate.label}</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCard}>
                <Text style={styles.cardAgenda}>{selectedCandidate.agendaDetail || selectedCandidate.agenda}</Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- COMPARISON VIEW ---
  if (showComparison && comparedCandidates.length === 2) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8fbff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.topButtonsRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackFromComparison}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>Comparison</Text>
            <View style={styles.comparisonRow}>
              {comparedCandidates.map((c) => (
                <View key={c.value} style={styles.comparisonCard}>
                  <Text style={styles.cardName}>{c.label}</Text>
                  <Text style={styles.cardAgenda}>{c.agendaDetail || c.agenda}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8fbff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.topButtonsRow}>
          {showCards && (
            <TouchableOpacity style={styles.backButton} onPress={handleBackFromCandidates}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}
          {showCards && !compareMode && !showComparison && (
            <TouchableOpacity style={styles.compareButton} onPress={() => setCompareMode(true)}>
              <Text style={styles.buttonText}>Compare</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>
        </View>
        {!office && (
          <>
            <Text style={styles.title}>Find a Candidate</Text>
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
              setValue={handleOfficeChange}
              placeholder="Select office"
              containerStyle={{ width: 260, marginBottom: 16 }}
              zIndex={3000}
            />
          </>
        )}

        {office === 'governor' && !state && (
          <>
            <Text style={styles.title}>Governor Race</Text>
            <Text style={styles.instructions}>Select the state for the governor race.</Text>
            <DropDownPicker
              open={stateOpen}
              value={state}
              items={states}
              setOpen={setStateOpen}
              setValue={handleStateChange}
              placeholder="Select state"
              searchable={true}
              containerStyle={{ width: 260, marginBottom: 16 }}
              zIndex={2000}
            />
          </>
        )}

        {showCards && !compareMode && !showComparison && (
          <>
            <Text style={styles.title}>Candidates</Text>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.cardsContainer}>
              {candidateOptions.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={styles.card}
                  onPress={() => setSelectedCandidate(c)}
                >
                  <Text style={styles.cardName}>{c.label}</Text>
                  <Text style={styles.cardAgenda}>{c.agenda}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {showCards && compareMode && !showComparison && (
          <>
            <Text style={styles.title}>Select 2 Candidates to Compare</Text>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.cardsContainer}>
              {candidateOptions.map((c) => {
                const checked = compareSelection.includes(c.value);
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.card,
                      checked && styles.cardChecked,
                      compareSelection.length === 2 && !checked && styles.cardDisabled,
                    ]}
                    onPress={() => toggleCompare(c.value)}
                    disabled={compareSelection.length === 2 && !checked}
                  >
                    <View style={styles.cardRow}>
                      <Text style={styles.cardName}>{c.label}</Text>
                      {checked && <Text style={styles.checkmark}>✔️</Text>}
                    </View>
                    <Text style={styles.cardAgenda}>{c.agenda}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 56, backgroundColor: '#f8fbff' },
  title: { fontSize: 22, marginBottom: 12, color: '#0a7ea4', fontWeight: 'bold' },
  instructions: { fontSize: 16, color: '#0a7ea4', marginBottom: 24, textAlign: 'center' },
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
    backgroundColor: '#7bb6e8',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginRight: 8,
  },
  backButton: {
    backgroundColor: '#b3b3b3',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginRight: 8,
  },
  restartButton: {
    backgroundColor: '#e67c73',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardsContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#e6f2fb',
    borderRadius: 10,
    padding: 18,
    marginVertical: 10,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardChecked: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
    backgroundColor: '#d0eafd',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: { fontWeight: 'bold', fontSize: 18, color: '#0a7ea4', marginBottom: 8 },
  cardAgenda: { color: '#0a7ea4', fontSize: 15 },
  checkmark: { fontSize: 20, color: '#0a7ea4', marginLeft: 8 },
  comparisonContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  comparisonTitle: {
    fontWeight: 'bold',
    color: '#0a7ea4',
    fontSize: 18,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  comparisonCard: {
    backgroundColor: '#e6f2fb',
    borderRadius: 10,
    padding: 18,
    width: 150,
    minHeight: 120,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#7bb6e8',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 18,
  },
});