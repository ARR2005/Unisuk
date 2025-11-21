import React, { useMemo, useState } from 'react'
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const DB = require('DB.json')

export default function Check() {
  const items = useMemo(() => Object.values(DB.items || {}), [])

  const types = useMemo(() => Array.from(new Set(items.map((i: any) => i.type).filter(Boolean))), [items])
  const sizes = useMemo(() => Array.from(new Set(items.map((i: any) => i.size).filter(Boolean))), [items])

  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [notify, setNotify] = useState(false)
  const [tagText, setTagText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])

  function addTag() {
    const t = tagText.trim()
    if (!t) return
    setTags((s) => [...s, t])
    setTagText('')
  }

  function checkProduct() {
    const q = query.trim().toLowerCase()
    const filtered = items.filter((it: any) => {
      if (q && !it.title.toLowerCase().includes(q)) return false
      if (selectedType && it.type !== selectedType) return false
      if (selectedSize && it.size !== selectedSize) return false
      // tags and notify not used for filtering in this simple example
      return true
    })
    setResults(filtered)
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold mb-4">Find Product</Text>

      {/* Search */}
      <TextInput
        placeholder="EX. NSTP Shirt, Pc pants"
        value={query}
        onChangeText={setQuery}
        className="border border-gray-200 rounded px-3 py-2 bg-white mb-4"
      />

      {/* Optional (chips) */}
      <Text className="text-sm text-gray-600 mb-2">Category</Text>
      <View className="flex-row mb-4">
        {types.map((t: string) => (
          <TouchableOpacity
            key={t}
            onPress={() => setSelectedType((s) => (s === t ? null : t))}
            className={`mr-2 px-3 py-2 rounded-full ${selectedType === t ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Text className={`${selectedType === t ? 'text-white' : 'text-gray-700'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm text-gray-600 mb-2">Size</Text>
      <View className="flex-row mb-4">
        {sizes.length ? sizes.map((s: string) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSelectedSize((c) => (c === s ? null : s))}
            className={`mr-2 px-3 py-2 rounded-full ${selectedSize === s ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Text className={`${selectedSize === s ? 'text-white' : 'text-gray-700'}`}>{s}</Text>
          </TouchableOpacity>
        )) : (
          <Text className="text-sm text-gray-500">No sizes available</Text>
        )}
      </View>

      {/* Notification */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm">Notify if available</Text>
        <Switch value={notify} onValueChange={setNotify} />
      </View>

      {/* Tags */}
      <Text className="text-sm text-gray-600 mb-2">Tags</Text>
      <View className="flex-row items-center mb-4">
        <TextInput
          placeholder="Add tag"
          value={tagText}
          onChangeText={setTagText}
          className="flex-1 border border-gray-200 rounded px-3 py-2 mr-2"
        />
        <TouchableOpacity onPress={addTag} className="bg-gray-800 px-3 py-2 rounded">
          <Text className="text-white">Add</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap mb-4">
        {tags.map((t, i) => (
          <View key={i} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
            <Text className="text-sm text-gray-700">{t}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={checkProduct} className="bg-black rounded py-3 items-center mb-6">
        <Text className="text-white font-medium">Check Product</Text>
      </TouchableOpacity>

      {/* Results */}
      <Text className="text-lg font-semibold mb-3">Results ({results.length})</Text>
      <View>
        {results.map((r: any) => (
          <View key={r.title} className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-gray-100 rounded mr-3 overflow-hidden">
              {r.image_uri ? (
                <Image source={{ uri: r.image_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-gray-400">No image</Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="font-medium">{r.title}</Text>
              <Text className="text-sm text-gray-600">₱ {r.price}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
