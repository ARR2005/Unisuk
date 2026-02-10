import React from 'react'
import { ActivityIndicator, Image, View } from 'react-native'


const index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <Image source={require('../assets/icons/Splash_Logo.png')} className='w-80 h-80'  />
      <ActivityIndicator size="large" color="gray" className="mt-8 scale-[2]" />
    </View>
  )
}

export default index
