import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function PaymentSummaryScreen() {
  const params = useLocalSearchParams<{
    services?: string;
    totalCost?: string;
    eta?: string;
  }>();

  const services = params.services
    ? (JSON.parse(params.services as string) as string[])
    : [];
  const totalCost = params.totalCost ?? '';
  const eta = params.eta ?? '';

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Details' }} />

      <View style={styles.container}>
        <Text style={styles.title}>Payment Successful 🎉</Text>

        <Text style={styles.sectionTitle}>Services paid for:</Text>
        <FlatList
          data={services}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.serviceItem}>• {item}</Text>
          )}
        />

        <Text style={styles.label}>Total cost:</Text>
        <Text style={styles.value}>€{totalCost}</Text>

        <Text style={styles.label}>Estimated time of arrival:</Text>
        <Text style={styles.value}>{eta}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
});
