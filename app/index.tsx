import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'


const index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <Text className="text-2xl font-bold mb-4">Welcome to UniSuki!</Text>
      <ActivityIndicator size="large" color="gray" />
    </View>
  )
}

export default index