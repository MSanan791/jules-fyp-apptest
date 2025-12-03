import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUpScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
      <View>
        <Text className="text-2xl text-text-light dark:text-text-dark">Sign Up Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
