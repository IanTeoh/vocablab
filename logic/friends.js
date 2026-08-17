import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getCurrentUser } from "./auth";

// --- Search ---

// Firestore doesn't support case-insensitive "contains" queries, so
// usernameLower is stored at sign-up specifically to support this
// prefix search via a range query.
export async function searchUsersByUsername(queryText) {
  const me = getCurrentUser();
  if (!queryText.trim()) return [];
  const lower = queryText.trim().toLowerCase();

  const q = query(
    collection(db, "users"),
    where("usernameLower", ">=", lower),
    where("usernameLower", "<=", lower + "\uf8ff"),
    limit(15),
  );
  const snapshot = await getDocs(q);
  const { getBlockedUidSet } = await import("./moderation");
  const blocked = await getBlockedUidSet();

  return snapshot.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== me?.uid && !blocked.has(u.uid));
}

// --- Friend requests ---

export async function sendFriendRequest(toUid, toUsername) {
  const me = getCurrentUser();
  if (!me) return { success: false, error: "Not signed in." };

  // Prevent duplicate pending requests between the same two people.
  const existing = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("fromUid", "==", me.uid),
      where("toUid", "==", toUid),
      where("status", "==", "pending"),
    ),
  );
  if (!existing.empty)
    return { success: false, error: "Request already sent." };

  await addDoc(collection(db, "friendRequests"), {
    fromUid: me.uid,
    fromUsername: me.displayName,
    toUid,
    toUsername,
    status: "pending",
    createdAt: Date.now(),
  });
  return { success: true };
}

export async function getIncomingRequests() {
  const me = getCurrentUser();
  if (!me) return [];
  const q = query(
    collection(db, "friendRequests"),
    where("toUid", "==", me.uid),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);
  const { getBlockedUidSet } = await import("./moderation");
  const blocked = await getBlockedUidSet();
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => !blocked.has(r.fromUid));
}

export async function getOutgoingRequests() {
  const me = getCurrentUser();
  if (!me) return [];
  const q = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", me.uid),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function acceptFriendRequest(request) {
  const me = getCurrentUser();
  if (!me) return;

  await updateDoc(doc(db, "friendRequests", request.id), {
    status: "accepted",
  });

  // Friendship is symmetric — a doc on both sides makes "get my
  // friends list" a simple subcollection read for either person.
  await setDoc(doc(db, "users", me.uid, "friends", request.fromUid), {
    since: Date.now(),
  });
  await setDoc(doc(db, "users", request.fromUid, "friends", me.uid), {
    since: Date.now(),
  });
}

export async function declineFriendRequest(requestId) {
  await updateDoc(doc(db, "friendRequests", requestId), { status: "declined" });
}

// --- Friends list ---

export async function getFriendsList() {
  const me = getCurrentUser();
  if (!me) return [];

  const friendsSnapshot = await getDocs(
    collection(db, "users", me.uid, "friends"),
  );
  const friendUids = friendsSnapshot.docs.map((d) => d.id);

  const friends = await Promise.all(
    friendUids.map(async (uid) => {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? { uid, ...userDoc.data() } : null;
    }),
  );
  return friends.filter(Boolean);
}

export async function getFriendProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? { uid, ...userDoc.data() } : null;
}

export async function removeFriend(friendUid) {
  const me = getCurrentUser();
  if (!me) return;
  await deleteDoc(doc(db, "users", me.uid, "friends", friendUid));
  await deleteDoc(doc(db, "users", friendUid, "friends", me.uid));
}
