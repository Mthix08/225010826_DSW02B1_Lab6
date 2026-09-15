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
import {
  clearSavedNotices,
  getSavedNotices,
  saveNotices,
} from '../services/noticesStorage';

const USER_ERROR_MESSAGE =
  'Unable to load notices. Check your connection and try again.';

export default function CampusNoticesScreen() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isShowingSaved, setIsShowingSaved] = useState(false);
  const [hasSavedNotices, setHasSavedNotices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const requestLiveNotices = useCallback(async (hasSavedNotices = false) => {
    if (hasSavedNotices) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const latestNotices = await fetchCampusNotices();
      const refreshedAt = new Date().toISOString();

      setNotices(latestNotices);
      setLastUpdated(refreshedAt);
      setIsShowingSaved(false);

      try {
        await saveNotices(latestNotices, refreshedAt);
        setHasSavedNotices(true);
      } catch (storageError) {
        setHasSavedNotices(false);
        console.error('Failed to save notices:', storageError);
      }
    } catch (requestError) {
      if (hasSavedNotices) {
        setIsShowingSaved(true);
      } else {
        setNotices([]);
        setError(USER_ERROR_MESSAGE);
      }
      console.error('Failed to fetch campus notices:', requestError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    async function initialiseNotices() {
      let hasSavedNotices = false;

      try {
        const savedData = await getSavedNotices();
        hasSavedNotices = savedData.notices.length > 0;

        if (hasSavedNotices) {
          setNotices(savedData.notices);
          setLastUpdated(savedData.lastUpdated);
          setIsShowingSaved(true);
          setHasSavedNotices(true);
          setLoading(false);
        }
      } catch (storageError) {
        console.error('Failed to read saved notices:', storageError);
      }

      await requestLiveNotices(hasSavedNotices);
    }

    initialiseNotices();
  }, [requestLiveNotices]);

  const handleRefresh = () => requestLiveNotices(hasSavedNotices);

  const handleClearSavedNotices = async () => {
    try {
      await clearSavedNotices();
      setLastUpdated(null);
      setHasSavedNotices(false);

      if (isShowingSaved) {
        setNotices([]);
        setIsShowingSaved(false);
        setError(
          'Saved notices cleared. Connect to the internet and refresh to load notices.',
        );
      }
    } catch (storageError) {
      console.error('Failed to clear saved notices:', storageError);
    }
  };

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'time unavailable';

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
            onPress={handleRefresh}
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
            <View>
              <View
                style={[
                  styles.statusBanner,
                  isShowingSaved
                    ? styles.savedStatusBanner
                    : styles.liveStatusBanner,
                ]}
              >
                <Text
                  style={[
                    styles.statusBannerTitle,
                    isShowingSaved
                      ? styles.savedStatusText
                      : styles.liveStatusText,
                  ]}
                >
                  {isShowingSaved ? 'offline' : 'Live notices'}  Last
                  updated {formattedLastUpdated}
                </Text>
                {isShowingSaved && (
                  <Text style={styles.savedBannerText}>
                    Live notices are unavailable. This information may be out of date.
                  </Text>
                )}
              </View>
              <View style={styles.listHeading}>
                <View>
                  <Text style={styles.latestLabel}>
                    {isShowingSaved ? 'SAVED UPDATES' : 'LATEST UPDATES'}
                  </Text>
                  <Text style={styles.noticeCount}>
                    {notices.length} notices
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={refreshing}
                  hitSlop={10}
                  onPress={handleRefresh}
                >
                  <Text style={styles.refreshText}>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                onPress={handleClearSavedNotices}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.retryButtonPressed,
                ]}
              >
                <Text style={styles.clearButtonText}>Clear Saved Notices</Text>
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
  statusBanner: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  savedStatusBanner: {
    backgroundColor: '#FFF4E5',
    borderColor: '#F3C37A',
  },
  liveStatusBanner: {
    backgroundColor: '#EAF7EF',
    borderColor: '#9ED3AE',
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  savedStatusText: {
    color: '#8A4B00',
  },
  liveStatusText: {
    color: '#176B36',
  },
  savedBannerText: {
    color: '#72502A',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
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
  footer: {
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 8,
  },
  clearButton: {
    borderColor: '#A33A3A',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  clearButtonText: {
    color: '#A33A3A',
    fontSize: 14,
    fontWeight: '700',
  },
});
