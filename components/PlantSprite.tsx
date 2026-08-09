import { Image } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { FLOWER_TIERS } from "../logic/garden";

// --- Real-art swap point ---
// Once you have illustrations, drop the image files into your assets
// folder and fill in the matching entry here, e.g.:
//   carrot: [require("../assets/plants/carrot-0.png"), require("../assets/plants/carrot-1.png"), ...]
// Flowers are keyed by tier since each tier has a different color.
// Any crop/stage left as `null` automatically falls back to the SVG
// placeholder below — nothing else in the app needs to change.
export const PLANT_IMAGES: Record<string, any[] | null> = {
  carrot: null,
  tomato: null,
  pumpkin: null,
  appleTree: null,
  flower_common: null,
  flower_rare: null,
  flower_epic: null,
  flower_legendary: null,
};

type Props = {
  cropId: string;
  stage: number; // 0 seed, 1 sprout, 2 growing, 3 ready
  tier?: string | null;
  size?: number;
};

export default function PlantSprite({ cropId, stage, tier, size = 70 }: Props) {
  const tierKey = (tier as string) || "common";
  const flowerTier = FLOWER_TIERS[tierKey as keyof typeof FLOWER_TIERS];
  const imageKey = cropId === "flower" ? `flower_${tier || "common"}` : cropId;
  const realImages = PLANT_IMAGES[imageKey];

  if (realImages && realImages[stage]) {
    return (
      <Image
        source={realImages[stage]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 80 100">
      {/* soil mound — shared by every crop at every stage */}
      <Ellipse cx="40" cy="85" rx="18" ry="6" fill="#8B6B47" />

      {stage === 0 && <Circle cx="40" cy="80" r="3" fill="#5C4530" />}

      {stage === 1 && (
        <G>
          <Path
            d="M40 85 L40 68"
            stroke="#6FA84A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path d="M40 74 Q30 70 28 62" fill="#7CBB55" />
          <Path d="M40 74 Q50 70 52 62" fill="#7CBB55" />
        </G>
      )}

      {stage >= 2 && cropId === "flower" && (
        <G>
          <Path
            d={stage === 2 ? "M40 85 L40 45" : "M40 85 L40 40"}
            stroke="#5B8C3E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <Path d="M40 68 Q26 62 24 50" fill="#7CBB55" />
          <Path d="M40 72 Q54 66 57 54" fill="#7CBB55" />
          {stage === 2 ? (
            <Ellipse cx="40" cy="42" rx="7" ry="9" fill={flowerTier.accent} />
          ) : (
            <G>
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <Ellipse
                  key={deg}
                  cx="40"
                  cy="26"
                  rx="6.5"
                  ry="11"
                  fill={flowerTier.color}
                  transform={`rotate(${deg} 40 40)`}
                />
              ))}
              <Circle cx="40" cy="40" r="6" fill="#D9A441" />
            </G>
          )}
        </G>
      )}

      {stage >= 2 && cropId === "carrot" && (
        <G>
          {stage === 2 ? (
            <G>
              <Path
                d="M40 85 Q35 70 30 55"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 85 Q40 68 40 50"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 85 Q45 70 50 55"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </G>
          ) : (
            <G>
              <Ellipse cx="40" cy="82" rx="6" ry="4" fill="#E8843C" />
              <Path
                d="M40 82 Q32 65 26 48"
                stroke="#5B8C3E"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 82 Q40 62 40 44"
                stroke="#5B8C3E"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 82 Q48 65 54 48"
                stroke="#5B8C3E"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 82 Q36 68 32 52"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 82 Q44 68 48 52"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </G>
          )}
        </G>
      )}

      {stage >= 2 && cropId === "tomato" && (
        <G>
          {stage === 2 ? (
            <G>
              <Path
                d="M40 85 L40 60"
                stroke="#5B8C3E"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Ellipse cx="30" cy="65" rx="10" ry="8" fill="#7CBB55" />
              <Ellipse cx="50" cy="62" rx="9" ry="7" fill="#7CBB55" />
              <Circle cx="33" cy="68" r="3" fill="#9ACB6A" />
            </G>
          ) : (
            <G>
              <Path
                d="M40 85 L40 52"
                stroke="#5B8C3E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <Ellipse cx="26" cy="58" rx="13" ry="10" fill="#6FA84A" />
              <Ellipse cx="54" cy="55" rx="12" ry="9" fill="#6FA84A" />
              <Ellipse cx="40" cy="48" rx="12" ry="9" fill="#6FA84A" />
              <Circle cx="28" cy="60" r="5" fill="#E14B3D" />
              <Circle cx="52" cy="57" r="4.5" fill="#E14B3D" />
              <Circle cx="40" cy="50" r="5" fill="#E14B3D" />
            </G>
          )}
        </G>
      )}

      {stage >= 2 && cropId === "pumpkin" && (
        <G>
          {stage === 2 ? (
            <G>
              <Path
                d="M40 85 Q25 82 15 75"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M40 85 Q55 82 65 75"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <Ellipse cx="18" cy="73" rx="8" ry="6" fill="#7CBB55" />
              <Ellipse cx="62" cy="73" rx="8" ry="6" fill="#7CBB55" />
            </G>
          ) : (
            <G>
              <Path
                d="M40 85 Q20 80 10 70"
                stroke="#5B8C3E"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Ellipse cx="14" cy="68" rx="9" ry="7" fill="#7CBB55" />
              <Circle cx="54" cy="70" r="17" fill="#EA8B3A" />
              <Path
                d="M54 53 L54 59"
                stroke="#5B8C3E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Path
                d="M54 60 Q46 70 54 80"
                stroke="#C96B22"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <Path
                d="M54 60 Q62 70 54 80"
                stroke="#C96B22"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
            </G>
          )}
        </G>
      )}

      {stage >= 2 && cropId === "appleTree" && (
        <G>
          {stage === 2 ? (
            <G>
              <Rect x="37" y="55" width="6" height="30" fill="#8B5E3C" />
              <Circle cx="40" cy="48" r="18" fill="#7CBB55" />
            </G>
          ) : (
            <G>
              <Rect x="35" y="48" width="10" height="37" fill="#8B5E3C" />
              <Circle cx="40" cy="35" r="26" fill="#6FA84A" />
              <Circle cx="28" cy="30" r="4" fill="#D4433A" />
              <Circle cx="50" cy="26" r="4" fill="#D4433A" />
              <Circle cx="42" cy="42" r="4" fill="#D4433A" />
              <Circle cx="32" cy="45" r="3.5" fill="#D4433A" />
            </G>
          )}
        </G>
      )}
    </Svg>
  );
}
