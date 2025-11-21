import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DB = require('../../../DB.json');

export default function PillBuy() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const item = useMemo(() => DB.items?.[id as string] || null, [id]);

  const transactionFee = Number(DB.transaction_fee ?? 5);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Item not found</Text>
      </View>
    );
  }

  const price = Number(item.price || 0);
  const appliedFee = Math.max(0, Number(transactionFee) || 0);
  const total = Math.max(0, price + appliedFee - discount).toFixed(2);

  function applyCoupon() {
    const code = (couponCode || '').toString().trim();
    if (!code) {
      setDiscount(0);
      Alert.alert('Coupon', 'Please enter a coupon code');
      return;
    }

    const coupons = DB.coupons || {};
    const found = coupons[code.toUpperCase()] ?? coupons[code.toLowerCase()];
    if (found) {
      const amount = Number(found) || 0;
      setDiscount(amount);
      Alert.alert('Coupon applied', `Discount ₱ ${amount} applied`);
    } else {
      setDiscount(0);
      Alert.alert('Invalid coupon', 'Coupon not found');
    }
  }

  function confirmPurchase() {
    Alert.alert('Purchase confirmed', `You bought ${item.title} for ₱ ${total} (including ₱${transactionFee} transaction fee)`, [
      { text: 'OK', onPress: () => router.replace('/(dashboard)' as any) }
    ]);
  }

  function contactSeller() {
    router.push({ pathname: '/(pill)/chat/[id]', params: { id } } as any);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 48 }}>
      <View className="px-4 pt-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Buy</Text>
        </View>

        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
        ) : (
          <View className="w-full h-56 bg-gray-100 rounded-lg items-center justify-center">
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          </View>
        )}

        <Text className="text-lg font-semibold mt-4">{item.title}</Text>
        <Text className="text-sm text-gray-700 mt-2">{item.description}</Text>

        <View className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Text className="font-medium">Pick-up method</Text>
          <Text className="text-sm text-gray-600 mt-1">On-campus pick-up</Text>
        </View>

        <View className="mt-4">
          <Text className="font-medium">Transaction details</Text>

          <View className="mt-3">
            <Text className="text-sm text-gray-600">Product price</Text>
            <Text className="text-lg font-semibold">₱ {price.toFixed(2)}</Text>
          </View>

          <View className="mt-3">
            <Text className="text-sm text-gray-600">Transaction fee</Text>
            <Text className="text-lg font-semibold">₱ {appliedFee.toFixed(2)}</Text>
          </View>

          <View className="mt-3">
            <Text className="text-sm text-gray-600">Coupon code</Text>
            <View className="flex-row mt-2">
              <TextInput
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter coupon"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-l-md"
              />
              <TouchableOpacity className="px-4 py-2 bg-black rounded-r-md" onPress={applyCoupon}>
                <Text className="text-white">Apply</Text>
              </TouchableOpacity>
            </View>
            {discount > 0 ? (
              <Text className="mt-2 text-sm text-green-600">Discount: ₱ {discount}</Text>
            ) : null}
          </View>
        </View>

        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="font-medium mb-2">Receipt</Text>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Item price</Text>
            <Text className="text-sm">₱ {price.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-600">Transaction fee</Text>
            <Text className="text-sm">₱ {appliedFee.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-600">Discount</Text>
            <Text className="text-sm">- ₱ {discount.toFixed(2)}</Text>
          </View>

          <View className="border-t border-gray-200 my-3" />
        </View>

        <View className="mt-4 p-4 bg-white rounded-lg items-center">
          <Text className="text-sm text-gray-600">Total</Text>
          <Text className="text-2xl font-bold">₱ {total}</Text>
        </View>

        <View className="mt-6">
          <TouchableOpacity className="w-full bg-green-600 px-4 py-3 rounded-md mb-3" onPress={confirmPurchase}>
            <Text className="text-center text-white font-medium">Confirm Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-full border border-gray-200 px-4 py-3 rounded-md" onPress={contactSeller}>
            <Text className="text-center text-gray-800 font-medium">Contact Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}