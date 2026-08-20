const fs = require('fs');
let code = fs.readFileSync('react-native-app/src/screens/ProfileScreen.tsx', 'utf8');

code = code.replace(
  /import \{ launchImageLibrary \} from 'react-native-image-picker';/,
  "import { launchImageLibrary, launchCamera } from 'react-native-image-picker';"
);

code = code.replace(
  /const handlePickImage = async \(\) => \{[\s\S]*?\};/,
  `const handlePickImage = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose an option",
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
                setLoading(true);
                const cloudUrl = await uploadImageToCloudinary(result.assets[0].uri, 'users');
                await setDoc(doc(db, 'users', user.uid), { photoURL: cloudUrl }, { merge: true });
                Alert.alert("Success", "Profile photo updated successfully!");
              }
            } catch (err) {
              Alert.alert("Error", "Failed to update profile photo.");
            } finally {
              setLoading(false);
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
                setLoading(true);
                const cloudUrl = await uploadImageToCloudinary(result.assets[0].uri, 'users');
                await setDoc(doc(db, 'users', user.uid), { photoURL: cloudUrl }, { merge: true });
                Alert.alert("Success", "Profile photo updated successfully!");
              }
            } catch (err) {
              Alert.alert("Error", "Failed to update profile photo.");
            } finally {
              setLoading(false);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };`
);

fs.writeFileSync('react-native-app/src/screens/ProfileScreen.tsx', code);
