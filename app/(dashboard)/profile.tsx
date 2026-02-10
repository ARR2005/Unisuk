import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Image, Modal, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Layout from '../../components/Layout'
import { logout as firebaseLogout } from '../../firebaseConfig'
 
const DB = require('../../DB.json')
const userProducts = Object.values(DB.items || {})

// Mock user data. Ideally, this would come from your DB.json file.
const mockUser = {
  id: 'user1',
  name: 'Alex Doe',
  username: '@alexdoe',
  email: 'alex.doe@university.edu',
  // Using a more consistent placeholder image service
  profile_pic_uri: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=500',
  listings_count: 12,
  sold_count: 28,
  following_count: 56,
  is_verified: true,
  transaction_success_rate: 98,
  avg_response_time_hours: 2,
}

const ProfileStat = ({ label, value }: { label: string; value: number }) => (
  <View className="items-center">
    <Text className="text-lg font-bold">{value}</Text>
    <Text className="text-sm text-gray-500">{label}</Text>
  </View>
)

const SafetyStat = ({ icon, label, value, isVerified }: { icon: any; label: string; value: string; isVerified?: boolean }) => (
  <View className="flex-row items-center py-2.5">
    <Ionicons name={icon} size={20} color={isVerified ? '#22C55E' : '#4B5563'} />
    <Text className="ml-3 flex-1 text-gray-700">{label}</Text>
    <Text className={`font-semibold ${isVerified ? 'text-green-600' : 'text-gray-800'}`}>
      {value}
    </Text>
  </View>
);

const AccordionItem = ({
  title,
  icon,
  children,
  isOpen,
  onPress,
}: {
  title: string
  icon: any
  children: React.ReactNode
  isOpen: boolean
  onPress: () => void
}) => (
  <View className="border-b border-gray-100">
    <TouchableOpacity onPress={onPress} className="flex-row items-center p-4">
      <Ionicons name={icon} size={22} color="#4B5563" />
      <Text className="flex-1 ml-4 text-base text-gray-800">{title}</Text>
      <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={20} color="#9CA3AF" />
    </TouchableOpacity>
    {isOpen && <View className="p-4 bg-gray-50">{children}</View>}
  </View>
)

const Profile = () => {
  const router = useRouter()
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key)
  }

  const handleLogout = async () => {
    setLogoutModalVisible(false)
    try {
      await firebaseLogout()
      router.replace('/(auth)/login')
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  return (
    <Layout>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="items-center pt-10">
          <Image
            source={{ uri: mockUser.profile_pic_uri }}
            className="w-24 h-24 rounded-full"
          />
          <Text className="text-xl font-bold mt-4">{mockUser.name}</Text>
          <Text className="text-sm text-gray-500">{mockUser.username}</Text>
        </View>
  
        {/* Menu */}
        <View className="px-4">
          <AccordionItem title="Trust & Safety Metrics" icon="shield-checkmark-outline" isOpen={openAccordion === 'metrics'} onPress={() => toggleAccordion('metrics')}>
            <View className="divide-y divide-gray-100">
              <SafetyStat icon="checkmark-circle" label="Identity Verified" value={mockUser.is_verified ? 'Verified' : 'Not Verified'} isVerified={mockUser.is_verified} />
              <SafetyStat icon="swap-horizontal" label="Transaction Success" value={`${mockUser.transaction_success_rate}%`} />
              <SafetyStat icon="time-outline" label="Avg. Response Time" value={`~${mockUser.avg_response_time_hours} hours`} />
            </View>
          </AccordionItem>

          <AccordionItem title="My Listings" icon="list-outline" isOpen={openAccordion === 'listings'} onPress={() => toggleAccordion('listings')}>
            <View>
              {userProducts.slice(0, 3).map((item: any) => (
                <View key={item.id} className="flex-row items-center mb-3 p-2 bg-white rounded-lg">
                  <Image source={{ uri: item.image_uri }} className="w-12 h-12 rounded-md" />
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-sm text-gray-600">₱ {item.price}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity className="mt-2">
                <Text className="text-center text-green-600 font-semibold">View All Listings</Text>
              </TouchableOpacity>
            </View>
          </AccordionItem>

          <AccordionItem title="Edit Profile" icon="person-outline" isOpen={openAccordion === 'editProfile'} onPress={() => toggleAccordion('editProfile')}>
            <View className="space-y-4">
              <TextInput defaultValue={mockUser.name} placeholder="Full Name" className="bg-white p-3 rounded-md border border-gray-200" />
              <TextInput defaultValue={mockUser.username} placeholder="Username" className="bg-white p-3 rounded-md border border-gray-200" />
              <TextInput defaultValue={mockUser.email} placeholder="Email" keyboardType="email-address" className="bg-white p-3 rounded-md border border-gray-200" />
              <TouchableOpacity className="bg-green-600 p-3 rounded-md mt-2">
                <Text className="text-white text-center font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </AccordionItem>

          <AccordionItem title="Settings" icon="settings-outline" isOpen={openAccordion === 'settings'} onPress={() => toggleAccordion('settings')}>
            <View>
              <View className="flex-row justify-between items-center p-2">
                <Text className="text-base">Dark Mode</Text>
                <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: '#767577', true: '#81b0ff' }} thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'} />
              </View>
              <TouchableOpacity className="flex-row justify-between items-center p-2 mt-2">
                <Text className="text-base">Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </AccordionItem>

          <AccordionItem title="Help & Support" icon="help-circle-outline" isOpen={openAccordion === 'help'} onPress={() => toggleAccordion('help')}>
            <Text className="text-gray-600">For any help or support, please email us at support@unisuk.com.</Text>
          </AccordionItem>

          <View className="mt-4">
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={() => setLogoutModalVisible(true)}
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text className="flex-1 ml-4 text-base text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent={true} animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <Pressable className="absolute inset-0" onPress={() => setLogoutModalVisible(false)} />
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-center">Logout</Text>
            <Text className="text-base text-gray-600 text-center my-4">
              Are you sure you want to log out?
            </Text>
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-lg"
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text className="text-center font-semibold text-gray-800">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 p-3 rounded-lg"
                onPress={handleLogout}
              >
                <Text className="text-center font-semibold text-white">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  )
}

export default Profile
