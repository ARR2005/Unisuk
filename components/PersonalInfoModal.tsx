import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: (data?: any) => void;
  loading?: boolean;
}

export function PersonalInfoModal({ visible, onClose, loading = false }: PersonalInfoModalProps) {
  const [fullName, setFullName] = useState('');
  const [studentID, setStudentID] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!studentID.trim()) {
      newErrors.studentID = 'Student ID is required';
    } else if (!/^\d{2}-\d{4}-\d{3}$/.test(studentID)) {
      newErrors.studentID = 'Format: XX-XXXX-XXX';
    }

    if (!enrollmentNo.trim()) {
      newErrors.enrollmentNo = 'Enrollment number is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onClose({
        name: fullName,
        studentID,
        enrollmentNo,
        phone,
        bio,
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1">
          <View className="px-5 pt-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</Text>
            <Text className="text-sm text-gray-600 mb-6">
              Please fill in your personal information to get started.
            </Text>

            {/* Full Name */}
            <View className="mb-5">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
              {errors.fullName && <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>}
            </View>

            {/* Student ID */}
            <View className="mb-5">
              <Label htmlFor="studentid">Student ID (XX-XXXX-XXX)</Label>
              <Input
                id="studentid"
                placeholder="12-3456-789"
                value={studentID}
                onChangeText={setStudentID}
                editable={!loading}
              />
              {errors.studentID && <Text className="text-red-500 text-xs mt-1">{errors.studentID}</Text>}
            </View>

            {/* Enrollment Number */}
            <View className="mb-5">
              <Label htmlFor="enrollno">Enrollment Number</Label>
              <Input
                id="enrollno"
                placeholder="Enter your enrollment number"
                value={enrollmentNo}
                onChangeText={setEnrollmentNo}
                editable={!loading}
              />
              {errors.enrollmentNo && <Text className="text-red-500 text-xs mt-1">{errors.enrollmentNo}</Text>}
            </View>

            {/* Phone Number */}
            <View className="mb-5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+63 9XX XXX XXXX"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
              {errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
            </View>

            {/* Bio (Optional) */}
            <View className="mb-6">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <TextInput
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                editable={!loading}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                style={{ textAlignVertical: 'top' }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`py-3.5 rounded-lg items-center ${loading ? 'bg-gray-300' : 'bg-green-500'}`}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  {loading ? 'Saving...' : 'Save Profile'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onClose()}
                disabled={loading}
                className="py-3.5 rounded-lg items-center bg-gray-200"
                activeOpacity={0.8}
              >
                <Text className="text-gray-800 font-semibold text-base">Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
