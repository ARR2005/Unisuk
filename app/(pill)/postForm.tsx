import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function PostForm() {
  const params = useLocalSearchParams()
  const photo = typeof params.photo === 'string' ? params.photo : undefined
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagText, setTagText] = useState('')

  function addTag() {
    const t = tagText.trim()
    if (!t) return
    setTags((s) => [...s, t])
    setTagText('')
  }

  function publish() {
    // For now just log and go back
    console.log({ title, price, description, tags, photo })
    router.back()
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold mb-4">Create Listing</Text>

      <View className="mb-4">
        <View className="bg-gray-100 rounded-lg h-56 overflow-hidden items-center justify-center">
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">No photo</Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-sm text-gray-600">Product Title</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Product Title" className="border border-gray-200 rounded px-3 py-2 mb-3" />

      <Text className="text-sm text-gray-600">Price</Text>
      <TextInput value={price} onChangeText={setPrice} placeholder="₱ 0.00" keyboardType="numeric" className="border border-gray-200 rounded px-3 py-2 mb-3" />

      <Text className="text-sm text-gray-600">Description</Text>
      <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline className="border border-gray-200 rounded px-3 py-2 mb-3 h-24" />

      <Text className="text-sm text-gray-600">Tags</Text>
      <View className="flex-row items-center mb-3">
        <TextInput value={tagText} onChangeText={setTagText} placeholder="Tag" className="flex-1 border border-gray-200 rounded px-3 py-2 mr-2" />
        <TouchableOpacity onPress={addTag} className="bg-gray-800 px-3 py-2 rounded">
          <Text className="text-white">Add</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap mb-6">
        {tags.map((t, i) => (
          <View key={i} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
            <Text className="text-sm">{t}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={publish} className="bg-black py-3 rounded items-center">
        <Text className="text-white font-medium">Publish Listing</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
