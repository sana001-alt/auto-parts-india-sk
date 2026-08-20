import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Text, SegmentedButtons, Surface, Button, IconButton } from 'react-native-paper';
import {
  db,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from '../services/firebase';
import EditListingModal from '../components/EditListingModal';

export default function AdminScreen({ navigation }: any) {
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    const qListings = query(collection(db, 'spareParts'), orderBy('createdAt', 'desc'));
    const unsubListings = onSnapshot(qListings, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setListings(list);
      setLoading(false);
    });

    const qBanners = collection(db, 'banners');
    const unsubBanners = onSnapshot(qBanners, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setBanners(list);
    });

    const qUsers = collection(db, 'users');
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setUsers(list);
    });

    return () => {
      unsubListings();
      unsubBanners();
      unsubUsers();
    };
  }, []);

  const handleToggleApprove = async (item: any) => {
    try {
      const itemRef = doc(db, 'spareParts', item.id);
      const newStatus = item.approved === false ? true : false;
      await updateDoc(itemRef, {
        approved: newStatus,
        verified: newStatus,
        status: newStatus ? 'approved' : 'pending',
      });
      Alert.alert('Status Updated', `Listing is now ${newStatus ? 'Approved' : 'Pending'}`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update approval');
    }
  };

  const handleDeleteListing = (id: string, title: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${title}"? This action is permanent.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'spareParts', id));
              Alert.alert('Deleted', 'Listing removed from marketplace.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete listing.');
            }
          },
        },
      ]
    );
  };

  const handleToggleBanner = async (banner: any) => {
    try {
      const bannerRef = doc(db, 'banners', banner.id);
      const newActive = banner.active === false ? true : false;
      await updateDoc(bannerRef, {
        active: newActive,
        activeStatus: newActive,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update banner.');
    }
  };

  const renderListingCard = (item: any) => (
    <Surface key={item.id} style={styles.card} elevation={1}>
      <Image
        source={{
          uri:
            item.imageUrl ||
            'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300',
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.approved !== false ? '#DCFCE7' : '#FEF3C7' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.approved !== false ? '#166534' : '#92400E' },
              ]}
            >
              {item.approved !== false ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardPrice}>₹{item.price?.toLocaleString('en-IN')}</Text>
        <Text style={styles.cardSub}>
          {item.carBrand} {item.carModel} • {item.location || 'India'}
        </Text>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            compact
            onPress={() => handleToggleApprove(item)}
            style={styles.actionBtn}
            textColor={item.approved !== false ? '#D97706' : '#16A34A'}
          >
            {item.approved !== false ? 'Mark Pending' : 'Approve'}
          </Button>

          <Button
            mode="outlined"
            compact
            onPress={() => {
              setSelectedListing(item);
              setEditModalVisible(true);
            }}
            style={styles.actionBtn}
            textColor="#F97316"
          >
            Edit
          </Button>

          <Button
            mode="outlined"
            compact
            onPress={() => handleDeleteListing(item.id, item.title)}
            style={styles.actionBtn}
            textColor="#EF4444"
          >
            Delete
          </Button>
        </View>
      </View>
    </Surface>
  );

  const renderBannerCard = (banner: any) => (
    <Surface key={banner.id} style={styles.card} elevation={1}>
      <Image
        source={{
          uri:
            banner.imageUrl ||
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
        }}
        style={styles.bannerImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{banner.title || 'Promotional Banner'}</Text>
        <Text style={styles.cardSub}>Status: {banner.active !== false ? 'Active' : 'Inactive'}</Text>
        <Button
          mode="contained"
          buttonColor={banner.active !== false ? '#EF4444' : '#10B981'}
          onPress={() => handleToggleBanner(banner)}
          style={{ marginTop: 8, borderRadius: 8 }}
          compact
        >
          {banner.active !== false ? 'Deactivate Banner' : 'Activate Banner'}
        </Button>
      </View>
    </Surface>
  );

  const renderUserCard = (u: any) => (
    <Surface key={u.id} style={styles.userCard} elevation={1}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{u.name || u.displayName || 'Marketplace User'}</Text>
        <Text style={styles.userEmail}>{u.email}</Text>
        <Text style={styles.userRole}>Role: {u.role || 'buyer'}</Text>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.headerBanner}>
        <Text variant="headlineSmall" style={styles.title}>Admin Moderation</Text>
        <Text variant="bodySmall" style={styles.subtitle}>Manage marketplace listings, promotional banners & users</Text>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'listings', label: `Listings (${listings.length})` },
            { value: 'banners', label: `Banners (${banners.length})` },
            { value: 'users', label: `Users (${users.length})` },
          ]}
          style={styles.segmented}
        />
      </View>

      <View style={styles.content}>
        {tab === 'listings' && (
          listings.length === 0 ? (
            <Text style={styles.emptyText}>No listings found.</Text>
          ) : (
            listings.map(renderListingCard)
          )
        )}

        {tab === 'banners' && (
          banners.length === 0 ? (
            <Text style={styles.emptyText}>No promotional banners found.</Text>
          ) : (
            banners.map(renderBannerCard)
          )
        )}

        {tab === 'users' && (
          users.length === 0 ? (
            <Text style={styles.emptyText}>No registered users found.</Text>
          ) : (
            users.map(renderUserCard)
          )
        )}
      </View>

      {selectedListing && (
        <EditListingModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onSuccess={() => {
            setEditModalVisible(false);
            setSelectedListing(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBanner: {
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginTop: -16,
  },
  segmented: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
  },
  cardImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  bannerImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontWeight: 'bold',
    color: '#F97316',
    fontSize: 15,
    marginTop: 2,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#CBD5E1',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userInfo: {},
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    color: '#F97316',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 32,
    fontSize: 14,
  },
});
