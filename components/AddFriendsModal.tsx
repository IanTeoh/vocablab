import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import {
    acceptFriendRequest,
    declineFriendRequest,
    getFriendsList,
    getIncomingRequests,
    getOutgoingRequests,
    searchUsersByUsername,
    sendFriendRequest,
} from "../logic/friends";
import Avatar from "./Avatar";
import PressableScale from "./PressableScale";

export default function AddFriendsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [friendUids, setFriendUids] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (visible) loadEverything();
  }, [visible]);

  async function loadEverything() {
    const [inc, out, friends] = await Promise.all([
      getIncomingRequests(),
      getOutgoingRequests(),
      getFriendsList(),
    ]);
    setIncoming(inc);
    setOutgoing(out);
    const friendIds = (friends ?? [])
      .map((f) => f?.uid)
      .filter((uid): uid is string => typeof uid === "string");
    setFriendUids(new Set(friendIds));
  }

  function showFlash(text: string) {
    setFlash(text);
    setTimeout(() => setFlash(null), 2000);
  }

  async function handleSearch() {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsersByUsername(searchText);
    setSearchResults(results);
    setSearching(false);
  }

  async function handleSendRequest(user: any) {
    const result = await sendFriendRequest(user.uid, user.username);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showFlash(`Friend request sent to ${user.username}!`);
      setOutgoing((prev) => [
        ...prev,
        { toUid: user.uid, toUsername: user.username },
      ]);
    } else {
      showFlash(result.error || "Couldn't send request.");
    }
  }

  async function handleAccept(request: any) {
    await acceptFriendRequest(request);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadEverything();
  }

  async function handleDecline(requestId: string) {
    await declineFriendRequest(requestId);
    setIncoming((prev) => prev.filter((r) => r.id !== requestId));
  }

  const outgoingUids = new Set(outgoing.map((r) => r.toUid));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🔍 Add Friends</Text>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {flash && (
              <View style={styles.flashBanner}>
                <Text style={styles.flashText}>{flash}</Text>
              </View>
            )}

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username..."
                placeholderTextColor={Colors.inkMuted}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              <PressableScale
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </PressableScale>
            </View>

            {searching && (
              <ActivityIndicator
                color={Colors.primary}
                style={{ marginVertical: Spacing.sm }}
              />
            )}

            {searchResults.map((user) => (
              <View key={user.uid} style={styles.resultRow}>
                <Avatar profile={user} size={36} />
                <Text style={styles.resultName}>{user.username}</Text>
                {friendUids.has(user.uid) ? (
                  <Text style={styles.alreadyFriendText}>✅ Friends</Text>
                ) : outgoingUids.has(user.uid) ? (
                  <Text style={styles.pendingText}>Pending</Text>
                ) : (
                  <PressableScale
                    style={styles.addButton}
                    onPress={() => handleSendRequest(user)}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </PressableScale>
                )}
              </View>
            ))}

            {incoming.length > 0 && (
              <>
                <Text style={styles.subLabel}>
                  Requests ({incoming.length})
                </Text>
                {incoming.map((request) => (
                  <View key={request.id} style={styles.requestRow}>
                    <Text style={styles.resultName}>
                      {request.fromUsername}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <PressableScale
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </PressableScale>
                      <PressableScale
                        style={styles.declineButton}
                        onPress={() => handleDecline(request.id)}
                      >
                        <Text style={styles.declineButtonText}>✕</Text>
                      </PressableScale>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  scrollContent: { padding: Spacing.lg, paddingTop: 0 },
  flashBanner: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  flashText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: "#fff" },
  searchRow: { flexDirection: "row", marginBottom: Spacing.md },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  searchButtonText: { fontSize: 16 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginLeft: 10,
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: "#fff",
  },
  pendingText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: "italic",
  },
  alreadyFriendText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.success,
  },
  subLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  acceptButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: "#fff",
  },
  declineButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
  },
});
