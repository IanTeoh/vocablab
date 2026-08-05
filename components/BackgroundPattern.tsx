import { StyleSheet, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    Polygon,
    RadialGradient,
    Rect,
    Stop,
} from "react-native-svg";
import { Colors } from "../constants/theme";

// A quiet reading-nook scene: soft rolling hills, distant pines,
// birds, drifting clouds, and a little stack of books lit by a
// warm lamp glow in the corner. Sits behind the ScrollView; cards
// are solid, so this can be richer than a texture without hurting
// readability.
export default function BackgroundPattern() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMax slice"
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E3ECDF" stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.background} stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={Colors.accent} stopOpacity="0.35" />
            <Stop offset="1" stopColor={Colors.accent} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={Colors.accent} stopOpacity="0.4" />
            <Stop offset="1" stopColor={Colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* sky wash */}
        <Rect x="0" y="0" width="400" height="800" fill="url(#sky)" />

        {/* soft sun / moon glow, upper right */}
        <Circle cx="320" cy="90" r="90" fill="url(#sunGlow)" />
        <Circle cx="320" cy="90" r="22" fill={Colors.accent} opacity="0.5" />
        {/* thin ring, like a halo */}
        <Circle
          cx="320"
          cy="90"
          r="32"
          stroke={Colors.accent}
          strokeWidth="1"
          fill="none"
          opacity="0.25"
        />

        {/* drifting clouds */}
        <Ellipse
          cx="90"
          cy="70"
          rx="34"
          ry="10"
          fill="#FFFFFF"
          opacity="0.35"
        />
        <Ellipse cx="115" cy="65" rx="24" ry="8" fill="#FFFFFF" opacity="0.3" />
        <Ellipse
          cx="250"
          cy="150"
          rx="26"
          ry="8"
          fill="#FFFFFF"
          opacity="0.3"
        />
        <Ellipse
          cx="272"
          cy="145"
          rx="18"
          ry="6"
          fill="#FFFFFF"
          opacity="0.25"
        />

        {/* birds */}
        <Path
          d="M170 110 q 8 -8 16 0 q 8 -8 16 0"
          stroke={Colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M205 130 q 6 -6 12 0 q 6 -6 12 0"
          stroke={Colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.25"
        />
        <Path
          d="M50 175 q 6 -6 12 0 q 6 -6 12 0"
          stroke={Colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.22"
        />

        {/* far hill layer with a faint tree line */}
        <Path
          d="M0 260 Q 60 220 130 245 T 260 235 T 400 250 L 400 800 L 0 800 Z"
          fill={Colors.secondary}
          opacity="0.16"
        />
        <Polygon
          points="180,238 190,254 170,254"
          fill={Colors.secondary}
          opacity="0.2"
        />
        <Polygon
          points="200,240 210,256 190,256"
          fill={Colors.secondary}
          opacity="0.18"
        />
        <Polygon
          points="220,236 230,252 210,252"
          fill={Colors.secondary}
          opacity="0.2"
        />
        <Polygon
          points="300,244 310,260 290,260"
          fill={Colors.secondary}
          opacity="0.16"
        />
        <Polygon
          points="320,242 330,258 310,258"
          fill={Colors.secondary}
          opacity="0.18"
        />

        {/* mid hill layer */}
        <Path
          d="M0 330 Q 80 280 170 310 T 400 300 L 400 800 L 0 800 Z"
          fill={Colors.secondary}
          opacity="0.22"
        />

        {/* pine cluster on the mid hill, left */}
        <Polygon
          points="70,300 90,340 50,340"
          fill={Colors.primary}
          opacity="0.25"
        />
        <Polygon
          points="70,290 95,335 45,335"
          fill={Colors.primary}
          opacity="0.2"
        />
        <Polygon
          points="150,310 168,345 132,345"
          fill={Colors.primary}
          opacity="0.22"
        />
        <Polygon
          points="150,302 172,340 128,340"
          fill={Colors.primary}
          opacity="0.18"
        />
        <Polygon
          points="230,305 246,338 214,338"
          fill={Colors.primary}
          opacity="0.2"
        />

        {/* second pine cluster, right side for balance */}
        <Polygon
          points="340,315 358,350 322,350"
          fill={Colors.primary}
          opacity="0.2"
        />
        <Polygon
          points="340,306 362,346 318,346"
          fill={Colors.primary}
          opacity="0.16"
        />
        <Polygon
          points="375,320 390,348 360,348"
          fill={Colors.primary}
          opacity="0.18"
        />

        {/* near hill layer, closest to content */}
        <Path
          d="M0 400 Q 100 360 220 385 T 400 375 L 400 800 L 0 800 Z"
          fill={Colors.secondary}
          opacity="0.28"
        />

        {/* small bushes along the near hill */}
        <Ellipse
          cx="260"
          cy="392"
          rx="16"
          ry="10"
          fill={Colors.primary}
          opacity="0.18"
        />
        <Ellipse
          cx="280"
          cy="396"
          rx="12"
          ry="8"
          fill={Colors.primary}
          opacity="0.16"
        />
        <Ellipse
          cx="40"
          cy="410"
          rx="14"
          ry="9"
          fill={Colors.primary}
          opacity="0.16"
        />

        {/* cozy cottage village, tucked along the near hill line */}
        {/* cottage 1 */}
        <Rect
          x="230"
          y="410"
          width="34"
          height="26"
          fill={Colors.primary}
          opacity="0.22"
        />
        <Polygon
          points="225,410 247,392 269,410"
          fill={Colors.secondary}
          opacity="0.3"
        />
        <Rect
          x="243"
          y="420"
          width="8"
          height="16"
          fill={Colors.accent}
          opacity="0.35"
        />
        <Rect
          x="260"
          y="396"
          width="4"
          height="14"
          fill={Colors.primary}
          opacity="0.28"
        />
        <Path
          d="M262 396 Q 266 388 262 380 Q 258 374 264 366"
          stroke={Colors.inkMuted}
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
        />

        {/* cottage 2, slightly larger, overlapping foreground */}
        <Rect
          x="290"
          y="425"
          width="42"
          height="32"
          fill={Colors.primary}
          opacity="0.25"
        />
        <Polygon
          points="284,425 311,404 338,425"
          fill={Colors.secondary}
          opacity="0.32"
        />
        <Rect
          x="306"
          y="438"
          width="10"
          height="19"
          fill={Colors.accent}
          opacity="0.4"
        />
        <Rect
          x="330"
          y="410"
          width="5"
          height="15"
          fill={Colors.primary}
          opacity="0.3"
        />
        <Path
          d="M332 410 Q 337 401 332 392 Q 327 385 334 376"
          stroke={Colors.inkMuted}
          strokeWidth="1.5"
          fill="none"
          opacity="0.22"
        />

        {/* cottage 3, small, further back */}
        <Rect
          x="345"
          y="415"
          width="28"
          height="22"
          fill={Colors.primary}
          opacity="0.2"
        />
        <Polygon
          points="341,415 359,400 377,415"
          fill={Colors.secondary}
          opacity="0.26"
        />
        <Rect
          x="357"
          y="424"
          width="7"
          height="13"
          fill={Colors.accent}
          opacity="0.32"
        />

        {/* mid-ground path connector, winding up toward the reading nook */}
        <Path
          d="M60 726 Q 90 650 70 560 Q 55 500 90 460"
          stroke="#EFE6D0"
          strokeWidth="10"
          fill="none"
          opacity="0.22"
        />

        {/* a small tree with a reading bench beneath it, mid-left */}
        <Rect
          x="98"
          y="560"
          width="6"
          height="60"
          fill={Colors.primary}
          opacity="0.28"
        />
        <Circle
          cx="101"
          cy="545"
          r="26"
          fill={Colors.secondary}
          opacity="0.22"
        />
        <Circle
          cx="85"
          cy="558"
          r="18"
          fill={Colors.secondary}
          opacity="0.18"
        />
        <Circle
          cx="118"
          cy="558"
          r="18"
          fill={Colors.secondary}
          opacity="0.18"
        />
        <Rect
          x="70"
          y="622"
          width="46"
          height="6"
          rx="1.5"
          fill={Colors.primary}
          opacity="0.3"
        />
        <Rect
          x="74"
          y="628"
          width="4"
          height="12"
          fill={Colors.primary}
          opacity="0.3"
        />
        <Rect
          x="108"
          y="628"
          width="4"
          height="12"
          fill={Colors.primary}
          opacity="0.3"
        />
        <Rect
          x="70"
          y="608"
          width="46"
          height="5"
          rx="1.5"
          fill={Colors.primary}
          opacity="0.24"
        />

        {/* grass tufts and a flower cluster near the bench */}
        <Path
          d="M60 640 Q 62 628 66 640"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.28"
        />
        <Path
          d="M124 640 Q 126 628 130 640"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.28"
        />
        <Circle cx="140" cy="636" r="2.2" fill={Colors.accent} opacity="0.35" />
        <Circle
          cx="146"
          cy="640"
          r="1.8"
          fill={Colors.secondary}
          opacity="0.32"
        />

        {/* butterflies drifting in the mid-ground */}
        <Path
          d="M230 540 Q 224 532 230 526 Q 236 532 230 540 Q 236 532 242 526 Q 248 532 242 540 Q 236 534 230 540"
          fill={Colors.accent}
          opacity="0.3"
        />
        <Path
          d="M310 610 Q 305 604 310 599 Q 315 604 310 610 Q 315 604 320 599 Q 325 604 320 610 Q 315 605 310 610"
          fill={Colors.secondary}
          opacity="0.3"
        />

        {/* a small tree cluster on the right, near the butterflies */}
        <Rect
          x="335"
          y="545"
          width="6"
          height="55"
          fill={Colors.primary}
          opacity="0.26"
        />
        <Circle
          cx="338"
          cy="530"
          r="24"
          fill={Colors.secondary}
          opacity="0.2"
        />
        <Circle
          cx="322"
          cy="542"
          r="16"
          fill={Colors.secondary}
          opacity="0.17"
        />
        <Circle
          cx="354"
          cy="542"
          r="16"
          fill={Colors.secondary}
          opacity="0.17"
        />

        <Rect
          x="368"
          y="565"
          width="5"
          height="42"
          fill={Colors.primary}
          opacity="0.22"
        />
        <Circle
          cx="370"
          cy="552"
          r="18"
          fill={Colors.secondary}
          opacity="0.18"
        />
        <Circle
          cx="358"
          cy="562"
          r="12"
          fill={Colors.secondary}
          opacity="0.15"
        />

        {/* a small pond beneath the trees */}
        <Ellipse
          cx="345"
          cy="655"
          rx="46"
          ry="16"
          fill={Colors.secondary}
          opacity="0.28"
        />
        <Ellipse
          cx="345"
          cy="655"
          rx="46"
          ry="16"
          fill={Colors.primary}
          opacity="0.08"
        />
        <Path
          d="M312 652 Q 330 648 348 652"
          stroke={Colors.background}
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <Path
          d="M320 660 Q 336 657 352 660"
          stroke={Colors.background}
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />
        {/* lily pads */}
        <Ellipse
          cx="325"
          cy="648"
          rx="5"
          ry="3"
          fill={Colors.primary}
          opacity="0.3"
        />
        <Ellipse
          cx="365"
          cy="658"
          rx="4"
          ry="2.5"
          fill={Colors.primary}
          opacity="0.28"
        />
        {/* grass ringing the pond */}
        <Path
          d="M300 660 Q 302 650 306 660"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.26"
        />
        <Path
          d="M388 655 Q 390 646 394 655"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.26"
        />

        {/* flowers scattered around the pond */}
        <Circle cx="298" cy="672" r="2.4" fill={Colors.accent} opacity="0.4" />
        <Circle cx="303" cy="669" r="1.8" fill={Colors.accent} opacity="0.35" />
        <Circle cx="293" cy="668" r="1.8" fill={Colors.accent} opacity="0.35" />
        <Circle
          cx="309"
          cy="678"
          r="2"
          fill={Colors.secondary}
          opacity="0.38"
        />
        <Circle
          cx="313"
          cy="675"
          r="1.5"
          fill={Colors.secondary}
          opacity="0.3"
        />

        <Circle cx="390" cy="668" r="2.2" fill={Colors.accent} opacity="0.4" />
        <Circle cx="395" cy="665" r="1.6" fill={Colors.accent} opacity="0.32" />
        <Circle
          cx="386"
          cy="672"
          r="1.8"
          fill={Colors.secondary}
          opacity="0.35"
        />

        <Circle
          cx="330"
          cy="682"
          r="2.3"
          fill={Colors.secondary}
          opacity="0.38"
        />
        <Circle cx="335" cy="686" r="1.7" fill={Colors.accent} opacity="0.32" />
        <Circle cx="326" cy="687" r="1.6" fill={Colors.accent} opacity="0.3" />

        {/* reading-nook corner detail, bottom-left: lamp glow + book stack */}
        <Ellipse cx="55" cy="735" rx="80" ry="80" fill="url(#lampGlow)" />

        {/* open book laid flat, behind the stack */}
        <Path
          d="M14 772 Q 34 764 54 772 Q 74 764 94 772 L 94 780 Q 74 774 54 780 Q 34 774 14 780 Z"
          fill={Colors.secondary}
          opacity="0.3"
        />

        {/* book stack */}
        <Rect
          x="20"
          y="758"
          width="72"
          height="10"
          rx="2"
          fill={Colors.primary}
          opacity="0.5"
        />
        <Rect
          x="26"
          y="748"
          width="60"
          height="10"
          rx="2"
          fill={Colors.accent}
          opacity="0.45"
        />
        <Rect
          x="22"
          y="738"
          width="66"
          height="10"
          rx="2"
          fill={Colors.secondary}
          opacity="0.5"
        />
        {/* small bookmark ribbon on the top book */}
        <Rect
          x="70"
          y="726"
          width="4"
          height="16"
          fill={Colors.accent}
          opacity="0.5"
        />

        {/* tiny plant sprout beside the books */}
        <Path
          d="M100 758 Q 96 740 106 726"
          stroke={Colors.primary}
          strokeWidth="2.5"
          fill="none"
          opacity="0.35"
        />
        <Path
          d="M100 745 Q 92 738 88 726"
          stroke={Colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M103 735 Q 112 728 118 716"
          stroke={Colors.primary}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* a couple of fireflies / warm dust motes drifting near the lamp */}
        <Circle cx="130" cy="700" r="2.5" fill={Colors.accent} opacity="0.5" />
        <Circle cx="150" cy="670" r="2" fill={Colors.accent} opacity="0.4" />
        <Circle cx="115" cy="655" r="1.6" fill={Colors.accent} opacity="0.35" />

        {/* winding path across the ground, connecting the two corners */}
        <Path
          d="M0 780 Q 80 760 150 775 Q 220 792 280 770 Q 340 752 400 768 L 400 800 L 0 800 Z"
          fill="#EFE6D0"
          opacity="0.35"
        />

        {/* grass tufts along the very bottom edge */}
        <Path
          d="M20 800 Q 22 786 26 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M28 800 Q 31 782 35 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M170 800 Q 172 788 176 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.28"
        />
        <Path
          d="M178 800 Q 181 784 185 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.28"
        />
        <Path
          d="M395 800 Q 397 787 400 798"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M255 800 Q 257 789 261 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.26"
        />
        <Path
          d="M263 800 Q 266 785 270 800"
          stroke={Colors.primary}
          strokeWidth="1.5"
          fill="none"
          opacity="0.26"
        />

        {/* scattered wildflowers */}
        <Circle cx="195" cy="785" r="3" fill={Colors.accent} opacity="0.4" />
        <Circle cx="200" cy="782" r="2" fill={Colors.accent} opacity="0.35" />
        <Circle cx="205" cy="787" r="2.2" fill={Colors.accent} opacity="0.35" />
        <Circle
          cx="150"
          cy="792"
          r="2.5"
          fill={Colors.secondary}
          opacity="0.4"
        />
        <Circle
          cx="145"
          cy="789"
          r="1.8"
          fill={Colors.secondary}
          opacity="0.35"
        />
        <Circle cx="245" cy="783" r="2.3" fill={Colors.accent} opacity="0.35" />
        <Circle cx="90" cy="790" r="2.2" fill={Colors.accent} opacity="0.35" />
        <Circle
          cx="95"
          cy="786"
          r="1.6"
          fill={Colors.secondary}
          opacity="0.3"
        />
        <Circle
          cx="360"
          cy="788"
          r="2.4"
          fill={Colors.secondary}
          opacity="0.38"
        />
        <Circle cx="365" cy="784" r="1.7" fill={Colors.accent} opacity="0.32" />
        <Circle cx="220" cy="795" r="1.8" fill={Colors.accent} opacity="0.3" />

        {/* two small mushrooms near the path */}
        <Path
          d="M60 795 L 60 800"
          stroke={Colors.inkMuted}
          strokeWidth="1.5"
          opacity="0.25"
        />
        <Ellipse
          cx="60"
          cy="793"
          rx="6"
          ry="4"
          fill={Colors.error}
          opacity="0.2"
        />
        <Path
          d="M70 797 L 70 800"
          stroke={Colors.inkMuted}
          strokeWidth="1.2"
          opacity="0.22"
        />
        <Ellipse
          cx="70"
          cy="795.5"
          rx="4"
          ry="3"
          fill={Colors.error}
          opacity="0.18"
        />
      </Svg>
    </View>
  );
}
