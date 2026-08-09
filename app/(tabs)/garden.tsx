import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GardenHub from "../../components/GardenHub";
import { Colors } from "../../constants/theme";

export default function Garden() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <GardenHub />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
});
