import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Alert, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Chip, Divider, IconButton, Surface } from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { db, collection, addDoc } from '../services/firebase';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { getCurrentLocation, reverseGeocodeOSM } from '../services/location';

export default function SellPartScreen({ navigation, user }: any) {
  const [title, setTitle] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [category, setCategory] = useState('Engine Components');
  const [condition, setCondition] = useState('Brand New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [contactName, setContactName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    'Engine Components', 'Body Parts', 'Electrical & Lights', 
    'Brakes & Suspension', 'Transmission', 'Interior Accessories', 'Wheels & Tyres'
  ];

  const popularBrands = [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'Ford'
  ];

  const handlePickImage = () => {
    Alert.alert(
      "Upload Part Photo",
      "Choose a photo source",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            try {
              const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
              });
              if (result.assets && result.assets[0]?.uri) {
                setImageUrl(result.assets[0].uri);
              }
            } catch (err) {
              console.warn('Camera error:', err);
            }
          }
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            try {
              const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
              });
              if (result.assets && result.assets[0]?.uri) {
                setImageUrl(result.assets[0].uri);
              }
            } catch (err) {
              console.warn('Image picker error:', err);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleDetectLocation = async () => {
    setLocLoading(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        const geo = await reverseGeocodeOSM(coords.latitude, coords.longitude);
        if (geo?.city) {
          setLocation(`${geo.city}, ${geo.state}`);
        }
      }
    } catch (err) {
      console.warn('GPS location error:', err);
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async () => {
    const cleanPrice = String(price).replace(/[^0-9.]/g, '');
    if (!title || !carBrand || !carModel || !cleanPrice || Number(cleanPrice) <= 0) {
      Alert.alert('Required Fields', 'Please fill in Part Title, Car Brand, Car Model, and a valid Price.');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        finalImageUrl = await uploadImageToCloudinary(imageUrl, 'spare_parts');
      }

      await addDoc(collection(db, 'spareParts'), {
        title,
        carBrand,
        carModel,
        category,
        condition,
        price: Number(cleanPrice),
        location,
        contactName,
        contactPhone,
        description,
        imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
        sellerId: user?.uid || 'guest',
        sellerEmail: user?.email || '',
        createdAt: Date.now(),
        approved: true,
        verified: true,
      });

      Alert.alert('Success', 'Your spare part listing has been published!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.headerBanner}>
        <Text variant="headlineSmall" style={styles.title}>List Auto Spare Part</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Reach thousands of verified buyers & mechanics across India
        </Text>
      </View>

      <Surface style={styles.formCard} elevation={2}>
        {/* Image Upload Box */}
        <TouchableOpacity style={styles.imageBox} onPress={handlePickImage} activeOpacity={0.8}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconButton icon="camera-plus" size={32} iconColor="#F97316" />
              <Text variant="bodyMedium" style={{ color: '#0F172A', fontWeight: 'bold' }}>
                Upload Part Photo
              </Text>
              <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 2 }}>Tap to capture or select from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          label="Part Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          placeholder="e.g. Maruti Swift Front Brake Pads"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <Text variant="titleSmall" style={styles.label}>Select Car Brand *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {popularBrands.map((brand) => (
            <Chip
              key={brand}
              selected={carBrand === brand}
              onPress={() => setCarBrand(brand)}
              style={[styles.brandChip, carBrand === brand && { backgroundColor: '#FFEDD5', borderColor: '#F97316' }]}
              textStyle={carBrand === brand ? { color: '#F97316', fontWeight: 'bold' } : {}}
            >
              {brand}
            </Chip>
          ))}
        </ScrollView>

        <TextInput
          label="Car Model *"
          value={carModel}
          onChangeText={setCarModel}
          mode="outlined"
          placeholder="e.g. Swift, Creta, i20, Scorpio"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <TouchableOpacity onPress={() => setShowCategoryModal(true)} style={styles.categorySelectBtn} activeOpacity={0.8}>
          <Text style={{ color: '#0F172A', fontWeight: '500' }}>Category: <Text style={{ fontWeight: 'bold' }}>{category}</Text></Text>
          <Text style={{ color: '#F97316', fontWeight: 'bold' }}>Change ▾</Text>
        </TouchableOpacity>

        <TextInput
          label="Price (₹) *"
          value={price}
          onChangeText={setPrice}
          keyboardDataType="numeric"
          keyboardType="numeric"
          mode="outlined"
          placeholder="e.g. 2500"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <Text variant="titleSmall" style={styles.label}>Part Condition</Text>
        <SegmentedButtons
          value={condition}
          onValueChange={setCondition}
          buttons={[
            { value: 'Brand New', label: 'New' },
            { value: 'Like New', label: 'Like New' },
            { value: 'Used (Good)', label: 'Used' },
          ]}
          style={styles.segmented}
        />

        <View style={styles.locationContainer}>
          <TextInput
            label="City / Location"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            placeholder="e.g. Mumbai, Maharashtra"
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            outlineColor="#CBD5E1"
            activeOutlineColor="#F97316"
          />
          <TouchableOpacity 
            style={styles.gpsBtn} 
            onPress={handleDetectLocation}
            disabled={locLoading}
            activeOpacity={0.8}
          >
            {locLoading ? (
              <ActivityIndicator size={18} color="#F97316" />
            ) : (
              <IconButton icon="crosshairs-gps" size={20} iconColor="#F97316" style={{ margin: 0 }} />
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          label="Contact Name"
          value={contactName}
          onChangeText={setContactName}
          mode="outlined"
          style={[styles.input, { marginTop: 12 }]}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <TextInput
          label="Contact Phone Number"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          mode="outlined"
          placeholder="+91 9876543210"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <TextInput
          label="Description & Fitment Notes"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          mode="outlined"
          placeholder="Mention part OEM number, condition details, or fitment compatibility"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          buttonColor="#F97316"
          textColor="#FFFFFF"
          style={styles.submitButton}
        >
          Publish Listing
        </Button>
      </Surface>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>Select Category</Text>
            <Divider style={{ marginVertical: 12 }} />
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.catItem}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.catText, category === cat && { color: '#F97316', fontWeight: 'bold' }]}>
                  {cat}
                </Text>
                {category === cat && <Text style={{ color: '#F97316', fontWeight: 'bold' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <Button mode="contained" buttonColor="#0F172A" onPress={() => setShowCategoryModal(false)} style={{ marginTop: 16, borderRadius: 10 }}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  imageBox: {
    height: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  gpsBtn: {
    height: 56,
    width: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 8,
  },
  brandChip: {
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  categorySelectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  segmented: {
    marginBottom: 16,
  },
  submitButton: {
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 4,
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
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  catItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catText: {
    fontSize: 15,
    color: '#0F172A',
  },
});
