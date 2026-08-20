const fs = require('fs');
let code = fs.readFileSync('react-native-app/src/components/EditListingModal.tsx', 'utf8');

code = code.replace(
  /import \{ launchImageLibrary \} from 'react-native-image-picker';/,
  "import { launchImageLibrary, launchCamera } from 'react-native-image-picker';"
);

code = code.replace(
  /const handlePickImage = async \(\) => \{[\s\S]*?\};/,
  `const handlePickImage = () => {
    Alert.alert(
      "Update Photo",
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
                setNewImageUri(result.assets[0].uri);
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
                setNewImageUri(result.assets[0].uri);
              }
            } catch (err) {
              console.warn('Image picker error:', err);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };`
);

fs.writeFileSync('react-native-app/src/components/EditListingModal.tsx', code);
