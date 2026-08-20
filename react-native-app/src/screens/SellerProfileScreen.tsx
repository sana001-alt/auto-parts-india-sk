import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, Card, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { 
  auth, 
  db, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from '../services/firebase';

export default function SellerProfileScreen({ route, navigation }: any) {
  const { seller, sellerId: paramSellerId, sellerName: paramSellerName } = route.params || {};
  const sellerId = seller?.id || paramSellerId;
  const sellerName = seller?.name || paramSellerName || 'Automotive Seller';
  const sellerPhoto = seller?.photoURL || seller?.profilePhoto || null;
  const sellerLocation = seller?.location || seller?.district || 'India';

  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === sellerId;

  useEffect(() => {
    if (!sellerId) return;

    let isMounted = true;
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'spareParts'),
          where('sellerId', '==', sellerId)
        );
        const snap = await getDocs(q);
        const items: any[] = [];
        snap.forEach(d => {
          items.push({ id: d.id, ...d.data() });
        });

        const followersQ = query(collection(db, 'follows'), where('followingId', '==', sellerId));
        const followingQ = query(collection(db, 'follows'), where('followerId', '==', sellerId));
        const [followersSnap, followingSnap] = await Promise.all([
          getDocs(followersQ),
          getDocs(followingQ)
        ]);

        let followingStatus = false;
        if (currentUser?.uid && currentUser.uid !== sellerId) {
          const followDoc = await getDoc(doc(db, 'follows', `${currentUser.uid}_${sellerId}`));
          followingStatus = followDoc.exists();
        }

        if (isMounted) {
          setActiveListings(items.filter(it => !it.sold));
          setFollowersCount(followersSnap.size);
          setFollowingCount(followingSnap.size);
          setIsFollowing(followingStatus);
        }
      } catch (err) {
        console.warn('Error fetching seller profile in RN:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSellerData();

    return () => {
      isMounted = false;
    };
  }, [sellerId, currentUser?.uid]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to follow this seller.');
      return;
    }
    if (isOwnProfile) return;

    setFollowLoading(true);
    const followId = `${currentUser.uid}_${sellerId}`;
    try {
      if (isFollowing) {
        await deleteDoc(doc(db, 'follows', followId));
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(doc(db, 'follows', followId), {
          id: followId,
          followerId: currentUser.uid,
          followingId: sellerId,
          followerName: currentUser.displayName || 'Buyer',
          createdAt: Date.now(),
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to message this seller.');
      return;
    }
    const samplePart = activeListings[0] || {
      id: 'general',
      title: 'Direct Seller Inquiry',
      price: 0,
      imageUrl: '',
      sellerId: sellerId,
      sellerName: sellerName,
    };
    const chatId = `${samplePart.id}_${currentUser.uid}_${sellerId}`;
    navigation.navigate('ChatRoom', { chatId, part: samplePart });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.profileRow}>
          <Image 
            source={{ uri: sellerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge" style={styles.sellerName}>{sellerName}</Text>
            <Text variant="bodySmall" style={styles.locationText}>📍 {sellerLocation} • Verified Vendor</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{activeListings.length}</Text>
                <Text style={styles.statLabel}>Active Parts</Text>
              </View>
            </View>
          </View>
        </View>

        {!isOwnProfile && (
          <View style={styles.headerActionRow}>
            <Button
              mode={isFollowing ? 'outlined' : 'contained'}
              buttonColor={isFollowing ? undefined : '#F97316'}
              textColor={isFollowing ? '#F97316' : '#FFFFFF'}
              onPress={handleToggleFollow}
              loading={followLoading}
              style={[styles.headerBtn, isFollowing && { borderColor: '#F97316' }]}
            >
              {isFollowing ? 'Following' : 'Follow Seller'}
            </Button>
            <Button
              mode="contained"
              buttonColor="#0F172A"
              textColor="#FFFFFF"
              icon="message-text"
              onPress={handleStartChat}
              style={styles.headerBtn}
            >
              Message
            </Button>
          </View>
        )}
      </Surface>

      <View style={styles.listingsSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Seller Listings ({activeListings.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : activeListings.length === 0 ? (
          <Text style={styles.emptyText}>No active spare parts listed by this seller right now.</Text>
        ) : (
          activeListings.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => navigation.navigate('ProductDetail', { part: item })}
              activeOpacity={0.9}
            >
              <Card style={styles.productCard} elevation={1}>
                <Card.Cover source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' }} style={styles.productImage} />
                <Card.Content style={{ padding: 12 }}>
                  <Text variant="titleMedium" style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                  <Text variant="titleMedium" style={styles.productPrice}>₹{item.price?.toLocaleString('en-IN')}</Text>
                  <Text variant="bodySmall" style={styles.productSub}>{item.carBrand} {item.carModel} • {item.condition || 'Used'}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F97316',
    backgroundColor: '#334155',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  sellerName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationText: {
    color: '#94A3B8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statNum: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  headerBtn: {
    flex: 1,
    borderRadius: 10,
  },
  listingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productImage: {
    height: 160,
  },
  productTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  productPrice: {
    color: '#F97316',
    fontWeight: 'bold',
    marginTop: 2,
  },
  productSub: {
    color: '#64748B',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 24,
  },
});
