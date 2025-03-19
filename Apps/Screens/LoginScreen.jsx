import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from '../../hooks/warmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {

    useWarmUpBrowser();
 
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const onPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } =
                await startOAuthFlow();

            if (createdSessionId) {
                setActive({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error("OAuth error", err);
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
                {/* Logo y Nombre */}
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

                <TouchableOpacity 
                    onPress={onPress} 
                    className="p-4 rounded-full mt-8" 
                    style={{ backgroundColor: '#f2e9c4' }}
                >
                    <Text className="text-center text-[18px]" style={{ color: '#2d978e', fontWeight: 'bold' }}>Login to Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
