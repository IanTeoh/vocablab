import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCurrentUser, subscribeToAuthState } from "../logic/auth";
import { getFriendProfile, getFriendsList } from "../logic/friends";
import AddFriendsModal from "./AddFriendsModal";
import AuthModal from "./AuthModal";
import Avatar from "./Avatar";
import FriendProfileModal from "./FriendProfileModal";
import LeaderboardModal from "./LeaderboardModal";
import PressableScale from "./PressableScale";
import ProfileAndFriendsModal from "./ProfileAndFriendsModal";
import SettingsModal from "./SettingsModal";

// Shared shell: white full-bleed card, oval bottom edge, extends into
// the safe area itself, with a settings gear in the top-right corner.
// Used for both auth states so the page reads consistently either way.
function HeroCardShell({
  children,
  onSettingsPress,
}: {
  children: React.ReactNode;
  onSettingsPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.heroWrapper}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Path d="M0,0 L100,0 L100,90 Q50,105 0,90 Z" fill={Colors.surface} />
      </Svg>

      <View
        style={[styles.heroContent, { paddingTop: insets.top + Spacing.lg }]}
      >
        <PressableScale
          style={[styles.settingsButton, { top: insets.top + Spacing.sm }]}
          onPress={onSettingsPress}
        >
          <Text style={styles.settingsButtonIcon}>⚙️</Text>
        </PressableScale>
        {children}
      </View>
    </View>
  );
}

export default function AccountSection() {
  const [user, setUser] = useState<any>(getCurrentUser());
  const [myProfile, setMyProfile] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [authVisible, setAuthVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [addFriendsVisible, setAddFriendsVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) refreshProfileAndFriends();
  }, [user?.uid]);

  async function refreshProfileAndFriends() {
    if (!user) return;
    const [profile, friendsList] = await Promise.all([
      getFriendProfile(user.uid),
      getFriendsList(),
    ]);
    setMyProfile(profile);
    setFriends(friendsList);
  }

  if (user) {
    return (
      <HeroCardShell onSettingsPress={() => setSettingsVisible(true)}>
        <View style={styles.avatarRing}>
          <Avatar profile={myProfile} size={84} />
        </View>
        <Text style={styles.username}>{user.displayName}</Text>

        <View style={styles.buttonRow}>
          <PressableScale
            style={[styles.pillButton, styles.pillButtonPrimary]}
            onPress={() => setEditProfileVisible(true)}
          >
            <Text style={styles.pillButtonPrimaryText}>Edit Profile</Text>
          </PressableScale>
          <PressableScale
            style={[styles.pillButton, styles.pillButtonSecondary]}
            onPress={() => setAddFriendsVisible(true)}
          >
            <Text style={styles.pillButtonSecondaryText}>Add Friends</Text>
          </PressableScale>
        </View>

        <View style={styles.friendsSection}>
          <View style={styles.friendsHeaderRow}>
            <Text style={styles.friendsLabel}>
              Friends {friends.length > 0 ? `(${friends.length})` : ""}
            </Text>
            <PressableScale onPress={() => setLeaderboardVisible(true)}>
              <Text style={styles.leaderboardLink}>🏆 Leaderboard</Text>
            </PressableScale>
          </View>
          {friends.length === 0 ? (
            <Text style={styles.noFriendsText}>
              No friends yet — tap Add Friends to search for someone.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {friends.map((friend) => (
                <PressableScale
                  key={friend.uid}
                  style={styles.friendChip}
                  onPress={() => setSelectedFriend(friend)}
                >
                  <View style={styles.friendAvatarRing}>
                    <Avatar profile={friend} size={44} />
                  </View>
                  <Text style={styles.friendChipName} numberOfLines={1}>
                    {friend.username}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
          )}
        </View>

        <ProfileAndFriendsModal
          visible={editProfileVisible}
          onClose={() => {
            setEditProfileVisible(false);
            refreshProfileAndFriends();
          }}
        />
        <AddFriendsModal
          visible={addFriendsVisible}
          onClose={() => {
            setAddFriendsVisible(false);
            refreshProfileAndFriends();
          }}
        />
        <FriendProfileModal
          visible={!!selectedFriend}
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onRemove={async (uid) => {
            const { removeFriend } = await import("../logic/friends");
            await removeFriend(uid);
            setSelectedFriend(null);
            refreshProfileAndFriends();
          }}
        />
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />
        <LeaderboardModal
          visible={leaderboardVisible}
          onClose={() => setLeaderboardVisible(false)}
        />
      </HeroCardShell>
    );
  }

  return (
    <HeroCardShell onSettingsPress={() => setSettingsVisible(true)}>
      <Text style={styles.promptIcon}>👤</Text>
      <Text style={styles.promptTitle}>Not logged in</Text>
      <Text style={styles.promptSubtitle}>
        Log in or create an account to back up your progress and add friends.
      </Text>
      <PressableScale
        style={styles.promptButton}
        onPress={() => setAuthVisible(true)}
      >
        <Text style={styles.promptButtonText}>Log In / Sign Up</Text>
      </PressableScale>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </HeroCardShell>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginHorizontal: -Spacing.lg,
    marginTop: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.md,
  },
  settingsButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButtonIcon: { fontSize: 17 },
  avatarRing: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.background,
  },
  username: {
    fontFamily: Fonts.displayBold,
    fontSize: 21,
    color: Colors.ink,
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    width: "100%",
  },
  pillButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginHorizontal: 5,
  },
  pillButtonPrimary: { backgroundColor: Colors.accent },
  pillButtonPrimaryText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: "#fff",
  },
  pillButtonSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillButtonSecondaryText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  friendsSection: { width: "100%", marginTop: Spacing.lg },
  friendsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  leaderboardLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.accent,
  },
  friendsLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noFriendsText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
  },
  friendChip: { alignItems: "center", width: 64, marginRight: Spacing.sm },
  friendAvatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: Colors.background,
  },
  friendChipName: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.ink,
    marginTop: 4,
  },
  promptIcon: { fontSize: 36, marginBottom: Spacing.xs },
  promptTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 19,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  promptSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  promptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  promptButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
});
