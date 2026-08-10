import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

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
