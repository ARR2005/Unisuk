import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window')

const DB = require('../../DB.json');

const carouselItems = Object.values(DB.items).slice(0,3);

const categories = [
  { id: 'cat1', label: 'Shoes', icon: 'walk' },
  { id: 'cat2', label: 'Gadgets', icon: 'hardware-chip' },
  { id: 'cat3', label: 'Clothing', icon: 'shirt' },
  { id: 'cat4', label: 'Books', icon: 'book' },
  { id: 'cat5', label: 'Medical', icon: 'medkit' },
]

const products = Object.entries(DB.items).map(([key, item]: any) => ({
  id: key,
  title: item.title,
  image_uri: item.image_uri,
  price: item.price,
  description: item.description,
  support_images: item.support_images || [],
}))

const itemsMap: Record<string, any> = DB.items;

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<ScrollView | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const router = useRouter();

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x
    const idx = Math.round(x / width)
    setActiveIndex(idx)
  }

  return (
    <>
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 96 }}>
      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold mb-4">UniSuki</Text>

        {/* Carousel */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={12}
            ref={scrollRef}
          >
            {carouselItems.map((c: any, idx: number) => (
              <View key={idx} style={{ width }} className="px-4">
                <View className="bg-gray-200 rounded-xl h-44 overflow-hidden">
                  {c.image_uri ? (
                    <Image source={{ uri: c.image_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="image-outline" size={42} color="#9CA3AF" />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dots */}
          <View className="flex-row items-center justify-center mt-3">
            {carouselItems.map((_, i) => (
              <View
                key={i}
                className={`mx-1 ${i === activeIndex ? 'bg-black' : 'bg-gray-300'}`}
                style={{ width: i === activeIndex ? 8 : 6, height: 6, borderRadius: 3 }}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mt-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
            {categories.map((cat) => (
              <View key={cat.id} className="items-center mr-4">
                <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name={cat.icon as any} size={20} color="#374151" />
                </View>
                <Text className="text-xs mt-2 text-gray-600">{cat.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Product grid */}
        <View className="mt-6 flex-row flex-wrap justify-between">
          {products.map((p) => (
            <View key={p.id} className="w-[48%] mb-4">
              <View className="bg-gray-100 rounded-lg h-40 overflow-hidden">
                {p.image_uri ? (
                  <Image source={{ uri: p.image_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View className="mt-3">
                <Text className="text-sm font-medium">{p.title}</Text>
                <Text className="text-sm font-bold mt-2">₱ {p.price}</Text>

                <View className="mt-2">
                  <TouchableOpacity
                    className="w-full bg-black px-3 py-2 rounded-md mb-2"
                    onPress={() => {
                      setSelectedItem(itemsMap[p.id]);
                      setModalVisible(true);
                    }}
                  >
                    <Text className="text-white text-xs text-center">Check Item</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                    onPress={() => {
                      // navigate to buy screen with item id
                      router.push({ pathname: '/(pill)/buy', params: { itemId: p.id } } as any);
                    }}
                  >
                    <Text className="text-xs text-center">Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>

    {/* Item Details Modal */}
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-xl p-4" style={{ maxHeight: '80%' }}>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">{selectedItem?.title}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-3">
            {selectedItem?.image_uri ? (
              <Image source={{ uri: selectedItem.image_uri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
            ) : null}

            <Text className="mt-3 text-sm text-gray-700">{selectedItem?.description}</Text>

            {selectedItem?.support_images?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                {selectedItem.support_images.map((uri: string, i: number) => (
                  <Image key={i} source={{ uri }} style={{ width: 100, height: 100, marginRight: 8 }} resizeMode="cover" />
                ))}
              </ScrollView>
            ) : null}

            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-lg font-bold">₱ {selectedItem?.price}</Text>
              <View className="flex-row">
                <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-md mr-2">
                  <Text className="text-white">Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 px-4 py-2 rounded-md">
                  <Text>Message Seller</Text>
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