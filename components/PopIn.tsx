import { useEffect, useRef } from "react";
import { Animated } from "react-native";

// A quick spring-scale entrance with a little overshoot — great for
// result text, badges, or anything that should feel like it "lands"
// rather than just appearing. Change `trigger` to replay the pop
// (e.g. pass the current word/round index).
export default function PopIn({
  children,
  trigger,
  style,
}: {
  children: React.ReactNode;
  trigger: any;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    scale.setValue(0.4);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 14,
    }).start();
  }, [trigger]);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}
