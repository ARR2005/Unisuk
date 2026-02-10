import { SignUpForm } from '@/components/sign-up-form';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';

const SignUp = () => {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-end items-center">
        <Image source={require('../../assets/icons/Splash_Logo.png')} className="absolute top-12 w-64 h-64" resizeMode="contain" />
        <SignUpForm />
      </View>
    </ScrollView>
  );
};

export default SignUp;