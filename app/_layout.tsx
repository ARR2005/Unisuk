import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import "../global.css";

const _layout = () => {
  return (
    <>
      <StatusBar style = 'auto' />
      <Stack screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="(auth)"/>
        <Stack.Screen name="index" />
      </Stack>
      <PortalHost />
    </>
  );
};

export default _layout

const style = StyleSheet.create({})