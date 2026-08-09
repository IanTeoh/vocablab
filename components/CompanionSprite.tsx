import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

// Same swap-point pattern as PlantSprite — fill in a walk-cycle frame
// array once you have real pet illustrations, e.g.:
//   fox: [require("../assets/pets/fox-0.png"), require("../assets/pets/fox-1.png")]
export const COMPANION_IMAGES: Record<string, any[] | null> = {
  fox: null,
  rabbit: null,
  bird: null,
  squirrel: null,
  hedgehog: null,
  bee: null,
  owl: null,
  cat: null,
};

type Props = { id: string; size?: number };

export default function CompanionSprite({ id, size = 44 }: Props) {
  const bob = useRef(new Animated.Value(0)).current;
  const realFrames = COMPANION_IMAGES[id];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });
  const scaleY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });

  if (realFrames && realFrames.length > 0) {
    // Cycles through walk-cycle frames on the same bob timing.
    const frameIndex = bob.interpolate({
      inputRange: [0, 1],
      outputRange: [0, realFrames.length - 1],
    });
    return (
      <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
        <Image
          source={realFrames[0]}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.wrap, { transform: [{ translateY }, { scaleY }] }]}
    >
      <Svg width={size} height={size} viewBox="0 0 60 60">
        {renderCreature(id)}
      </Svg>
    </Animated.View>
  );
}

function renderCreature(id: string) {
  switch (id) {
    case "fox":
      return (
        <G>
          <Ellipse cx="30" cy="42" rx="16" ry="11" fill="#E8A94F" />
          <Ellipse cx="30" cy="46" rx="9" ry="6" fill="#FBEEDA" />
          <Circle cx="30" cy="26" r="11" fill="#E8A94F" />
          <Path d="M20 20 L16 8 L26 18 Z" fill="#E8A94F" />
          <Path d="M40 20 L44 8 L34 18 Z" fill="#E8A94F" />
          <Path d="M20 20 L18 12 L24 18 Z" fill="#3D2B1F" />
          <Path d="M40 20 L42 12 L36 18 Z" fill="#3D2B1F" />
          <Path d="M25 30 Q30 34 35 30" fill="#FBEEDA" />
          <Circle cx="25" cy="24" r="1.8" fill="#3D2B1F" />
          <Circle cx="35" cy="24" r="1.8" fill="#3D2B1F" />
          <Ellipse cx="30" cy="29" rx="2" ry="1.4" fill="#3D2B1F" />
          <Path d="M44 42 Q56 38 54 24 Q60 34 52 46 Z" fill="#E8A94F" />
          <Circle cx="53" cy="27" r="4" fill="#FBEEDA" />
        </G>
      );
    case "rabbit":
      return (
        <G>
          <Ellipse cx="30" cy="42" rx="15" ry="11" fill="#F5F0E6" />
          <Circle cx="30" cy="27" r="10" fill="#F5F0E6" />
          <Path d="M23 18 Q20 2 25 0 Q28 10 27 20 Z" fill="#F5F0E6" />
          <Path d="M37 18 Q40 2 35 0 Q32 10 33 20 Z" fill="#F5F0E6" />
          <Path d="M24 15 Q23 5 26 3 Q27 10 26 17 Z" fill="#F2C4CC" />
          <Path d="M36 15 Q37 5 34 3 Q33 10 34 17 Z" fill="#F2C4CC" />
          <Circle cx="26" cy="26" r="1.6" fill="#3D2B1F" />
          <Circle cx="34" cy="26" r="1.6" fill="#3D2B1F" />
          <Circle cx="30" cy="30" r="1.4" fill="#E8A0A8" />
          <Circle cx="42" cy="44" r="6" fill="#F5F0E6" />
        </G>
      );
    case "bird":
      return (
        <G>
          <Ellipse cx="30" cy="34" rx="14" ry="12" fill="#7FB3D9" />
          <Circle cx="38" cy="22" r="8" fill="#7FB3D9" />
          <Path d="M45 22 L52 24 L45 26 Z" fill="#E8A94F" />
          <Circle cx="40" cy="20" r="1.6" fill="#3D2B1F" />
          <Path d="M18 34 Q10 30 14 42 Q22 42 24 36 Z" fill="#5B93B8" />
          <Path
            d="M22 46 L18 52 M28 48 L26 54 M34 48 L34 54"
            stroke="#E8A94F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>
      );
    case "squirrel":
      return (
        <G>
          <Ellipse cx="26" cy="40" rx="12" ry="10" fill="#B5713C" />
          <Circle cx="26" cy="25" r="9" fill="#B5713C" />
          <Ellipse cx="26" cy="42" rx="6" ry="7" fill="#F0DEC0" />
          <Path d="M18 18 L14 8 L23 15 Z" fill="#B5713C" />
          <Path d="M34 18 L38 8 L29 15 Z" fill="#B5713C" />
          <Circle cx="22" cy="24" r="1.5" fill="#3D2B1F" />
          <Circle cx="30" cy="24" r="1.5" fill="#3D2B1F" />
          <Path
            d="M38 44 Q56 44 52 20 Q64 32 54 52 Q44 54 36 48 Z"
            fill="#B5713C"
          />
        </G>
      );
    case "hedgehog":
      return (
        <G>
          <Ellipse cx="30" cy="38" rx="17" ry="13" fill="#A5875F" />
          <Ellipse cx="30" cy="44" rx="11" ry="7" fill="#F0DEC0" />
          {[14, 20, 26, 32, 38, 44].map((x) => (
            <Path
              key={x}
              d={`M${x} 26 L${x - 2} 16 L${x + 3} 24 Z`}
              fill="#8A6D48"
            />
          ))}
          <Circle cx="16" cy="40" r="1.5" fill="#3D2B1F" />
          <Path d="M10 42 L5 43 L10 45 Z" fill="#3D2B1F" />
        </G>
      );
    case "bee":
      return (
        <G>
          <Ellipse cx="18" cy="24" rx="9" ry="7" fill="rgba(255,255,255,0.5)" />
          <Ellipse cx="42" cy="24" rx="9" ry="7" fill="rgba(255,255,255,0.5)" />
          <Ellipse cx="30" cy="34" rx="15" ry="12" fill="#F2C94C" />
          <Path d="M17 26 A15 12 0 0 1 43 26" fill="#3D2B1F" opacity="0.85" />
          <Ellipse
            cx="30"
            cy="40"
            rx="13"
            ry="6"
            fill="#3D2B1F"
            opacity="0.85"
          />
          <Circle cx="24" cy="30" r="1.4" fill="#3D2B1F" />
          <Circle cx="36" cy="30" r="1.4" fill="#3D2B1F" />
          <Path
            d="M25 20 L22 12 M35 20 L38 12"
            stroke="#3D2B1F"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </G>
      );
    case "owl":
      return (
        <G>
          <Ellipse cx="30" cy="38" rx="16" ry="14" fill="#A5754A" />
          <Path d="M18 22 L14 10 L24 20 Z" fill="#A5754A" />
          <Path d="M42 22 L46 10 L36 20 Z" fill="#A5754A" />
          <Circle cx="22" cy="30" r="8" fill="#F5EEDD" />
          <Circle cx="38" cy="30" r="8" fill="#F5EEDD" />
          <Circle cx="22" cy="30" r="3.4" fill="#3D2B1F" />
          <Circle cx="38" cy="30" r="3.4" fill="#3D2B1F" />
          <Path d="M27 37 L30 41 L33 37 Z" fill="#E8A94F" />
          <Path
            d="M18 46 Q30 52 42 46"
            stroke="#8A6238"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case "cat":
    default:
      return (
        <G>
          <Ellipse cx="28" cy="42" rx="14" ry="11" fill="#D9A441" />
          <Circle cx="28" cy="26" r="10" fill="#D9A441" />
          <Path d="M20 20 L17 10 L26 17 Z" fill="#D9A441" />
          <Path d="M36 20 L39 10 L30 17 Z" fill="#D9A441" />
          <Path d="M22 44 Q28 48 34 44" fill="#FBEEDA" />
          <Circle cx="24" cy="25" r="1.6" fill="#3D2B1F" />
          <Circle cx="32" cy="25" r="1.6" fill="#3D2B1F" />
          <Ellipse cx="28" cy="30" rx="1.6" ry="1.2" fill="#3D2B1F" />
          <Path
            d="M18 30 L8 28 M18 32 L8 33"
            stroke="#3D2B1F"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <Path
            d="M38 30 L48 28 M38 32 L48 33"
            stroke="#3D2B1F"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <Path d="M40 44 Q52 40 48 24 Q56 34 46 50 Z" fill="#D9A441" />
        </G>
      );
  }
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
