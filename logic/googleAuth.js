import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
    GoogleAuthProvider,
    linkWithCredential,
    signInWithCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_WEB_CLIENT_ID =
  "935254488167-bk0adsmqu4oo5dkl4o17t1oljor0q46b.apps.googleusercontent.com";

export function useGoogleAuthRequest() {
  return Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });
}

// Call this when the auth response comes back successful. If someone
// is already signed in (e.g. with email/password), this LINKS Google
// to that same account rather than creating a new one — same uid,
// same dictionary, same stats, either way they sign in from now on.
export async function handleGoogleAuthResponse(response) {
  if (response?.type !== "success") return { success: false };

  const { id_token } = response.params;
  const credential = GoogleAuthProvider.credential(id_token);

  try {
    if (auth.currentUser) {
      const result = await linkWithCredential(auth.currentUser, credential);
      return { success: true, user: result.user, linked: true };
    }

    const result = await signInWithCredential(auth, credential);
    // First time signing in with Google directly (not linking) — make
    // sure their public profile document exists, same as email signup.
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        username: result.user.displayName || "Player",
        usernameLower: (result.user.displayName || "player").toLowerCase(),
        createdAt: Date.now(),
      },
      { merge: true },
    );
    return { success: true, user: result.user, linked: false };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Couldn't connect Google account.",
    };
  }
}
