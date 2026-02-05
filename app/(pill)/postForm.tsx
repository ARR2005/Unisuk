import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'


const getStaticDescription = (itemClass: string): string => {
  const descriptions: { [key: string]: string } = {
    'Pe shirt': 'Pe shirt. Add more description',
    'Pe pant': 'Pe pant. Add more description',
    'Skirt': 'Skirt. Add more description.',
    'White Shirt': 'White Shirt. Add more description.',
    'UC VEST': 'UC Vest. Add more description.',
  }
  return descriptions[itemClass] || descriptions['Unknown']
}

const getDefaultPrice = (itemClass: string): string => {
  const prices: { [key: string]: string } = {
    'Pe shirt': '250',
    'Pe pant': '350',
    'Skirt': '400',
    'White Shirt': '300',
    'UC VEST': '500',
  }
  return prices[itemClass] || '0'
}


const getDefaultTags = (itemClass: string): string[] => {
  if (!itemClass || itemClass === 'Unknown') {
    return []
  }
  return [itemClass.toLowerCase().replace(/\s+/g, '')]
}


const recognizeImage = (itemClass?: string, confidence?: string) => {
  return new Promise((itemInfo) => {
    setTimeout(() => {
      const item = itemClass || 'Unknown'
      const desc = getStaticDescription(item)
      const price = getDefaultPrice(item)
      const tags = getDefaultTags(item)
      const title = item === 'Unknown' ? '' : item
      itemInfo({
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

  function publish() {
    // For now just log and go back
    console.log({ title, price, description, tags, photo })
    router.back()
  }

  useEffect(() => {
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
