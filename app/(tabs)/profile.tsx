import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AccountSection from "../../components/AccountSection";
import AchievementsModal from "../../components/AchievementsModal";
import FavoriteWordsModal from "../../components/FavoriteWordsModal";
import GardenBackground from "../../components/GardenBackground";
import PressableScale from "../../components/PressableScale";
import SynonymFinderModal from "../../components/SynonymFinderModal";
import WordDetailModal from "../../components/WordDetailModal";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";
import idioms from "../../data/idioms.json";
import roots from "../../data/roots.json";
import words from "../../data/words.json";
import { getContextQuizHighScore } from "../../logic/contextQuizHighScore";
import { learnEverything } from "../../logic/devTools";
import { getDictionary, getStats, resetAllData } from "../../logic/dictionary";
import { getIdiomDictionary } from "../../logic/idiomDictionary";
import { getIdiomojiHighScore } from "../../logic/idiomojiHighScore";
import { getSessionsCompletedCount } from "../../logic/levels";
import { getLoanwordHighScore } from "../../logic/loanwordHighScore";
import { getRarityStyle } from "../../logic/rarity";
import { getOverallDerivativesHighScore } from "../../logic/rootDerivativesHighScore";
import { getRootDictionary } from "../../logic/rootDictionary";
import { getUnscrambleHighScore } from "../../logic/unscrambleHighScore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function chunkArray(arr: any[], size: number) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function Profile() {
  const [stats, setStats] = useState<any | null>(null);
  const [collectedWords, setCollectedWords] = useState<any[]>([]);
  const [collectedIdioms, setCollectedIdioms] = useState<any[]>([]);
  const [collectedRoots, setCollectedRoots] = useState<any[]>([]);
  const [derivativesHighScore, setDerivativesHighScore] = useState<
    number | null
  >(null);
  const [loanwordHighScore, setLoanwordHighScore] = useState<number | null>(
    null,
  );
  const [idiomojiHighScore, setIdiomojiHighScore] = useState<number | null>(
    null,
  );
  const [unscrambleHighScore, setUnscrambleHighScore] = useState<number | null>(
    null,
  );
  const [contextQuizHighScore, setContextQuizHighScore] = useState<
    number | null
  >(null);
  const [adventureLevel, setAdventureLevel] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [achievementsModalVisible, setAchievementsModalVisible] =
    useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [synonymFinderVisible, setSynonymFinderVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const RARITY_ORDER: Record<string, number> = {
    common: 0,
    rare: 1,
    epic: 2,
    legendary: 3,
  };

  function openCategory(item: any) {
    const sortedWords = [...item.words].sort(
      (a: any, b: any) =>
        (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0),
    );
    setSelectedCategory({ ...item, words: sortedWords });
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }

  function closeCategoryModal() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setSelectedCategory(null));
  }

  useFocusEffect(
    useCallback(() => {
      getStats(words.length).then(setStats);
      getDictionary().then(setCollectedWords);
      getIdiomDictionary().then(setCollectedIdioms);
      getRootDictionary().then(setCollectedRoots);
      getOverallDerivativesHighScore().then((r) =>
        setDerivativesHighScore(r.score),
      );
      getLoanwordHighScore().then(setLoanwordHighScore);
      getIdiomojiHighScore().then(setIdiomojiHighScore);
      getUnscrambleHighScore().then(setUnscrambleHighScore);
      getContextQuizHighScore().then(setContextQuizHighScore);
      getSessionsCompletedCount().then((count) => setAdventureLevel(count + 1));
    }, []),
  );

  const collectedSet = new Set(collectedWords.map((w) => w.word));
  const idiomCollectedSet = new Set(collectedIdioms.map((w) => w.word));
  const rootCollectedSet = new Set(collectedRoots.map((r) => r.root));

  const wordSection = {
    category: "Words",
    words: words,
    caught: collectedSet.size,
    total: words.length,
    percent: Math.round((collectedSet.size / words.length) * 100),
  };

  const idiomSection = {
    category: "Idioms",
    words: idioms,
    caught: idiomCollectedSet.size,
    total: idioms.length,
    percent: Math.round((idiomCollectedSet.size / idioms.length) * 100),
    isIdiom: true,
  };

  const rootSection = {
    category: "Roots",
    words: roots,
    caught: rootCollectedSet.size,
    total: roots.length,
    percent: Math.round((rootCollectedSet.size / roots.length) * 100),
    isRoot: true,
  };

  const sections = [wordSection, idiomSection, rootSection];

  const searchPool = [
    ...(words as any[]).map((w) => ({ ...w, _type: "word", _name: w.word })),
    ...(idioms as any[]).map((w) => ({ ...w, _type: "idiom", _name: w.word })),
    ...(roots as any[]).map((r) => ({ ...r, _type: "root", _name: r.root })),
  ];

  const isSearching = searchQuery.trim().length > 0;
  const filteredWords = isSearching
    ? searchPool
        .filter((item) =>
          item._name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
        .sort((a, b) => {
          const caughtOf = (item: any) => {
            if (item._type === "word")
              return collectedSet.has(item._name) ? 1 : 0;
            if (item._type === "idiom")
              return idiomCollectedSet.has(item._name) ? 1 : 0;
            return rootCollectedSet.has(item._name) ? 1 : 0;
          };
          const aCaught = caughtOf(a);
          const bCaught = caughtOf(b);
          if (aCaught !== bCaught) return bCaught - aCaught;
          return a._name.localeCompare(b._name);
        })
    : [];

  function handleReset() {
    Alert.alert("Reset all data?", "For testing only.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await resetAllData();
          setStats(await getStats(words.length));
          setCollectedWords([]);
          setCollectedIdioms([]);
          setCollectedRoots([]);
          setAdventureLevel(1);
          setIdiomojiHighScore(0);
          setDerivativesHighScore(0);
          setLoanwordHighScore(0);
        },
      },
    ]);
  }

  function handleLearnAll() {
    Alert.alert(
      "Learn everything?",
      "Fills every dictionary — words, idioms, and roots. For testing only.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Learn All",
          onPress: async () => {
            await learnEverything(words, idioms, roots);
            setStats(await getStats(words.length));
            setCollectedWords(await getDictionary());
            setCollectedIdioms(await getIdiomDictionary());
            setCollectedRoots(await getRootDictionary());
          },
        },
      ],
    );
  }

  function renderWordTile(w: any) {
    const caught = collectedSet.has(w.word);
    const rarity = getRarityStyle(w.rarity);
    const tileStyle = [
      styles.wordTile,
      caught
        ? {
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: rarity.color,
          }
        : styles.tileLocked,
    ];
    const content = (
      <>
        <Text style={styles.tileEmoji}>{caught ? "📖" : "🔒"}</Text>
        <Text
          style={[styles.tileText, caught && { color: rarity.color }]}
          numberOfLines={1}
        >
          {caught ? w.word : "?????"}
        </Text>
      </>
    );

    if (!caught) {
      return (
        <View key={w.word} style={tileStyle}>
          {content}
        </View>
      );
    }

    return (
      <PressableScale
        key={w.word}
        style={tileStyle}
        onPress={() => setSelectedWord(w)}
      >
        {content}
      </PressableScale>
    );
  }

  function renderIdiomTile(w: any) {
    const caught = idiomCollectedSet.has(w.word);
    const tileStyle = [
      styles.wordTile,
      caught
        ? {
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: Colors.secondary,
          }
        : styles.tileLocked,
    ];
    const content = (
      <>
        <Text style={styles.tileEmoji}>{caught ? w.icon || "💬" : "🔒"}</Text>
        <Text
          style={[styles.tileText, caught && { color: Colors.secondary }]}
          numberOfLines={2}
        >
          {caught ? w.word : "?????"}
        </Text>
      </>
    );

    if (!caught) {
      return (
        <View key={w.word} style={tileStyle}>
          {content}
        </View>
      );
    }

    return (
      <PressableScale
        key={w.word}
        style={tileStyle}
        onPress={() => setSelectedWord(w)}
      >
        {content}
      </PressableScale>
    );
  }

  function renderRootTile(r: any) {
    const caught = rootCollectedSet.has(r.root);
    const tileStyle = [
      styles.wordTile,
      caught
        ? {
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: Colors.primary,
          }
        : styles.tileLocked,
    ];
    const content = (
      <>
        <Text style={styles.tileEmoji}>{caught ? r.icon || "🌱" : "🔒"}</Text>
        <Text
          style={[styles.tileText, caught && { color: Colors.primary }]}
          numberOfLines={2}
        >
          {caught ? r.root : "?????"}
        </Text>
      </>
    );

    if (!caught) {
      return (
        <View key={r.root} style={tileStyle}>
          {content}
        </View>
      );
    }

    return (
      <PressableScale
        key={r.root}
        style={tileStyle}
        onPress={() =>
          setSelectedWord({
            word: r.root,
            definition: `${r.meaning} (${r.origin})`,
            example: r.example,
            icon: r.icon,
          })
        }
      >
        {content}
      </PressableScale>
    );
  }

  function renderSearchResultRow(item: any) {
    const type = item._type;
    const caught =
      type === "word"
        ? collectedSet.has(item._name)
        : type === "idiom"
          ? idiomCollectedSet.has(item._name)
          : rootCollectedSet.has(item._name);

    const rarity = type === "word" ? getRarityStyle(item.rarity) : null;
    const accentColor =
      type === "idiom"
        ? Colors.secondary
        : type === "root"
          ? Colors.primary
          : rarity!.color;
    const lockedIcon = "🔒";
    const caughtIcon =
      type === "word"
        ? "📖"
        : type === "root"
          ? item.icon || "🌱"
          : item.icon || "💬";
    const typeLabel =
      type === "word" ? "Word" : type === "idiom" ? "Idiom" : "Root";

    const content = (
      <>
        <Text style={styles.resultEmoji}>
          {caught ? caughtIcon : lockedIcon}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.resultWord,
              caught ? { color: Colors.ink } : { color: Colors.inkMuted },
            ]}
          >
            {caught ? item._name : "?????"}
          </Text>
          <Text style={styles.resultSubtext}>
            {typeLabel}
            {type === "word" && caught ? ` · ${rarity!.label}` : ""}
          </Text>
        </View>
        {caught && (
          <View
            style={[styles.resultRarityDot, { backgroundColor: accentColor }]}
          />
        )}
      </>
    );

    const handlePress = () => {
      if (type === "root") {
        setSelectedWord({
          word: item.root,
          definition: `${item.meaning} (${item.origin})`,
          example: item.example,
          icon: item.icon,
        });
      } else {
        setSelectedWord(item);
      }
    };

    if (!caught) {
      return (
        <View key={`${type}-${item._name}`} style={styles.resultRow}>
          {content}
        </View>
      );
    }

    return (
      <PressableScale
        key={`${type}-${item._name}`}
        style={styles.resultRow}
        onPress={handlePress}
      >
        {content}
      </PressableScale>
    );
  }

  function renderCategorySection(item: any) {
    const isIdiom = !!item.isIdiom;
    const isRoot = !!item.isRoot;
    const relevantSet = isRoot
      ? rootCollectedSet
      : isIdiom
        ? idiomCollectedSet
        : collectedSet;
    const tileRenderer = isRoot
      ? renderRootTile
      : isIdiom
        ? renderIdiomTile
        : renderWordTile;
    const idField = isRoot ? "root" : "word";

    const RARITY_RANK: Record<string, number> = {
      legendary: 4,
      epic: 3,
      rare: 2,
      common: 1,
    };
    const sortedWords = [...item.words].sort((a: any, b: any) => {
      const scoreOf = (w: any) =>
        (relevantSet.has(w[idField]) ? 10 : 0) +
        (!isIdiom && !isRoot ? RARITY_RANK[w.rarity] || 0 : 0);
      return scoreOf(b) - scoreOf(a);
    });
    const previewWords = sortedWords.slice(0, 3);
    const hasMore = item.words.length > 3;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <View style={styles.headerRightRow}>
            <Text style={styles.categoryProgressText}>
              {item.caught}/{item.total}
            </Text>
            {hasMore && (
              <PressableScale
                style={styles.seeAllLink}
                onPress={() => openCategory(item)}
              >
                <Text style={styles.seeAllLinkText}>See all →</Text>
              </PressableScale>
            )}
          </View>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[styles.progressBarFill, { width: `${item.percent}%` }]}
          />
        </View>
        <View style={styles.grid}>
          {previewWords.map((w: any) => tileRenderer(w))}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={[]}
    >
      <GardenBackground />

      <FlatList
        style={styles.container}
        data={isSearching ? filteredWords : sections}
        keyExtractor={(item: any) =>
          isSearching ? `${item._type}-${item._name}` : item.category
        }
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <AccountSection />

            <View style={styles.dictionaryDivider} />
            <Text style={styles.title}>Your Dictionary</Text>

            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>🔥 Streak</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.wordsCollected}</Text>
                  <Text style={styles.statLabel}>Words Caught</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {stats.percentComplete}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
                <PressableScale
                  style={[styles.statBox, styles.statBoxAction]}
                  onPress={() => setStatsModalVisible(true)}
                >
                  <Text style={styles.statActionIcon}>📊</Text>
                  <Text style={styles.statActionLabel}>See Stats</Text>
                </PressableScale>
              </View>
            )}

            <PressableScale
              style={styles.achievementsButton}
              onPress={() => setAchievementsModalVisible(true)}
            >
              <Text style={styles.achievementsButtonIcon}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.achievementsButtonTitle}>Achievements</Text>
                <Text style={styles.achievementsButtonSubtitle}>
                  View your unlocked badges
                </Text>
              </View>
              <Text style={styles.achievementsButtonArrow}>→</Text>
            </PressableScale>

            <PressableScale
              style={styles.achievementsButton}
              onPress={() => setFavoritesModalVisible(true)}
            >
              <Text style={styles.achievementsButtonIcon}>❤️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.achievementsButtonTitle}>
                  Favorite Words
                </Text>
                <Text style={styles.achievementsButtonSubtitle}>
                  Words you want to use more
                </Text>
              </View>
              <Text style={styles.achievementsButtonArrow}>→</Text>
            </PressableScale>

            <PressableScale
              style={styles.achievementsButton}
              onPress={() => setSynonymFinderVisible(true)}
            >
              <Text style={styles.achievementsButtonIcon}>🎭</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.achievementsButtonTitle}>
                  Synonyms & Register
                </Text>
                <Text style={styles.achievementsButtonSubtitle}>
                  Find a formal or casual way to say something
                </Text>
              </View>
              <Text style={styles.achievementsButtonArrow}>→</Text>
            </PressableScale>

            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search words, idioms, roots..."
                placeholderTextColor={Colors.inkMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isSearching && (
                <PressableScale
                  style={styles.searchClear}
                  onPress={() => setSearchQuery("")}
                >
                  <Text style={styles.searchClearText}>✕</Text>
                </PressableScale>
              )}
            </View>

            {isSearching && (
              <Text style={styles.resultsCount}>
                {filteredWords.length}{" "}
                {filteredWords.length === 1 ? "result" : "results"}
              </Text>
            )}
          </>
        }
        renderItem={({ item }) =>
          isSearching
            ? renderSearchResultRow(item)
            : renderCategorySection(item)
        }
        ListEmptyComponent={
          isSearching ? (
            <Text style={styles.noResults}>No words match "{searchQuery}"</Text>
          ) : null
        }
        ListFooterComponent={
          !isSearching ? (
            <>
              <PressableScale
                style={styles.learnAllButton}
                onPress={handleLearnAll}
              >
                <Text style={styles.learnAllButtonText}>
                  🧪 Learn All Words (dev only)
                </Text>
              </PressableScale>
              <PressableScale style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>
                  🧪 Reset App Data (dev only)
                </Text>
              </PressableScale>
            </>
          ) : null
        }
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
      />

      <Modal
        visible={!!selectedCategory}
        animationType="none"
        transparent
        onRequestClose={closeCategoryModal}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View
            style={[
              styles.modalSafeArea,
              { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
          >
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalContent}
              data={chunkArray(selectedCategory?.words ?? [], 3)}
              keyExtractor={(row: any[], index: number) =>
                `row-${index}-${selectedCategory?.isRoot ? row[0]?.root : row[0]?.word}`
              }
              initialNumToRender={12}
              windowSize={5}
              maxToRenderPerBatch={12}
              ListHeaderComponent={
                <>
                  <Text style={styles.modalTitle}>
                    {selectedCategory?.category}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedCategory?.caught}/{selectedCategory?.total} caught
                  </Text>
                </>
              }
              renderItem={({ item: row }: { item: any[] }) => (
                <View style={styles.grid}>
                  {row.map((w: any) =>
                    selectedCategory?.isRoot
                      ? renderRootTile(w)
                      : selectedCategory?.isIdiom
                        ? renderIdiomTile(w)
                        : renderWordTile(w),
                  )}
                </View>
              )}
            />

            <View style={styles.modalFooter}>
              <PressableScale
                style={styles.closeButton}
                onPress={closeCategoryModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </PressableScale>
            </View>

            <WordDetailModal
              visible={!!selectedWord}
              word={selectedWord}
              onClose={() => setSelectedWord(null)}
              standalone={false}
            />
          </View>
        </Animated.View>
      </Modal>

      <Modal
        visible={statsModalVisible}
        animationType="slide"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View
          style={[
            styles.modalSafeArea,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Your Stats</Text>

            <Text style={styles.statsSectionLabel}>Vocabulary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {stats?.currentStreak ?? "-"}
                </Text>
                <Text style={styles.statLabel}>🔥 Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {stats?.wordsCollected ?? "-"}
                </Text>
                <Text style={styles.statLabel}>Words Caught</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {stats?.percentComplete ?? "-"}%
                </Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{adventureLevel ?? "-"}</Text>
                <Text style={styles.statLabel}>Adventure Level</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {unscrambleHighScore ?? 0}
                </Text>
                <Text style={styles.statLabel}>🔤 Unscramble Best</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {contextQuizHighScore ?? 0}
                </Text>
                <Text style={styles.statLabel}>📝 Context Clues Best</Text>
              </View>
            </View>

            <Text style={styles.statsSectionLabel}>Idioms</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{idiomSection.caught}</Text>
                <Text style={styles.statLabel}>💬 Idioms Caught</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{idiomSection.percent}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{idiomojiHighScore ?? 0}</Text>
                <Text style={styles.statLabel}>🎮 Idiomoji Best</Text>
              </View>
            </View>

            <Text style={styles.statsSectionLabel}>Etymology</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{rootSection.caught}</Text>
                <Text style={styles.statLabel}>🌱 Roots Caught</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{rootSection.percent}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {derivativesHighScore ?? 0}
                </Text>
                <Text style={styles.statLabel}>🧩 Derivatives Best</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{loanwordHighScore ?? 0}</Text>
                <Text style={styles.statLabel}>🌍 Origins Best</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <PressableScale
              style={styles.closeButton}
              onPress={() => setStatsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>
        </View>
      </Modal>

      <WordDetailModal
        visible={!!selectedWord}
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

      <AchievementsModal
        visible={achievementsModalVisible}
        onClose={() => setAchievementsModalVisible(false)}
      />
      <FavoriteWordsModal
        visible={favoritesModalVisible}
        onClose={() => setFavoritesModalVisible(false)}
      />
      <SynonymFinderModal
        visible={synonymFinderVisible}
        onClose={() => setSynonymFinderVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dictionaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    color: Colors.ink,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  statsSectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  statBox: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBoxAction: {
    backgroundColor: Colors.surface,
  },
  achievementsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  achievementsButtonIcon: { fontSize: 28, marginRight: Spacing.sm },
  achievementsButtonTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  achievementsButtonSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  achievementsButtonArrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 20,
    color: Colors.accent,
  },
  statActionIcon: { fontSize: 22, marginBottom: 2 },
  statActionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.accent,
    marginTop: 4,
  },
  statNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: Spacing.sm,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
    paddingVertical: 10,
  },
  searchClear: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  searchClearText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  resultsCount: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: Spacing.sm,
  },
  resultEmoji: { fontSize: 20, marginRight: 12 },
  resultWord: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  resultSubtext: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  resultRarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  noResults: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  categorySection: { marginBottom: Spacing.lg },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryProgressText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  seeAllLink: {
    marginLeft: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  seeAllLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  wordTile: {
    width: "31%",
    aspectRatio: 1,
    margin: "1.16%",
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  tileLocked: { backgroundColor: Colors.border },
  tileEmoji: { fontSize: 22, marginBottom: 4 },
  tileText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.ink,
    textAlign: "center",
  },
  learnAllButton: {
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  learnAllButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.success,
    fontSize: 13,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  resetButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.error,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    width: SCREEN_WIDTH,
  },
  modalSafeArea: { flex: 1 },
  modalContent: { padding: Spacing.lg, paddingBottom: Spacing.lg },
  modalTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
  },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
