import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DB = require('../../../DB.json');

export default function PillChatThread() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);

  const chatKey = id as string;
  const orig = DB.chats?.[chatKey] || { username: 'Unknown', overall_conversation: [] };

  const [messages, setMessages] = useState<Array<any>>(() => (orig.overall_conversation || []).slice());
  const [text, setText] = useState('');

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    const msg = { sender: 'You', message: text.trim(), timestamp: new Date().toISOString() };
    setMessages((s) => [...s, msg]);
    setText('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-medium">{orig.username}</Text>
        </View>

        <ScrollView ref={scrollRef} className="px-4 pt-4">
          {messages.map((m: any, i: number) => {
            const mine = m.sender === 'You';
            return (
              <View key={i} className={`mb-3 ${mine ? 'items-end' : 'items-start'}`}>
                <View className={`${mine ? 'bg-green-600' : 'bg-gray-200'} px-3 py-2 rounded-lg`} style={{ maxWidth: '80%' }}>
                  <Text className={`${mine ? 'text-white' : 'text-gray-800'}`}>{m.message}</Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleString()}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="px-4 pb-6 pt-3 bg-white">
          <View className="flex-row items-center">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write a message..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-l-md"
            />
            <TouchableOpacity onPress={send} className="bg-black px-4 py-2 rounded-r-md ml-2">
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
