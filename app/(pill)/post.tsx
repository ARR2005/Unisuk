import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function PostCamera() {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const cameraRef = useRef<any>(null)
  const [taking, setTaking] = useState(false)
  const router = useRouter()

  if (!permission) return <View />

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>We need camera permission</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
          <Text style={{ color: 'white' }}>Grant</Text>
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
      // navigate to post form with photo
      router.push({ pathname: '/(pill)/postForm', params: { photo: uri } } as any)
    } catch (e) {
      console.error(e)
    } finally {
      setTaking(false)
    }
  }

  function flip() {
    setFacing((t) => (t === 'back' ? 'front' : 'back'))
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.topSpace} />
          <View style={styles.centerRow}>
            <View style={styles.sideSpace} />
            <View style={styles.boundingBox} />
            <View style={styles.sideSpace} />
          </View>
          <View style={styles.bottomSpace} />
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity onPress={flip} style={styles.controlButton}>
          <Text style={{ color: 'white' }}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePicture} style={styles.captureButton} disabled={taking}>
          {taking ? <ActivityIndicator color="#fff" /> : <View style={styles.innerCircle} />}
        </TouchableOpacity>

        <View style={{ width: 64 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grantButton: { padding: 10, backgroundColor: '#2563eb', borderRadius: 8 },
  overlay: { flex: 1, justifyContent: 'center' },
  topSpace: { flex: 1 },
  bottomSpace: { flex: 2 },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  sideSpace: { flex: 1 },
  boundingBox: { width: 260, height: 360, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 12 },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  controlButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8 },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'white' },
})