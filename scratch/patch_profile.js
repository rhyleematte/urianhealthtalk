const fs = require('fs');

const path = 'c:\\Urian Health Talk\\UrianHealthTalk\\app\\(tabs)\\profile.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ImagePicker import
content = content.replace(
  "import { supabase } from '@/config/supabase';",
  "import { supabase } from '@/config/supabase';\nimport * as ImagePicker from 'expo-image-picker';\nimport { decode } from 'base64-arraybuffer';"
);

// 2. Add state variables inside ProfileScreen
content = content.replace(
  "const [editGender, setEditGender] = useState<string>('');",
  `const [editGender, setEditGender] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<{uri: string, base64?: string | null} | null>(null);`
);

// 3. Update openEditModal
content = content.replace(
  "setEditGender(profile?.gender || '');",
  `setEditGender(profile?.gender || '');
    setEditEmail(user?.email || '');
    setEditPassword('');
    setEditAvatar(null);`
);

// 4. Add pickImage function
content = content.replace(
  "const openEditModal = () => {",
  `const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setEditAvatar({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  };

  const openEditModal = () => {`
);

// 5. Update handleUpdateProfile
const oldHandleUpdateProfile = `
  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          birthday: editBirthday?.toISOString(),
          gender: editGender
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };
`;

const newHandleUpdateProfile = `
  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      let avatar_url = profile?.avatar_url;

      if (editAvatar?.base64) {
        const fileExt = editAvatar.uri.split('.').pop() || 'jpeg';
        const fileName = \`\${user.id}-\${Math.random()}.\${fileExt}\`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, decode(editAvatar.base64), { contentType: 'image/' + fileExt, upsert: true });

        if (uploadError) throw uploadError;
        avatar_url = fileName;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          birthday: editBirthday?.toISOString(),
          gender: editGender,
          avatar_url: avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;

      let authUpdates: any = {};
      if (editEmail && editEmail !== user.email) authUpdates.email = editEmail;
      if (editPassword) authUpdates.password = editPassword;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }
      
      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };
`;
content = content.replace(oldHandleUpdateProfile.trim(), newHandleUpdateProfile.trim());

// 6. Update the main avatar display in the profile tab
const oldAvatarDisplay = `
          <View style={styles.avatarWrapper}>
            <Image 
              source={require('@/assets/images/user_avatar.png')} 
              style={styles.avatarLarge} 
            />
`;
const newAvatarDisplay = `
          <View style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image 
                source={{ uri: supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl }} 
                style={styles.avatarLarge} 
              />
            ) : (
              <Image 
                source={require('@/assets/images/user_avatar.png')} 
                style={styles.avatarLarge} 
              />
            )}
`;
content = content.replace(oldAvatarDisplay.trim(), newAvatarDisplay.trim());

// 7. Update the Modal UI to include Avatar, Email, Password fields
const oldModalNameInput = `<View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g. John Doe"
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>`;

const newModalUI = `
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
                    <Image 
                      source={editAvatar ? { uri: editAvatar.uri } : profile?.avatar_url ? { uri: supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl } : require('@/assets/images/user_avatar.png')} 
                      style={[styles.avatarLarge, { opacity: 0.8 }]} 
                    />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 50 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Edit</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g. John Doe"
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={editEmail}
                    onChangeText={setEditEmail}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>New Password (Optional)</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Leave blank to keep current"
                    secureTextEntry
                    value={editPassword}
                    onChangeText={setEditPassword}
                  />
                </View>
`;
content = content.replace(oldModalNameInput.trim(), newModalUI.trim());

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully patched profile.tsx");
