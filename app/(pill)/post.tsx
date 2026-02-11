import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import '../../firebaseConfig'

// Generate static description based on detected item
const getStaticDescription = (itemClass: string): string => {
  const descriptions: { [key: string]: string } = {
    'Pe shirt': 'High-quality PE shirt, perfect condition. Ideal for physical education, sports, or casual wear. Well-maintained and ready to use.',
    'Pe pant': 'Durable PE pants in excellent condition. Great for sports activities, physical education, or athletic use. Comfortable fit and quality material.',
    'Skirt': 'Stylish skirt in good condition. Versatile piece suitable for casual or formal occasions. Quality fabric and neat finish.',
    'White Shirt': 'Clean white shirt in perfect condition. Versatile classic piece suitable for various occasions. Quality fabric and excellent condition.',
    'UC VEST': 'UC branded vest in excellent condition. Perfect for university events, casual wear, or sports activities. Quality embroidered logo.',
    'Unknown': 'No description available.',
  }
  return descriptions[itemClass] || descriptions['Unknown'] || ''
}

// Get default price for each item type
const getDefaultPrice = (itemClass: string): string => {
  const prices: { [key: string]: string } = {
    'Pe shirt': '150',
    'Pe pant': '200',
    'Skirt': '180',
    'White Shirt': '120',
    'UC VEST': '250',
    'Unknown': '0',
  }
  return prices[itemClass] || prices['Unknown'] || '0'
}

const CATEGORIES = [
  { label: 'Clothes', value: 'clothes', icon: 'shirt-outline' },
  { label: 'Miscellaneous', value: 'miscellaneous', icon: 'apps-outline' },
  { label: 'Gadgets', value: 'gadgets', icon: 'phone-portrait-outline' },
  { label: 'Stationery', value: 'stationary', icon: 'pencil-outline' },
  { label: 'Books', value: 'books', icon: 'book-outline' },
]

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
const GENRES = ['Fiction', 'Non-Fiction', 'Textbook', 'Sci-Fi', 'Mystery', 'History', 'Other']

// Image recognition function using detection data
const recognizeImage = (itemClass?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = itemClass || 'Unknown'
      const desc = getStaticDescription(item)
      const price = getDefaultPrice(item)
      const title = item === 'Unknown' ? '' : item
      
      let suggestedCategory = 'miscellaneous'
      if (['Pe shirt', 'Pe pant', 'Skirt', 'White Shirt', 'UC VEST'].includes(item)) {
        suggestedCategory = 'clothes'
      }

      resolve({
        title: title,
        price: price,
        description: desc,
        category: suggestedCategory,
      })
    }, 1500) // Simulate network delay
  })
}

export default function PostCamera() {
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<any>(null)
  const [taking, setTaking] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const router = useRouter()
  
  // Form State
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('miscellaneous')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState('')
  const [genre, setGenre] = useState('')

  // Reset form when photo changes
  useEffect(() => {
    if (photoUri) {
      setLoading(true)
      // Simulate recognition
      recognizeImage().then((mockData: any) => {
        setTitle(mockData.title)
        setPrice(mockData.price)
        setDescription(mockData.description)
        setCategory(mockData.category)
        setLoading(false)
      })
    }
  }, [photoUri])

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
      setPhotoUri(uri)
    } catch (e) {
      console.error('Camera error:', e)
    } finally {
      setTaking(false)
    }
  }

  const uploadImageToCloudinary = async (uri: string) => {
    if (!uri) return null

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your .env file.')
    }

    try {
      const formData = new FormData()
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.secure_url
    } catch (error: any) {
      console.error('Cloudinary upload failed:', error)
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  async function publish() {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post.')
      return
    }

    setLoading(true)
    try {
      const imageUrl = photoUri ? await uploadImageToCloudinary(photoUri) : null
      
      const db = getDatabase()
      const newItemRef = push(ref(db, `users/${user.uid}/itemsPosted`))

      await set(newItemRef, {
        title: title || '',
        image_uri: imageUrl || null,
        description: description || '',
        support_images: [],
        price: parseFloat(price) || 0,
        type: category,
        quantity: quantity ? parseInt(quantity) : 1,
        size: category === 'clothes' ? size : null,
        genre: category === 'books' ? genre : null,
        createdAt: serverTimestamp(),
      })

      router.replace('/(dashboard)/home')
    } catch (error: any) {
      console.error('Publish error:', error)
      if (error.message.includes('PERMISSION_DENIED')) {
        Alert.alert('Permission Error', 'Database permission denied. Please check your Firebase Realtime Database Rules.')
      } else {
        Alert.alert('Error', 'Failed to create listing: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (photoUri) {
    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Create Listing</Text>

          {/* Product Image */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-3">Product Photo</Text>
            <View className="bg-gray-100 rounded-xl h-64 overflow-hidden items-center justify-center border-2 border-dashed border-gray-300 relative">
              <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <TouchableOpacity 
                onPress={() => setPhotoUri(null)}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
              >
                <Text className="text-white text-xs font-bold">✕ Retake</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title Input */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Product Title</Text>
            <TextInput 
              value={title} 
              onChangeText={setTitle} 
              placeholder={loading ? 'Analyzing image...' : 'Enter product title'} 
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price Input */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Price (₱)</Text>
            <TextInput 
              value={price} 
              onChangeText={setPrice} 
              placeholder={loading ? 'Suggesting price...' : '0.00'} 
              keyboardType="decimal-pad" 
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description Input */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Description</Text>
            <TextInput 
              value={description} 
              onChangeText={setDescription} 
              placeholder={loading ? 'Generating description...' : 'Describe your item in detail'} 
              multiline 
              numberOfLines={5}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Category Selection */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name={CATEGORIES.find(c => c.value === category)?.icon as any || 'apps-outline'} size={20} color="#374151" />
                <Text className="text-base text-gray-900 capitalize">{CATEGORIES.find(c => c.value === category)?.label || category}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Conditional Fields based on Category */}
          {category === 'clothes' && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Size</Text>
              <View className="flex-row flex-wrap gap-2">
                {SIZES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSize(s)}
                    className={`px-4 py-2 rounded-full border ${size === s ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`${size === s ? 'text-white' : 'text-gray-700'} font-medium`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(category === 'miscellaneous' || category === 'stationary') && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Quantity (Optional)</Text>
              <TextInput 
                value={quantity} 
                onChangeText={setQuantity} 
                placeholder="1" 
                keyboardType="number-pad" 
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                editable={!loading}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}

          {category === 'books' && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Genre / Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGenre(g)}
                    className={`px-3 py-2 rounded-lg border ${genre === g ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`${genre === g ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Publish Button */}
          <TouchableOpacity 
            onPress={publish} 
            className={`py-3.5 rounded-lg items-center ${loading ? 'bg-gray-300' : 'bg-gray-900'}`} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">{loading ? 'Processing...' : 'Publish Listing'}</Text>
          </TouchableOpacity>
        </View>

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-2xl p-5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  className={`flex-row items-center p-4 mb-2 rounded-xl ${category === cat.value ? 'bg-gray-100' : 'bg-white'}`}
                  onPress={() => { setCategory(cat.value); setShowCategoryModal(false); }}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <Ionicons name={cat.icon as any} size={20} color="#374151" />
                  </View>
                  <Text className={`text-base ${category === cat.value ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{cat.label}</Text>
                  {category === cat.value && <Ionicons name="checkmark" size={20} color="#111827" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
              <View className="h-4" />
            </View>
          </View>
        </Modal>
      </ScrollView>
    )
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