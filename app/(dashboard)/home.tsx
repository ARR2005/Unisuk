import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import backgroundBlack from "../../assets/images/bg_dark.png";
import backgroundWhite from "../../assets/images/bg_white.png";
import Layout from '../../components/Layout';
import { carouselItems } from '../../constants/carouselItems';
import { categories } from '../../constants/category';

const { width } = Dimensions.get('window')

const Home = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollRef = useRef<ScrollView | null>(null)
    const [selectedItem, setSelectedItem] = useState<any | null>(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [itemsMap, setItemsMap] = useState<{ [key: string]: any }>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
      const db = getDatabase()
      const usersRef = ref(db, 'users')
      const unsubscribe = onValue(usersRef, (snapshot) => {
        const data = snapshot.val()
        const allItems: any[] = []
        const map: { [key: string]: any } = {}

        if (data) {
          Object.keys(data).forEach((userId) => {
            const user = data[userId]
            if (user.itemsPosted) {
              Object.keys(user.itemsPosted).forEach((itemId) => {
                const item = {
                  id: itemId,
                  sellerId: userId,
                  ...user.itemsPosted[itemId],
                }
                allItems.push(item)
                map[itemId] = item
              })
            }
          })
        }
        // Sort by newest first (assuming createdAt exists, otherwise default sort)
        allItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setProducts(allItems)
        setItemsMap(map)
      })

      return () => unsubscribe()
    }, [])

    function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x
    const idx = Math.round(x / width)
    setActiveIndex(idx)
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? p.type === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Layout>
        <ImageBackground source={isDark ? backgroundBlack : backgroundWhite} style={{ flex: 1 }}>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96  }}>
            {/* Search Bar */}
            <View className="px-5 mt-4">
              <TextInput
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>

            {/* Carousel */}
            <View className="mt-4 mb-2">
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={44}
                ref={scrollRef}>
                {carouselItems.map((c: any, idx: number) => (
                  <View key={idx} style={{ width }} className="px-5">
                    <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl h-48 overflow-hidden shadow-md ${isDark ? 'border border-gray-700' : 'border border-gray-100'}`}>
                      {c.image_uri ? (
                        <Image source={{ uri: c.image_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View className={`flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} items-center justify-center`}>
                          <Ionicons name="image-outline" size={48} color={isDark ? '#6B7280' : '#D1D5DB'} />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Dots */}
              <View className="flex-row items-center justify-center mt-4">
                {carouselItems.map((_, i) => (
                  <View
                    key={i}
                    className={`mx-1.5 ${i === activeIndex ? (isDark ? 'bg-white' : 'bg-gray-900') : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}
                    style={{ width: i === activeIndex ? 10 : 6, height: 6, borderRadius: 3 }}
                  />
                ))}
              </View>
            </View>

              {/* Categories */}
              <View className="mt-6 mb-6">
                <Text className={`text-lg font-bold ml-5 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16  }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className="items-center mr-6"
                      onPress={() => setSelectedCategory(selectedCategory === cat.type ? null : cat.type)}
                    >
                      <View className={`w-16 h-16 ${selectedCategory === cat.type ? 'bg-green-600' : (isDark ? 'bg-gray-800' : 'bg-white')} rounded-full items-center justify-center shadow-md ${isDark ? 'border border-gray-700' : 'border border-gray-100'}`}>
                        <Ionicons name={cat.icon as any} size={28} color={selectedCategory === cat.type ? '#fff' : (isDark ? '#fff' : '#000')} />
                      </View>
                      <Text className={`text-xs mt-2.5 ${selectedCategory === cat.type ? 'text-green-600 font-bold' : (isDark ? 'text-gray-300' : 'text-gray-800')} font-medium text-center`}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
  
              {/* Product grid */}
              <View className="px-3 pb-6">
                <Text className={`text-lg font-bold mb-4 ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {searchQuery ? `Search Results (${filteredProducts.length})` : 'Available Items'}
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {filteredProducts.map((p) => (
                    <View key={p.id} className="flex-1 min-w-[45%] max-w-[48%]">
                      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-sm ${isDark ? 'border border-gray-700' : 'border border-gray-100'}`}>
                        <View className={isDark ? 'bg-gray-700' : 'bg-gray-100'} style={{ aspectRatio: 1 }}>
                          {p.image_uri ? (
                            <Image source={{ uri: p.image_uri }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <Ionicons name="image-outline" size={40} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
                            </View>
                          )}
                        </View>
  
                        <View className="p-3">
                          <Text className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={2}>{p.title}</Text>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>₱{p.price}</Text>
  
                          <View className="mt-3 gap-2">
                            <TouchableOpacity
                              className={`w-full ${isDark ? 'bg-green-500' : 'bg-gray-900'} px-3 py-2.5 rounded-lg ${isDark ? 'active:bg-green-600' : 'active:bg-gray-800'}`}
                              onPress={() => {
                                setSelectedItem(itemsMap[p.id]);
                                setModalVisible(true);
                              }}
                            >
                              <Text className="text-white text-xs text-center font-semibold">View Details</Text>
                            </TouchableOpacity>
  
                            <TouchableOpacity
                              className={`w-full ${isDark ? 'border border-gray-600' : 'border border-gray-300'} px-3 py-2.5 rounded-lg ${isDark ? 'active:bg-gray-700' : 'active:bg-gray-50'}`}
                              onPress={() => {
                                router.push({ pathname: '/(pill)/buy', params: { itemId: p.id, sellerId: p.sellerId } } as any);
                              }}
                            >
                              <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-xs text-center font-semibold`}>Purchase</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
          </ScrollView>
        </ImageBackground>
      </Layout>

    {/* Item Details Modal */}
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl p-6`} style={{ maxHeight: '85%' }}>
          <View className="flex-row justify-between items-start mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex-1 mr-4`}>{selectedItem?.title}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
              <Ionicons name="close" size={26} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
            {selectedItem?.image_uri ? (
              <Image source={{ uri: selectedItem.image_uri }} style={{ width: '100%', height: 240 }} resizeMode="cover" className="rounded-lg mb-4" />
            ) : null}

            <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{selectedItem?.description}</Text>

            {selectedItem?.support_images?.length ? (
              <View className="mb-4">
                <Text className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>More Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedItem.support_images.map((uri: string, i: number) => (
                    <Image key={i} source={{ uri }} style={{ width: 120, height: 120, marginRight: 10, borderRadius: 8 }} resizeMode="cover" />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-t pt-4 mt-4`}>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>₱{selectedItem?.price}</Text>
              <View className="gap-3">
                <TouchableOpacity className={`w-full ${isDark ? 'bg-green-500 active:bg-green-600' : 'bg-gray-900 active:bg-gray-800'} px-4 py-3.5 rounded-lg`}>
                  <Text className="text-white text-center font-semibold">Purchase Now</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`w-full ${isDark ? 'border border-gray-600 active:bg-gray-700' : 'border border-gray-300 active:bg-gray-50'} px-4 py-3.5 rounded-lg`}>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-center font-semibold`}>Message Seller</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  )
}

export default Home;
