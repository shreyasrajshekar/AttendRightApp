import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'client_id';
const genId = () => 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function getClientId() {
  try {
    let id = await AsyncStorage.getItem(KEY);
    if (!id) {
      id = genId();
      await AsyncStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    // fallback if storage fails
    return genId();
  }
}
