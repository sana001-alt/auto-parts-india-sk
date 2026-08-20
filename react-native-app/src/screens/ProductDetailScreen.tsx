import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, Linking, Alert, Share, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, Card, Divider, Chip, IconButton, Surface } from 'react-native-paper';
import GMap from '../components/GMap';
import { EditListingModal } from '../components/EditListingModal';
import { doc, deleteDoc, db, onSnapshot, setDoc } from '../services/firebase';

export default function ProductDetailScreen({ route, navigation, user }: any) {
  const { part: initialPart } = route.params || {};
  const [part, setPart] = useState<any>(initialPart);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialPart?.id) {
      setPart(initialPart);
      const unsub = onSnapshot(doc(db, 'spareParts', initialPart.id), (docSnap) => {
        if (docSnap.exists()) {
          setPart({ id: docSnap.id, ...docSnap.data() });
        }
      }, (err) => {
        console.warn('[ProductDetailScreen] Realtime sync error:', err);
      });
      return () => unsub();
    }
  }, [initialPart?.id]);

  if (!part) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={{ color: '#0F172A', fontWeight: 'bold' }}>Spare part details not available.</Text>
        <Button mode="contained" buttonColor="#F97316" onPress={() => navigation.goBack()} style={{ marginTop: 16, borderRadius: 10 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const currentUserId = user?.uid || user?.id || null;
  const listingOwnerId = part.ownerId || part.sellerId || part.userId || null;
  const isOwner = Boolean(currentUserId && listingOwnerId && String(currentUserId) === String(listingOwnerId));

  const handleCall = () => {
    if (part.contactPhone) {
      Linking.openURL(`tel:${part.contactPhone}`);
    } else {
      Alert.alert('Contact', 'Phone number not listed for this seller.');
    }
  };

  const handleChat = async () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    const currentUid = user.uid || user.id;
    const sellerUid = part.sellerId || part.userId || part.ownerId || 'seller';
    const chatId = `${part.id}_${currentUid}_${sellerUid}`;
    
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(chatDocRef, {
        id: chatId,
        partId: part.id,
        partTitle: part.title || 'Spare Part',
        partImageUrl: part.imageUrl || '',
        partPrice: part.price || 0,
        buyerId: currentUid,
        buyerName: user.displayName || user.name || user.email || 'Buyer',
        sellerId: sellerUid,
        sellerName: part.contactName || part.sellerName || 'Seller',
        participants: [currentUid, sellerUid],
        lastMessageText: '',
        lastMessageAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('[ProductDetailScreen] Pre-creating chat doc:', e);
    }

    navigation.navigate('ChatRoom', { chatId, part });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: part.title,
        message: `Check out this spare part on Auto Parts India: ${part.title} for ₹${part.price?.toLocaleString('en-IN')}`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to permanently delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              if (part.id) {
                await deleteDoc(doc(db, 'spareParts', part.id));
              }
              Alert.alert('Listing Deleted', 'Your spare part listing has been permanently deleted.');
              navigation.goBack();
            } catch (err: any) {
              console.warn('[ProductDetailScreen] Delete error:', err);
              Alert.alert('Error', err.message || 'Failed to delete listing. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.imageHeader}>
        <Image 
          source={{ uri: part.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800' }} 
          style={styles.image} 
        />
        <TouchableOpacity style={styles.shareFab} onPress={handleShare} activeOpacity={0.8}>
          <IconButton icon="share-variant" iconColor="#0F172A" size={20} style={{ margin: 0 }} />
        </TouchableOpacity>
      </View>

      <Surface style={styles.contentCard} elevation={2}>
        <View style={styles.titleRow}>
          <Text variant="headlineSmall" style={styles.title}>{part.title}</Text>
          <Chip compact style={styles.conditionChip} textStyle={{ fontSize: 11, color: '#F97316', fontWeight: 'bold' }}>
            {part.condition || 'Used'}
          </Chip>
        </View>

        <Text variant="headlineMedium" style={styles.price}>₹{part.price?.toLocaleString('en-IN')}</Text>

        <View style={styles.badgeRow}>
          <Chip icon="car" style={styles.chip}>{part.carBrand} {part.carModel}</Chip>
          <Chip icon="shape" style={styles.chip}>{part.category}</Chip>
          <Chip icon="map-marker" style={styles.chip}>{part.location || 'India'}</Chip>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>Part Specifications</Text>
        <View style={styles.specGrid}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Brand</Text>
            <Text style={styles.specVal}>{part.carBrand || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Model</Text>
            <Text style={styles.specVal}>{part.carModel || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Condition</Text>
            <Text style={styles.specVal}>{part.condition || 'Used'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Part No.</Text>
            <Text style={styles.specVal}>{part.partNumber || 'Original OEM'}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
        <Text variant="bodyMedium" style={styles.description}>
          {part.description || 'Verified auto part available for immediate purchase or pickup. Contact seller for fitment details and compatibility.'}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>Seller Location</Text>
        <View style={styles.mapContainer}>
          <GMap
            latitude={part.latitude || part.lat || 19.0760}
            longitude={part.longitude || part.lng || 72.8777}
            title={`${part.title} - ${part.location || 'India'}`}
            interactive={false}
            style={{ height: 180, borderRadius: 12 }}
          />
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>Seller Information</Text>
        <Card style={styles.sellerCard} elevation={1}>
          <Card.Title
            title={part.contactName || part.sellerEmail || 'Verified Parts Dealer'}
            subtitle={`📍 ${part.location || 'India'} • Verified Vendor`}
            left={(props) => <Avatar.Icon {...props} icon="account" backgroundColor="#F97316" color="#FFFFFF" />}
            right={(props) => (
              <IconButton 
                {...props} 
                icon="chevron-right" 
                onPress={() => navigation.navigate('SellerProfile', { seller: { name: part.contactName, location: part.location, sellerId: part.sellerId || part.userId } })} 
              />
            )}
          />
        </Card>

        {/* Action Row: Owner vs Buyer */}
        {isOwner ? (
          <View style={styles.actionRow}>
            <Button 
              mode="contained" 
              icon="pencil" 
              onPress={() => setEditModalVisible(true)} 
              style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
              buttonColor="#0F172A"
              textColor="#FFFFFF"
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button 
              mode="contained" 
              icon="delete-outline" 
              onPress={handleDelete} 
              style={[styles.actionBtn, { flex: 1 }]}
              buttonColor="#EF4444"
              textColor="#FFFFFF"
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Button 
              mode="contained" 
              icon="message-text" 
              onPress={handleChat} 
              style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
              buttonColor="#F97316"
              textColor="#FFFFFF"
            >
              Chat Seller
            </Button>
            <Button 
              mode="outlined" 
              icon="phone" 
              onPress={handleCall} 
              style={[styles.actionBtn, { flex: 1, borderColor: '#F97316' }]}
              textColor="#F97316"
            >
              Call
            </Button>
          </View>
        )}
      </Surface>

      {isOwner && (
        <EditListingModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          listing={part}
          onSuccess={() => {
            setEditModalVisible(false);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  imageHeader: {
    position: 'relative',
    height: 300,
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shareFab: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 20,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  conditionChip: {
    backgroundColor: '#FFEDD5',
    height: 28,
  },
  price: {
    color: '#F97316',
    fontWeight: 'bold',
    marginVertical: 8,
    fontSize: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    height: 32,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    fontSize: 16,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specItem: {
    width: '50%',
    marginVertical: 8,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  description: {
    color: '#475569',
    lineHeight: 22,
    fontSize: 14,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sellerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
