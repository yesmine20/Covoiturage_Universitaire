import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { supabase } from "@/lib/supabase";

export default function AccueilScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1120;
  const isCompact = width < 620;
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setSessionEmail(user?.email ?? null);
    };

    void syncUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSessionEmail(session?.user?.email ?? null);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        <View style={styles.container}>
          <View style={[styles.heroRow, !isWide && styles.heroRowStack]}>
            <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>CU</Text>
                </View>

                <View>
                  <Text style={styles.brandTitle}>
                    Covoiturage Universitaire
                  </Text>
                  <Text style={styles.brandSubtitle}>
                    Simple, fiable, pensé pour le campus
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}
              >
                Le covoiturage étudiant,{"\n"}
                simple et
                <Text style={styles.heroTitleAccent}> sans friction.</Text>
              </Text>

              <Text style={styles.heroText}>
                Trouvez vos trajets, réservez en quelques clics et voyagez en
                toute confiance avec la communauté universitaire.
              </Text>
            </View>

            <View style={styles.mapShell}>
              <View style={styles.mapCard}>
                <View style={styles.mapRoadHorizontalOne} />
                <View style={styles.mapRoadHorizontalTwo} />
                <View style={styles.mapRoadVerticalOne} />
                <View style={styles.mapRoadVerticalTwo} />
                <View style={styles.mapRoadTiltOne} />
                <View style={styles.mapRoadTiltTwo} />

                <View style={[styles.routeSegment, styles.routeSegmentOne]} />
                <View style={[styles.routeSegment, styles.routeSegmentTwo]} />
                <View style={[styles.routeSegment, styles.routeSegmentThree]} />
                <View style={[styles.routeSegment, styles.routeSegmentFour]} />
                <View style={[styles.routeSegment, styles.routeSegmentFive]} />

                <View style={[styles.pin, styles.pinStart]}>
                  <Text style={styles.pinGlyph}>📍</Text>
                </View>

                <View style={[styles.pin, styles.pinEnd]}>
                  <Text style={styles.pinGlyph}>📍</Text>
                </View>

                <View style={styles.mapBubble}>
                  <Text style={styles.mapBubblePrice}>2,000 TND</Text>
                  <Text style={styles.mapBubbleMeta}>2 places disponibles</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 34,
  },
  glowTopRight: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#dce9ff",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: 40,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#e8f0ff",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 28,
    minHeight: 720,
  },
  heroRowStack: {
    flexDirection: "column",
    alignItems: "stretch",
    minHeight: undefined,
  },
  heroCopy: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 8,
  },
  heroCopyWide: {
    maxWidth: 620,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 26,
  },
  brandBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2f80ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2f80ff",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  brandBadgeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  brandTitle: {
    color: "#1f2430",
    fontSize: 20,
    fontWeight: "800",
  },
  brandSubtitle: {
    color: "#6f7e95",
    fontSize: 13,
    marginTop: 3,
  },
  heroTitle: {
    color: "#1f2430",
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "900",
    letterSpacing: -1.6,
    marginBottom: 18,
  },
  heroTitleCompact: {
    fontSize: 40,
    lineHeight: 46,
  },
  heroTitleAccent: {
    color: "#2f80ff",
  },
  heroText: {
    color: "#66758a",
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 520,
    marginBottom: 28,
  },
  mapShell: {
    flex: 1,
    minHeight: 620,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: "#edf1f7",
    shadowColor: "#29507c",
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
  mapCard: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: "#f1f4f9",
    overflow: "hidden",
    position: "relative",
  },
  mapRoadHorizontalOne: {
    position: "absolute",
    top: 54,
    left: -10,
    width: 520,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "15deg" }],
  },
  mapRoadHorizontalTwo: {
    position: "absolute",
    top: 210,
    left: -40,
    width: 520,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-14deg" }],
  },
  mapRoadVerticalOne: {
    position: "absolute",
    top: -20,
    left: 130,
    width: 10,
    height: 700,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "12deg" }],
  },
  mapRoadVerticalTwo: {
    position: "absolute",
    top: -40,
    right: 96,
    width: 10,
    height: 740,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-8deg" }],
  },
  mapRoadTiltOne: {
    position: "absolute",
    top: 90,
    right: 4,
    width: 290,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "58deg" }],
  },
  mapRoadTiltTwo: {
    position: "absolute",
    bottom: 96,
    left: 28,
    width: 240,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-48deg" }],
  },
  routeSegment: {
    position: "absolute",
    height: 8,
    borderRadius: 8,
    backgroundColor: "#2f80ff",
  },
  routeSegmentOne: {
    top: 92,
    left: 68,
    width: 118,
    transform: [{ rotate: "42deg" }],
  },
  routeSegmentTwo: {
    top: 170,
    left: 156,
    width: 90,
    transform: [{ rotate: "18deg" }],
  },
  routeSegmentThree: {
    top: 238,
    left: 214,
    width: 110,
    transform: [{ rotate: "78deg" }],
  },
  routeSegmentFour: {
    top: 336,
    left: 292,
    width: 106,
    transform: [{ rotate: "-12deg" }],
  },
  routeSegmentFive: {
    top: 432,
    left: 384,
    width: 102,
    transform: [{ rotate: "56deg" }],
  },
  pin: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5c95ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2f80ff",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pinGlyph: {
    fontSize: 20,
  },
  pinStart: {
    top: 24,
    left: 34,
  },
  pinEnd: {
    right: 38,
    bottom: 34,
  },
  mapBubble: {
    position: "absolute",
    top: 118,
    right: 28,
    minWidth: 150,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#18355d",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  mapBubblePrice: {
    color: "#1f2430",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  mapBubbleMeta: {
    color: "#66758a",
    fontSize: 12,
    fontWeight: "600",
  },
});
