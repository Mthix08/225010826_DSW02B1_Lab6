import { StyleSheet, Text, View } from 'react-native';

export default function NoticeCard({ notice }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.category}>CAMPUS NOTICE</Text>
        <Text style={styles.identifier}>#{notice.id}</Text>
      </View>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.description}>{notice.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E5EA',
    borderLeftColor: '#F28C00',
    borderLeftWidth: 5,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    color: '#F28C00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  identifier: {
    color: '#68727D',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#1C252E',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  description: {
    color: '#56616C',
    fontSize: 15,
    lineHeight: 22,
  },
});
