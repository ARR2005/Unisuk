import React from 'react';
import { Image, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-100';
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: isDark ? '#111827' : '#fff' }}>
      <View className={`h-20 justify-center items-center px-5 border-b ${borderColor}`}>
        <Image source={require('../assets/icons/Logo.png')} className='w-48 h-48' resizeMode='contain' />
      </View>
    </View>
  );
};

export default Header;