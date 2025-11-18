import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'


const index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/(auth)/login" className="mt-4 px-4 py-2 bg-slate-800 rounded text-white font-semibold">
        LOG IN
      </Link>
      <Link href="/(auth)/signup" className="mt-4 px-4 py-2 bg-slate-800 rounded text-white font-semibold">
        Sign UP
      </Link>
    </View>
  )
}

export default index