import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { getDatabase, onValue, ref } from 'firebase/database'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const categoryIcons: { [key: string]: any } = {
  clothes: 'shirt-outline',
  books: 'book-outline',
  others: 'apps-outline', // Renamed from gadgets
  shoes: 'footsteps-outline',
  default: 'cube-outline',
}

// Mock data for new filters
const bookGenres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Textbook', 'Classic']
const shoeSizes = ['7', '8', '9', '10', '11', '12']

export default function Check() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const db = getDatabase()
    const usersRef = ref(db, 'users')
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      const allItems: any[] = []
      if (data) {
        Object.keys(data).forEach((userId) => {
          const user = data[userId]
          if (user.itemsPosted) {
            Object.keys(user.itemsPosted).forEach((itemId) => {
              allItems.push({
                id: itemId,
                sellerId: userId,
                ...user.itemsPosted[itemId],
              })
            })
          }
        })
      }
      setItems(allItems)
    })
    return () => unsubscribe()
  }, [])

  const types = useMemo(() => Array.from(new Set(items.map((i: any) => {
    if (i.type === 'gadgets') return 'others';
    return i.type;
  }).filter(Boolean))), [
    items,
  ])
  const sizes = useMemo(() => {
    const sizeOrder = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
    return Array.from(new Set(items.map((i: any) => i.size).filter(Boolean)))
      .sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a.toLowerCase());
        const bIndex = sizeOrder.indexOf(b.toLowerCase());
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
  }, [items])

  const params = useLocalSearchParams<{ category?: string }>()
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(params.category || null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedShoeSize, setSelectedShoeSize] = useState<string | null>(null)
  const [notify, setNotify] = useState(false)
  const [results, setResults] = useState<any[]>([])

  function checkProduct() {
    const q = query.trim().toLowerCase()
    const filtered = items.filter((it: any) => {
      const itemType = it.type === 'gadgets' ? 'others' : it.type;
      if (q && !it.title.toLowerCase().includes(q)) return false
      if (selectedType && itemType !== selectedType) return false
      if (selectedSize && it.size !== selectedSize) return false
      // Note: Genre and Shoe Size are not in DB.json, so filtering is for UI demonstration.
      // In a real app, you would filter by selectedGenre and selectedShoeSize against the data.
      
      // tags and notify not used for filtering in this simple example
      return true
    })
    setResults(filtered)
  }

  useEffect(() => {
    // If a category is pre-selected, run the search immediately
    if (params.category) {
      checkProduct();
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold mb-4">Find Product</Text>

      {/* Search */}
      <TextInput
        placeholder="EX. NSTP Shirt, Pe shirt"
        value={query}
        onChangeText={setQuery}
        className="border border-gray-200 rounded px-3 py-2 bg-white mb-4"
      />

      {/* Category */}
      <Text className="text-sm text-gray-600 mb-2">Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, marginBottom: 4 }}>
        {types.map((type: string) => (
          <TouchableOpacity key={type} onPress={() => setSelectedType(selectedType === type ? null : type)} className="items-center mr-4">
            <View className={`w-16 h-16 rounded-2xl items-center justify-center ${selectedType === type ? 'bg-green-600' : 'bg-gray-100'}`}>
              <Ionicons name={categoryIcons[type] || categoryIcons.default} size={28} color={selectedType === type ? 'white' : 'black'} />
            </View>
            <Text className={`text-xs mt-2 capitalize ${selectedType === type ? 'font-bold text-green-700' : 'text-gray-600'}`}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conditional Filters */}
      {selectedType === 'clothes' && (
        <>
          <Text className="text-sm text-gray-600 mb-2">Size</Text>
          <View className="flex-row flex-wrap mb-4">
            {sizes.length ? sizes.map((s: string) => (
              <TouchableOpacity key={s} onPress={() => setSelectedSize((c) => (c === s ? null : s))} className={`mr-2 mb-2 px-3 py-2 rounded-full ${selectedSize === s ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Text className={`uppercase ${selectedSize === s ? 'text-white' : 'text-gray-700'}`}>{s}</Text>
              </TouchableOpacity>
            )) : <Text className="text-sm text-gray-500">No sizes available</Text>}
          </View>
        </>
      )}

      {selectedType === 'books' && (
        <>
          <Text className="text-sm text-gray-600 mb-2">Genre</Text>
          <View className="flex-row flex-wrap mb-4">
            {bookGenres.map((genre: string) => (
              <TouchableOpacity key={genre} onPress={() => setSelectedGenre((g) => (g === genre ? null : genre))} className={`mr-2 mb-2 px-3 py-2 rounded-full ${selectedGenre === genre ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Text className={`${selectedGenre === genre ? 'text-white' : 'text-gray-700'}`}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedType === 'shoes' && (
        <>
          <Text className="text-sm text-gray-600 mb-2">Size (US)</Text>
          <View className="flex-row flex-wrap mb-4">
            {shoeSizes.map((size: string) => (
              <TouchableOpacity key={size} onPress={() => setSelectedShoeSize((s) => (s === size ? null : s))} className={`mr-2 mb-2 px-3 py-2 rounded-full ${selectedShoeSize === size ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Text className={`${selectedShoeSize === size ? 'text-white' : 'text-gray-700'}`}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedType === 'others' && (
        <View className="mb-4" />
      )}

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
    </SafeAreaView>
  )
}
