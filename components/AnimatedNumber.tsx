import { useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";

// Counts up (or down) to a new value instead of jumping instantly —
// use for any score/coin/streak number that changes.
export default function AnimatedNumber({
  value,
  style,
  duration = 600,
}: {
  value: number;
  style?: any;
  duration?: number;
}) {
  const animValue = useRef(new Animated.Value(value)).current;
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const listener = animValue.addListener(({ value: v }) =>
      setDisplayValue(Math.round(v)),
    );
    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayValue}</Text>;
}
