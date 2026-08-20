import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { 
  Text, 
  List, 
  Button, 
  Divider, 
  IconButton, 
  Surface,
  Badge 
} from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  onSnapshot, 
  signOut, 
  updateProfile, 
  serverTimestamp 
} from '../services/firebase';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { UserProfile } from '../types';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

export default function ProfileScreen({ navigation, user: initialUser }: any) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const currentAuthUser = auth.currentUser || initialUser;

  useEffect(() => {
    if (!currentAuthUser?.uid) {
      setProfileData(null);
      return;
    }

    const userDocRef = doc(db, 'users', currentAuthUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            id: docSnap.id,
            email: data.email || currentAuthUser.email || '',
            name: data.name || data.displayName || currentAuthUser.displayName || '',
            displayName: data.displayName || data.name || currentAuthUser.displayName || '',
            photoURL: data.photoURL || currentAuthUser.photoURL || '',
            phone: data.phone || '',
            role: data.role || 'buyer',
            createdAt: data.createdAt,
          });
          setCacheBuster(Date.now());
        } else {
          setProfileData({
            id: currentAuthUser.uid,
            email: currentAuthUser.email || '',
            name: currentAuthUser.displayName || '',
            displayName: currentAuthUser.displayName || '',
            photoURL: currentAuthUser.photoURL || '',
            role: 'buyer',
          });
        }
      },
      (error) => {
        console.warn('[ProfileScreen] Firestore onSnapshot error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentAuthUser?.uid]);

  const handleUpdateProfilePhoto = async () => {
    if (!currentAuthUser?.uid) {
      Alert.alert('Sign In Required', 'Please sign in to update your profile photo.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image from gallery.');
        return;
      }

      const selectedAsset = result.assets?.[0];
      if (!selectedAsset?.uri) return;

      setUploadingPhoto(true);

      const uploadedUrl = await uploadImageToCloudinary(selectedAsset.uri, 'avatars');

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: uploadedUrl,
        });
      }

      const userDocRef = doc(db, 'users', currentAuthUser.uid);
      await setDoc(
        userDocRef,
        {
          photoURL: uploadedUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setCacheBuster(Date.now());
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (err: any) {
      console.error('[ProfileScreen] Photo upload error:', err);
      Alert.alert('Upload Failed', err.message || 'Could not update profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Home');
    } catch (err: any) {
      console.warn('Sign out error:', err);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const rawPhoto = profileData?.photoURL || currentAuthUser?.photoURL;
  const displayPhotoUrl = rawPhoto
    ? `${rawPhoto}${rawPhoto.includes('?') ? '&' : '?'}t=${cacheBuster}`
    : DEFAULT_AVATAR;

  const displayName =
    profileData?.displayName ||
    profileData?.name ||
    currentAuthUser?.displayName ||
    currentAuthUser?.email?.split('@')[0] ||
    'Auto Parts Member';

  const userEmail = profileData?.email || currentAuthUser?.email || 'Not logged in';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      {/* Header Profile Section */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            onPress={handleUpdateProfilePhoto} 
            activeOpacity={0.8}
            style={styles.avatarTouch}
            disabled={uploadingPhoto}
          >
            <Image
              key={`avatar-${cacheBuster}`}
              source={{ uri: displayPhotoUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
            {uploadingPhoto ? (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.cameraIconBadge}>
                <IconButton icon="camera" size={14} iconColor="#FFFFFF" style={styles.cameraIcon} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text variant="headlineSmall" style={styles.name}>
          {displayName}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {userEmail}
        </Text>

        {profileData?.role && (
          <Badge style={styles.roleBadge}>
            {profileData.role.toUpperCase()}
          </Badge>
        )}
      </Surface>

      <Divider style={styles.divider} />

      {currentAuthUser ? (
        <View style={styles.content}>
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>Account & Listings</List.Subheader>
            
            <List.Item
              title="My Listings"
              titleStyle={styles.listTitle}
              description="Manage, edit, or delete your posted spare parts"
              left={(props) => <List.Icon {...props} icon="car-cog" color="#F97316" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#94A3B8" />}
              onPress={() => navigation.navigate('HomeTab')}
              style={styles.listItem}
            />

            <List.Item
              title="Post a Spare Part"
              titleStyle={styles.listTitle}
              description="Sell new, used, or OEM auto components"
              left={(props) => <List.Icon {...props} icon="plus-circle" color="#10B981" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#94A3B8" />}
              onPress={() => navigation.navigate('SellTab')}
              style={styles.listItem}
            />

            <List.Item
              title="Buyer & Seller Messages"
              titleStyle={styles.listTitle}
              description="Chat and deal directly with buyers across India"
              left={(props) => <List.Icon {...props} icon="chat-processing" color="#38BDF8" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#94A3B8" />}
              onPress={() => navigation.navigate('ChatsTab')}
              style={styles.listItem}
            />

            <Divider style={{ marginVertical: 8, backgroundColor: '#E2E8F0' }} />
            <List.Subheader style={styles.sectionHeader}>Administration & Settings</List.Subheader>

            <List.Item
              title="Admin Moderation"
              titleStyle={styles.listTitle}
              description="Verify listings, manage banners, and view stats"
              left={(props) => <List.Icon {...props} icon="shield-account" color="#F59E0B" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#94A3B8" />}
              onPress={() => navigation.navigate('Admin')}
              style={styles.listItem}
            />

            <List.Item
              title="Update Profile Photo"
              titleStyle={styles.listTitle}
              description="Choose a new profile picture from gallery"
              left={(props) => <List.Icon {...props} icon="camera-account" color="#64748B" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#94A3B8" />}
              onPress={handleUpdateProfilePhoto}
              style={styles.listItem}
            />
          </List.Section>

          <Button 
            mode="outlined" 
            onPress={handleSignOut} 
            textColor="#EF4444"
            icon="logout"
            style={styles.signOutButton}
          >
            Sign Out of Account
          </Button>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <Text variant="titleMedium" style={{ color: '#0F172A', fontWeight: 'bold' }}>Sign in to manage your account</Text>
          <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 4, textAlign: 'center' }}>
            Access your listings, chat history, and member profile.
          </Text>
          <Button 
            mode="contained" 
            buttonColor="#F97316" 
            onPress={() => navigation.navigate('Auth')} 
            style={{ marginTop: 16, borderRadius: 10 }}
          >
            Sign In / Register
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarTouch: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F97316',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#334155',
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F97316',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  cameraIcon: {
    margin: 0,
    padding: 0,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#F97316',
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 4,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  signOutButton: {
    marginTop: 24,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  guestContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
