import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import NoticeCard from '../components/NoticeCard';
import { fetchCampusNotices } from '../services/noticesApi';

const USER_ERROR_MESSAGE =
  'Unable to load notices. Check your connection and try again.';

export default function CampusNoticesScreen() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const latestNotices = await fetchCampusNotices();
      setNotices(latestNotices);
    } catch (requestError) {
      setNotices([]);
      setError(USER_ERROR_MESSAGE);
      console.error('Failed to fetch campus notices:', requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const renderNotice = ({ item }) => <NoticeCard notice={item} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>UJ</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>UJ Campus Notices</Text>
          <Text style={styles.subtitle}>Student Experience noticeboard</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color="#F28C00" size="large" />
          <Text style={styles.stateText}>Loading campus notices...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>Notices unavailable</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={loadNotices}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={notices}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View style={styles.listHeading}>
              <View>
                <Text style={styles.latestLabel}>LATEST UPDATES</Text>
                <Text style={styles.noticeCount}>{notices.length} notices</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={loadNotices}
              >
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>
          }
          renderItem={renderNotice}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F4F6F8',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#14213D',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 18,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginRight: 14,
  },
  headerText: {
    borderLeftColor: '#F28C00',
    borderLeftWidth: 2,
    paddingLeft: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    color: '#C8D0DA',
    fontSize: 13,
    marginTop: 3,
  },
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  stateText: {
    color: '#5C6670',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#1C252E',
    fontSize: 20,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#F28C00',
    borderRadius: 8,
    marginTop: 22,
    paddingHorizontal: 26,
    paddingVertical: 12,
  },
  retryButtonPressed: {
    opacity: 0.75,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 18,
  },
  listHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingTop: 22,
  },
  latestLabel: {
    color: '#14213D',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  noticeCount: {
    color: '#737D87',
    fontSize: 13,
    marginTop: 3,
  },
  refreshText: {
    color: '#C66F00',
    fontSize: 15,
    fontWeight: '700',
  },
});
