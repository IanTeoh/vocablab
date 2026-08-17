import * as AppleAuthentication from "expo-apple-authentication";
import {
    linkWithCredential,
    OAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export async function isAppleAuthAvailable() {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

// Same linking behavior as Google — if someone's already signed in,
// this attaches Apple to their existing account (same uid, same
// dictionary, same stats). Otherwise it signs them in directly.
export async function signInWithApple() {
  try {
    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: appleCredential.identityToken,
    });

    if (auth.currentUser) {
      const result = await linkWithCredential(auth.currentUser, credential);
      return { success: true, user: result.user, linked: true };
    }

    const result = await signInWithCredential(auth, credential);

    // Apple only gives you the person's name on the very first
    // sign-in ever — worth capturing it right away.
    const displayName = appleCredential.fullName?.givenName
      ? `${appleCredential.fullName.givenName} ${appleCredential.fullName.familyName || ""}`.trim()
      : result.user.displayName || "Player";

    await setDoc(
      doc(db, "users", result.user.uid),
      {
        username: displayName,
        usernameLower: displayName.toLowerCase(),
        createdAt: Date.now(),
      },
      { merge: true },
    );

    return { success: true, user: result.user, linked: false };
  } catch (error) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      return { success: false, canceled: true };
    }
    return {
      success: false,
      error: error.message || "Couldn't sign in with Apple.",
    };
  }
}
