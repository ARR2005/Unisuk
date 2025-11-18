import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

const _layout = () => {
  return (
    <>
        <StatusBar style='auto' />
        <Stack screenOptions={{ headerShown: false }}/>
    </>
  )
}

export default _layout