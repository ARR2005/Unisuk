import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

export default function PostCamera() {
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<any>(null)
  const [taking, setTaking] = useState(false)
  const router = useRouter()

  if (!permission) return <View />

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-center text-gray-800 text-base mb-6 font-medium">We need camera permission to capture photos</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 rounded-lg px-8 py-3 min-w-32 items-center">
          <Text className="text-white font-semibold text-base">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  async function takePicture() {
    if (!cameraRef.current || taking) return
    try {
      setTaking(true)

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      const uri = photo.uri

      router.push({ pathname: '/(pill)/postForm', params: { photo: uri } } as any)
    } catch (e) {
      console.error('Camera error:', e)
    } finally {
      setTaking(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="flex-1 justify-center mb-56" pointerEvents="none">
          <View className="flex-1" />
          <View className="flex-row items-center">
            <View className="flex-1" />
            <View className="w-[340px] h-[560px] border-2 border-white/90" />
            <View className="flex-1" />
          </View>
          <View className="flex-2" />
        </View>
      </CameraView>

      {/* Camera Controls */}
      <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center">
        <TouchableOpacity
          onPress={takePicture}
          className="w-16 h-16 rounded-full bg-white/15 items-center justify-center border-2 border-white/50"
          disabled={taking}
          activeOpacity={0.7}
        >
          {taking ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}