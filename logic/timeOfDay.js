export function getTimeOfDayBucket(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export const TIME_OF_DAY_THEMES = {
  dawn: {
    sky: ["#FFD9A0", "#FFF3D6"],
    label: "Dawn",
    icon: "🌅",
    ambient: ["🦋"],
  },
  day: {
    sky: ["#8ECBFF", "#D6F0FF"],
    label: "Daytime",
    icon: "☀️",
    ambient: ["🦋", "🐝"],
  },
  dusk: {
    sky: ["#FF9E7D", "#FFD3A8"],
    label: "Dusk",
    icon: "🌇",
    ambient: ["🐦"],
  },
  night: {
    sky: ["#1A2340", "#3A4270"],
    label: "Night",
    icon: "🌙",
    ambient: ["✨", "✨", "✨"],
  },
};
