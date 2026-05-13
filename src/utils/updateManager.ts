import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { APP_RELEASE_NOTES } from './releaseNotes';
import { Linking, Platform } from 'react-native';

const LAST_SHOWN_NOTES_VERSION = '@last_shown_notes_version';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yusufulgen.boldsorter'; // Değiştirilecek

export const getCurrentVersion = () => {
  return Constants.expoConfig?.version || '1.0.0';
};

export const checkShowReleaseNotes = async () => {
  try {
    const lastShownVersion = await AsyncStorage.getItem(LAST_SHOWN_NOTES_VERSION);
    const currentNotesVersion = APP_RELEASE_NOTES.version;

    if (lastShownVersion !== currentNotesVersion) {
      return true;
    }
  } catch (error) {
    console.error("Release notes check error:", error);
  }
  return false;
};

export const markReleaseNotesAsShown = async () => {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_NOTES_VERSION, APP_RELEASE_NOTES.version);
  } catch (error) {
    console.error("Release notes save error:", error);
  }
};

export const checkForUpdate = async () => {
    try {
        // Burada normalde bir API'ye istek atılır. 
        // Şimdilik manuel kontrol veya versiyon karşılaştırması simüle edilebilir.
        // Kullanıcı "yeni bir sürüm var uyarısı gelecek" dediği için 
        // burada bir kontrol mekanizması olduğunu varsayıyoruz.
        
        // Örnek: Firebase Config veya basit bir JSON dosyası üzerinden kontrol edilebilir.
        // fetch('config_url').then(res => res.json())...
        
        // Şimdilik sadece fonksiyonu tanımlıyoruz, App.tsx içinde tetikleyeceğiz.
        return false; // Varsayılan olarak güncelleme yok
    } catch (e) {
        return false;
    }
};

export const redirectToPlayStore = () => {
    Linking.openURL(PLAY_STORE_URL).catch(err => console.error("Link error:", err));
};
