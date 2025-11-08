import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const ReviewUploadScreen = () => {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="sticky top-0 z-10 flex-row items-center border-b border-border-light dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
          <MaterialIcons name="arrow-back" size={24} className="text-text-light dark:text-text-dark" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-text-light dark:text-text-dark">Review & Upload</Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1 px-4 pt-6 pb-28">
        <View className="mx-auto max-w-2xl">
          <View>
            <Text className="text-text-light dark:text-text-dark mb-3 text-lg font-bold">Final Diagnosis Summary</Text>
            <View className="rounded-xl border border-border-light dark:border-border-dark bg-component-light dark:bg-component-dark px-4">
              <View className="flex-row justify-between py-5 border-b border-b-border-light dark:border-b-border-dark">
                <Text className="text-text-muted-light dark:text-text-muted-dark text-sm">Diagnosis Code</Text>
                <Text className="text-text-light dark:text-text-dark text-sm">F80.0 - Phonological Disorder</Text>
              </View>
              <View className="flex-row justify-between py-5 border-b border-b-border-light dark:border-b-border-dark">
                <Text className="text-text-muted-light dark:text-text-muted-dark text-sm">Severity Level</Text>
                <Text className="text-text-light dark:text-text-dark text-sm">Moderate</Text>
              </View>
              <View className="flex-row justify-between py-5">
                <Text className="text-text-muted-light dark:text-text-muted-dark text-sm">Phonetic Errors</Text>
                <Text className="text-text-light dark:text-text-dark text-sm">/s/, /z/, /tʃ/</Text>
              </View>
            </View>
          </View>
          <View className="mt-8">
            <Text className="text-text-light dark:text-text-dark mb-3 text-lg font-bold">Final Session Notes</Text>
            <TextInput
              className="w-full rounded-xl border border-border-light bg-component-light px-4 py-3 text-base text-text-light placeholder:text-text-muted-light dark:border-border-dark dark:bg-component-dark dark:text-text-dark dark:placeholder:text-text-muted-dark min-h-36"
              placeholder="Add any concluding observations..."
              multiline
            />
          </View>
          <View className="mt-8 rounded-xl border border-border-light dark:border-border-dark bg-component-light dark:bg-component-dark p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-text-light dark:text-text-dark text-base font-medium">Require Biometric Authentication</Text>
                <TouchableOpacity>
                  <MaterialIcons name="help-outline" size={20} className="text-text-muted-light dark:text-text-muted-dark" />
                </TouchableOpacity>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#137fec' }}
                thumbColor={isBiometricEnabled ? '#f4f3f4' : '#f4f3f4'}
                onValueChange={() => setIsBiometricEnabled(previousState => !previousState)}
                value={isBiometricEnabled}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 z-10 bg-background-light/80 p-4 backdrop-blur-sm dark:bg-background-dark/80">
        <View className="mx-auto max-w-2xl">
          <Link href="/home" asChild>
            <TouchableOpacity className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary px-6">
              <MaterialIcons name="cloud-upload" size={24} className="text-white" />
              <Text className="text-base font-bold text-white">Upload Data to Cloud</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReviewUploadScreen;
