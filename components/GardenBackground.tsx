import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { getTimeOfDayBucket, TIME_OF_DAY_THEMES } from "../logic/timeOfDay";

// The same bare sky+ground scene the Garden hub uses, extracted so
// every tab can share one consistent background instead of each
// screen having its own. Time-of-day aware, same as the garden.
export default function GardenBackground() {
  const bucket = getTimeOfDayBucket();
  const theme = TIME_OF_DAY_THEMES[bucket];

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="sharedSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.sky[0]} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.sky[1]} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="400" height="280" fill="url(#sharedSky)" />
      <Rect x="0" y="280" width="400" height="320" fill="#A9C97E" />
      <Path
        d="M0 280 Q200 265 400 280 L400 300 L0 300 Z"
        fill="#97BC6C"
        opacity="0.6"
      />
    </Svg>
  );
}
