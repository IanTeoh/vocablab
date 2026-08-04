import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, ViewStyle } from "react-native";

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function PressableScale({
  children,
  style,
  onPress,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
