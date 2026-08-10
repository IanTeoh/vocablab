import { getApp } from "firebase/app";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../firebaseConfig";

const storage = getStorage(getApp());

// Simple colored-circle-plus-emoji defaults, no image assets needed.
export const DEFAULT_AVATARS = [
  { id: "fox", color: "#E8A94F", emoji: "🦊" },
  { id: "owl", color: "#8A6238", emoji: "🦉" },
  { id: "cat", color: "#D9A441", emoji: "🐱" },
  { id: "bee", color: "#F2C94C", emoji: "🐝" },
  { id: "rabbit", color: "#F2C4CC", emoji: "🐰" },
  { id: "leaf", color: "#7FA98A", emoji: "🌿" },
  { id: "star", color: "#B98CE0", emoji: "⭐" },
  { id: "book", color: "#5B9BD5", emoji: "📖" },
];

export function getDefaultAvatar(id) {
  return DEFAULT_AVATARS.find((a) => a.id === id) || DEFAULT_AVATARS[0];
}

export async function uploadAvatarImage(uid, localUri) {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `avatars/${uid}.jpg`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", uid), {
    avatarType: "upload",
    avatarUrl: url,
  });
  return url;
}

export async function setDefaultAvatar(uid, avatarId) {
  await updateDoc(doc(db, "users", uid), {
    avatarType: "default",
    avatarId,
  });
}
