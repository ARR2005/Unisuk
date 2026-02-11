import React from 'react';
import { Image, View, useColorScheme } from 'react-native';

const Header: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-100';

  return (
    <View className={`h-16 justify-center items-center px-5 ${bgColor} border-b ${borderColor}`}>
      <Image source={require('../assets/icons/Logo.png')} className='w-32 h-12' resizeMode='contain' />
    </View>
  );
};

export default Header;