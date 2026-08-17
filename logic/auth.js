import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { clearLocalProgress } from "./fullProgressSync";

// Friendly messages for the Firebase error codes people will
// actually hit, instead of showing raw "auth/invalid-email" strings.
const ERROR_MESSAGES = {
  "auth/email-already-in-use":
    "That email is already registered — try logging in instead.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests":
    "Too many attempts — please wait a moment and try again.",
};

function friendlyError(error) {
  return (
    ERROR_MESSAGES[error?.code] || "Something went wrong. Please try again."
  );
}

export async function signUp(email, password, username) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });

    // Create their public-facing profile document — this is what a
    // future friend would eventually see, so it only holds what's
    // meant to be shareable, never anything sensitive.
    await setDoc(doc(db, "users", result.user.uid), {
      username,
      usernameLower: username.toLowerCase(),
      createdAt: Date.now(),
    });

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: friendlyError(error) };
  }
}

export async function signIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: friendlyError(error) };
  }
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

// Fires immediately with the current auth state, and again whenever
// it changes (sign in, sign out, token refresh). Returns an unsubscribe
// function — call it in a useEffect cleanup.
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      // Deliberately vague — confirming whether an email is
      // registered is an account-enumeration risk.
      return { success: true };
    }
    if (error?.code === "auth/invalid-email") {
      return {
        success: false,
        error: "That doesn't look like a valid email address.",
      };
    }
    return {
      success: false,
      error: "Couldn't send the reset email. Please try again.",
    };
  }
}

export async function updateUsername(newUsername) {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "Not signed in." };
  try {
    await updateProfile(user, { displayName: newUsername });
    await updateDoc(doc(db, "users", user.uid), {
      username: newUsername,
      usernameLower: newUsername.toLowerCase(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Couldn't update username." };
  }
}

// Fully removes the account: Firebase Auth user, public profile,
// full progress backup, friend relationships on both sides, any
// pending friend requests, and the local device's progress.
export async function deleteAccount(password) {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "Not signed in." };

  try {
    if (password) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    const uid = user.uid;

    const friendsSnapshot = await getDocs(
      collection(db, "users", uid, "friends"),
    );
    for (const friendDoc of friendsSnapshot.docs) {
      await deleteDoc(doc(db, "users", friendDoc.id, "friends", uid)).catch(
        () => {},
      );
      await deleteDoc(doc(db, "users", uid, "friends", friendDoc.id)).catch(
        () => {},
      );
    }

    const outgoing = await getDocs(
      query(collection(db, "friendRequests"), where("fromUid", "==", uid)),
    );
    const incoming = await getDocs(
      query(collection(db, "friendRequests"), where("toUid", "==", uid)),
    );
    for (const d of [...outgoing.docs, ...incoming.docs]) {
      await deleteDoc(doc(db, "friendRequests", d.id)).catch(() => {});
    }

    await deleteDoc(doc(db, "users", uid)).catch(() => {});
    await deleteDoc(doc(db, "userProgress", uid)).catch(() => {});

    await deleteUser(user);
    await clearLocalProgress();

    return { success: true };
  } catch (error) {
    if (error?.code === "auth/requires-recent-login") {
      return {
        success: false,
        requiresReauth: true,
        error:
          "For security, please re-enter your password to confirm deletion.",
      };
    }
    if (
      error?.code === "auth/wrong-password" ||
      error?.code === "auth/invalid-credential"
    ) {
      return { success: false, error: "Incorrect password." };
    }
    return {
      success: false,
      error: error?.message || "Couldn't delete account.",
    };
  }
}
