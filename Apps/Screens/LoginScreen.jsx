import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../hooks/warmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startMicrosoftOAuth } = useOAuth({ strategy: 'oauth_microsoft' });

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google OAuth error', err);
      Alert.alert('Login Error', 'Hubo un problema al iniciar sesión con Google.');
    }
  }, []);

  const onMicrosoftPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startMicrosoftOAuth();
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Microsoft OAuth error', err);
      Alert.alert('Login Error', 'Hubo un problema al iniciar sesión con Microsoft.');
    }
  }, []);

  return (
    <View className="items-center">
      <Image
        source={require('./../../assets/images/login2.png')}
        className="w-[220px] h-[460px] object-cover mt-16 rounded-xl"
        style={{ borderWidth: 4, borderColor: '#000', paddingTop: 5 }}
      />
      <View className="p-8 mt-[-120px] flex h-full rounded-t-3xl shadow-md" style={{ backgroundColor: '#2d978e' }}>
        <View className="flex flex-row items-center justify-center mb-4">
          <Image
            source={require('./../../assets/logo.jpg')}
            className="w-[50px] h-[50px] mr-2"
            resizeMode="contain"
          />
          <Text className="text-[30px] font-bold text-white">UniKet</Text>
        </View>

        <Text className="text-[18px] text-white text-center mt-6">
          Welcome to UniKet! Buy, sell, and connect with fellow HBCU students through our exclusive campus marketplace.
        </Text>

        {/* Botón Google */}
        <TouchableOpacity
          onPress={onGooglePress}
          className="p-4 rounded-full mt-8 flex-row items-center justify-center"
          style={{ backgroundColor: '#ffffff', gap: 12 }}
        >
          <Image
            source={require('./../../assets/icons/google.png')}
            className="w-[24px] h-[24px]"
          />
          <Text
            className="text-center text-[18px]"
            style={{ color: '#2d978e', fontWeight: 'bold' }}
          >
            Iniciar con Google
          </Text>
        </TouchableOpacity>

        {/* Botón Microsoft */}
        <TouchableOpacity
          onPress={onMicrosoftPress}
          className="p-4 rounded-full mt-4 flex-row items-center justify-center"
          style={{ backgroundColor: '#ffffff', gap: 12 }}
        >
          <Image
            source={require('./../../assets/icons/microsoft.png')}
            className="w-[24px] h-[24px]"
          />
          <Text
            className="text-center text-[18px]"
            style={{ color: '#2d978e', fontWeight: 'bold' }}
          >
            Iniciar con Microsoft
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
