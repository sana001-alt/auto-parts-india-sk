import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { 
  Searchbar, 
  Text, 
  Chip, 
  Card, 
  FAB, 
  Badge, 
  IconButton, 
  useTheme, 
  ActivityIndicator,
  Button,
  Divider,
  Surface
} from 'react-native-paper';
import { db, collection, onSnapshot, query, orderBy } from '../services/firebase';
import { getCurrentLocation, reverseGeocodeOSM } from '../services/location';
import BrandLogo from '../components/BrandLogo';

export default function HomeScreen({ navigation, user }: any) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All India');
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const categories = [
    'All', 'Engine Components', 'Body Parts', 'Electrical & Lights', 
    'Brakes & Suspension', 'Transmission', 'Interior Accessories', 'Wheels & Tyres'
  ];

  const topBrands = [
    { name: 'All', icon: 'car-multiple' },
    { name: 'Maruti Suzuki', icon: 'car-sports' },
    { name: 'Hyundai', icon: 'car' },
    { name: 'Tata', icon: 'car-estate' },
    { name: 'Mahindra', icon: 'truck-pickup' },
    { name: 'Toyota', icon: 'car-side' },
    { name: 'Honda', icon: 'car-convertible' },
    { name: 'Kia', icon: 'car-hatchback' },
  ];

  const cities = [
    'All India', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Chennai', 
    'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'
  ];

  const banners = [
    {
      id: '1',
      title: '0% Marketplace Commission',
      subtitle: 'Sell auto spare parts directly to verified buyers',
      tag: 'DIRECT DEAL',
      color: '#0F172A',
      accentColor: '#2563EB'
    },
    {
      id: '2',
      title: '100% Genuine Certified Parts',
      subtitle: 'Browse OEM & verified aftermarket spares across India',
      tag: 'VERIFIED',
      color: '#1E293B',
      accentColor: '#10B981'
    }
  ];

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'spareParts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setParts(list);
      setLoading(false);
    }, (err) => {
      console.warn('Error fetching parts:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredParts = parts.filter((part) => {
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      part.title?.toLowerCase().includes(queryLower) ||
      part.carBrand?.toLowerCase().includes(queryLower) ||
      part.carModel?.toLowerCase().includes(queryLower) ||
      part.category?.toLowerCase().includes(queryLower) ||
      part.partNumber?.toLowerCase().includes(queryLower);

    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || part.carBrand === selectedBrand;
    const matchesCity = selectedCity === 'All India' || !part.location || part.location.includes(selectedCity);

    return matchesSearch && matchesCategory && matchesBrand && matchesCity;
  });

  const renderPartItem = ({ item }: { item: any }) => (
    <Card 
      style={styles.card} 
      onPress={() => navigation.navigate('ProductDetail', { part: item })}
      elevation={2}
    >
      <View style={styles.imageContainer}>
        <Card.Cover 
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' }} 
          style={styles.cardImage} 
        />
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.partTitle}>
          {item.title}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.partModel}>
          {item.carBrand} {item.carModel}
        </Text>
        <Text variant="bodySmall" style={styles.locationText}>
          📍 {item.location || 'India'}
        </Text>
        <View style={styles.priceRow}>
          <Text variant="titleMedium" style={styles.price}>
            ₹{item.price?.toLocaleString('en-IN')}
          </Text>
          <Chip compact style={styles.conditionChip} textStyle={{ fontSize: 10, color: '#475569' }}>
            {item.condition || 'Used'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Polished Automotive Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BrandLogo size={42} style={styles.logoImage} />
          <View>
            <Text variant="titleMedium" style={styles.headerTitle}>Auto Parts India</Text>
            <TouchableOpacity 
              style={styles.locationSelector} 
              onPress={() => setShowLocationModal(true)}
              activeOpacity={0.7}
            >
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                📍 {selectedCity} <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>▼</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.bellBtn} 
            onPress={() => navigation.navigate('ChatsTab')}
            activeOpacity={0.7}
          >
            <IconButton icon="bell-outline" iconColor="#FFFFFF" size={22} style={{ margin: 0 }} />
            <Badge size={7} style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sleek Search Bar & Filter Button */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search auto parts, brands, models..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ fontSize: 14, minHeight: 0 }}
          elevation={1}
          iconColor="#2563EB"
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <IconButton icon="tune-variant" iconColor="#FFFFFF" size={20} style={{ margin: 0 }} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Promotional Banner Carousel */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false} 
          style={styles.bannerContainer}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {banners.map((b) => (
            <Surface key={b.id} style={[styles.bannerCard, { backgroundColor: b.color }]} elevation={3}>
              <View style={[styles.bannerTag, { backgroundColor: b.accentColor }]}>
                <Text style={styles.bannerTagText}>{b.tag}</Text>
              </View>
              <Text variant="titleMedium" style={styles.bannerTitle}>{b.title}</Text>
              <Text variant="bodySmall" style={styles.bannerSubtitle}>{b.subtitle}</Text>
            </Surface>
          ))}
        </ScrollView>

        {/* Popular Car Brands */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Popular Car Brands</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
          {topBrands.map((b) => (
            <TouchableOpacity 
              key={b.name}
              style={[
                styles.brandChip,
                selectedBrand === b.name && styles.selectedBrandChip
              ]}
              onPress={() => setSelectedBrand(b.name)}
              activeOpacity={0.8}
            >
              <Text 
                style={[
                  styles.brandText,
                  selectedBrand === b.name && styles.selectedBrandText
                ]}
              >
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === cat && styles.selectedCategoryChipText
              ]}
              showSelectedOverlay={false}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>

        {/* Main Content Feed */}
        <View style={styles.feedHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Spare Parts {selectedCategory !== 'All' ? `• ${selectedCategory}` : ''}
          </Text>
          <Text variant="bodySmall" style={{ color: '#64748B', fontWeight: '500' }}>
            {filteredParts.length} items
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={filteredParts}
            keyExtractor={(item) => item.id}
            renderItem={renderPartItem}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <IconButton icon="car-off" size={48} iconColor="#94A3B8" />
                <Text variant="titleSmall" style={{ color: '#0F172A', fontWeight: 'bold', marginTop: 8 }}>
                  No spare parts found
                </Text>
                <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
                  Try resetting your search query, brand, or location filter.
                </Text>
                <Button 
                  mode="contained" 
                  buttonColor="#2563EB"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSelectedCity('All India');
                  }}
                  style={{ marginTop: 16, borderRadius: 8 }}
                >
                  Reset All Filters
                </Button>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Floating Action Button for Sellers */}
      <FAB
        icon="plus"
        label="Sell Part"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => {
          if (!user) {
            navigation.navigate('Auth');
          } else {
            navigation.navigate('SellTab');
          }
        }}
      />

      {/* Location Selector Modal */}
      <Modal visible={showLocationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text variant="titleLarge" style={styles.modalTitle}>Select Location</Text>
              <IconButton icon="close" size={20} onPress={() => setShowLocationModal(false)} />
            </View>
            <Divider style={{ marginVertical: 8 }} />
            
            <TouchableOpacity 
              style={styles.gpsLocationBtn}
              onPress={async () => {
                const coords = await getCurrentLocation();
                if (coords) {
                  const geo = await reverseGeocodeOSM(coords.latitude, coords.longitude);
                  if (geo?.city) {
                    setSelectedCity(geo.city);
                  }
                }
                setShowLocationModal(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.gpsLocationText}>
                🎯 Detect Current Location (GPS)
              </Text>
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 320 }}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.locationItem}
                  onPress={() => {
                    setSelectedCity(city);
                    setShowLocationModal(false);
                  }}
                >
                  <Text style={[styles.locationTextModal, selectedCity === city && { color: '#2563EB', fontWeight: 'bold' }]}>
                    {city}
                  </Text>
                  {selectedCity === city && <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Advanced Filters Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text variant="titleLarge" style={styles.modalTitle}>Filter Spare Parts</Text>
              <IconButton icon="close" size={20} onPress={() => setShowFilterModal(false)} />
            </View>
            <Divider style={{ marginVertical: 8 }} />

            <ScrollView style={{ maxHeight: 400 }}>
              <Text variant="titleSmall" style={styles.filterSectionTitle}>Car Brand</Text>
              <View style={styles.filterChipGrid}>
                {topBrands.map((b) => (
                  <Chip
                    key={b.name}
                    selected={selectedBrand === b.name}
                    onPress={() => setSelectedBrand(b.name)}
                    style={[styles.filterChip, selectedBrand === b.name && { backgroundColor: '#DBEAFE' }]}
                    textStyle={selectedBrand === b.name ? { color: '#2563EB', fontWeight: 'bold' } : {}}
                  >
                    {b.name}
                  </Chip>
                ))}
              </View>

              <Text variant="titleSmall" style={[styles.filterSectionTitle, { marginTop: 16 }]}>Category</Text>
              <View style={styles.filterChipGrid}>
                {categories.map((c) => (
                  <Chip
                    key={c}
                    selected={selectedCategory === c}
                    onPress={() => setSelectedCategory(c)}
                    style={[styles.filterChip, selectedCategory === c && { backgroundColor: '#DBEAFE' }]}
                    textStyle={selectedCategory === c ? { color: '#2563EB', fontWeight: 'bold' } : {}}
                  >
                    {c}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            <Button 
              mode="contained" 
              buttonColor="#2563EB" 
              onPress={() => setShowFilterModal(false)} 
              style={{ marginTop: 20, borderRadius: 8, paddingVertical: 4 }}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 17,
  },
  headerSubtitle: {
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 12,
  },
  locationSelector: {
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBtn: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: -22,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerContainer: {
    marginTop: 18,
    paddingLeft: 16,
  },
  bannerCard: {
    width: 300,
    marginRight: 12,
    padding: 18,
    borderRadius: 16,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bannerSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: 16,
  },
  brandList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  selectedBrandChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  brandText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedBrandText: {
    color: '#FFFFFF',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    height: 38,
  },
  selectedCategoryChip: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 120,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 10,
  },
  partTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: 13,
  },
  partModel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  locationText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
  },
  conditionChip: {
    height: 24,
    backgroundColor: '#F1F5F9',
  },
  loaderContainer: {
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
    borderRadius: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  gpsLocationBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  gpsLocationText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationTextModal: {
    color: '#0F172A',
    fontSize: 15,
  },
  filterSectionTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
});
