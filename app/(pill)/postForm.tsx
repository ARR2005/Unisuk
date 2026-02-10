import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

// Get default tags for item type
const getDefaultTags = (itemClass: string): string[] => {
  if (!itemClass || itemClass === 'Unknown') {
    return []
  }
  return [itemClass.toLowerCase().replace(/\s+/g, '')]
}

// Image recognition function using detection data
const recognizeImage = (itemClass?: string, confidence?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = itemClass || 'Unknown'
      const desc = getStaticDescription(item)
      const price = getDefaultPrice(item)
      const tags = getDefaultTags(item)
      const title = item === 'Unknown' ? '' : item
      resolve({
        title: title,
        price: price,
        description: desc,
        tags: tags,
      })
    }, 3000) // Simulate network delay
  })
}

export default function PostForm() {
  const params = useLocalSearchParams()
  const photo = typeof params.photo === 'string' ? params.photo : undefined
  const detectionClass = typeof params.detectionClass === 'string' ? params.detectionClass : undefined
  const detectionConfidence = typeof params.detectionConfidence === 'string' ? params.detectionConfidence : undefined
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagText, setTagText] = useState('')

  const addTag = () => {
    const t = tagText.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagText('')
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
      if (data.error) {
        throw new Error(data.error.message)
      }

      console.log('Cloudinary Upload Success:', data.secure_url)
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
      const imageUrl = photo ? await uploadImageToCloudinary(photo) : null
      console.log('Image uploaded to Cloudinary:', imageUrl)

      const db = getDatabase()
      const newItemRef = push(ref(db, `users/${user.uid}/itemsPosted`))

      await set(newItemRef, {
        title: title || '',
        image_uri: imageUrl || null,
        description: description || '',
        support_images: [],
        price: parseFloat(price) || 0,
        type: tags.length > 0 ? tags[0] : 'miscellaneous',
        quantity: 1,
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

  useEffect(() => {
    console.log('Cloudinary Config Status:', { hasCloudName: !!CLOUDINARY_CLOUD_NAME, hasPreset: !!CLOUDINARY_UPLOAD_PRESET })
    if (photo) {
      setLoading(true)
      recognizeImage(detectionClass, detectionConfidence).then((mockData: any) => {
        setTitle(mockData.title)
        setPrice(mockData.price)
        setDescription(mockData.description)
        setTags(mockData.tags)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [photo, detectionClass, detectionConfidence])

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Create Listing</Text>

        {/* Product Image */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-3">Product Photo</Text>
          <View className="bg-gray-100 rounded-xl h-64 overflow-hidden items-center justify-center border-2 border-dashed border-gray-300">
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View className="items-center justify-center gap-2">
                <Text className="text-gray-400 text-base">No photo selected</Text>
              </View>
            )}
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

        {/* Tags Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Tags</Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-h-14 flex-row flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setTags(tags.filter((t) => t !== tag))}
                className="bg-blue-100 rounded-full px-3 py-1 flex-row items-center gap-1.5"
              >
                <Text className="text-sm text-blue-700 font-medium">{tag}</Text>
                <Text className="text-xs text-blue-600 font-bold">✕</Text>
              </Pressable>
            ))}
            <TextInput
              value={tagText}
              onChangeText={setTagText}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
              className="flex-1 py-2 text-base"
              style={{ minWidth: 100 }}
              editable={!loading}
              placeholderTextColor="#D1D5DB"
            />
          </View>
          <Text className="text-xs text-gray-500 mt-2">Press enter to add tags</Text>
        </View>

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
    </ScrollView>
  )
}
