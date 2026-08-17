import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getCurrentUser } from "./auth";
import { removeFriend } from "./friends";

export async function blockUser(targetUid, targetUsername) {
  const me = getCurrentUser();
  if (!me) return;
  await setDoc(doc(db, "users", me.uid, "blocked", targetUid), {
    username: targetUsername,
    blockedAt: Date.now(),
  });
  await removeFriend(targetUid).catch(() => {});
}

export async function unblockUser(targetUid) {
  const me = getCurrentUser();
  if (!me) return;
  await deleteDoc(doc(db, "users", me.uid, "blocked", targetUid));
}

export async function getBlockedList() {
  const me = getCurrentUser();
  if (!me) return [];
  const snapshot = await getDocs(collection(db, "users", me.uid, "blocked"));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getBlockedUidSet() {
  const list = await getBlockedList();
  return new Set(list.map((b) => b.uid));
}

// Reports are written for later manual review — there's no automated
// moderation backend, but having a real reporting mechanism is what's
// required, not automated action on every report.
export async function reportUser(targetUid, targetUsername, reason) {
  const me = getCurrentUser();
  if (!me) return { success: false };
  try {
    await addDoc(collection(db, "reports"), {
      reportedUid: targetUid,
      reportedUsername: targetUsername,
      reportedByUid: me.uid,
      reportedByUsername: me.displayName,
      reason,
      createdAt: Date.now(),
      status: "pending",
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Couldn't submit report.",
    };
  }
}
