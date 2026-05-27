import {
  Dimensions,
  Text,
  View,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { eq } from "drizzle-orm";
import { useProjects } from "../../hooks/ProjectsContext";
import { useProjectColors } from "../../hooks/useProjectColors";
import { useTheme } from "../../hooks/ThemeContext";
import { ColorPickerOverlay } from "../../components/ColorPickerOverlay";
import { PaintMixBottomSheet } from "../../components/PaintMixBottomSheet";
import { PaletteGrid } from "../../components/ui/PaletteSwatch";
import { DestructiveTextButton } from "../../components/ui/Buttons";
import { viewToImagePixel } from "../../lib/imageLayout";
import { db } from "../../db";
import { projects } from "../../db/schema";
import { fontFamilies } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_WIDTH = SCREEN_WIDTH - 32;

export default function WorkspaceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [initialPickerPixel, setInitialPickerPixel] = useState({ x: 0, y: 0 });
  const [mixSheetColor, setMixSheetColor] = useState<{ id: number; hexValue: string } | null>(
    null
  );
  const [heroHeight, setHeroHeight] = useState(HERO_WIDTH * 1.25);

  const projectIdNum = Number(id);
  const { projects: projectList, isLoading, error } = useProjects();
  const project = projectList.find((p) => p.id === projectIdNum);
  const { colors: paletteColors, addColor, deleteColor } = useProjectColors(project?.id);

  const imageUri = project?.imageUri;
  const isMissingImage = !imageUri || imageUri === "missing";

  useEffect(() => {
    if (!imageUri || isMissingImage) return;
    Image.getSize(
      imageUri,
      (w, h) => {
        setImageSize({ width: w, height: h });
        const aspect = h / w;
        setHeroHeight(Math.min(HERO_WIDTH * aspect, HERO_WIDTH * 1.4));
      },
      () => setImageSize({ width: 1, height: 1 })
    );
  }, [imageUri, isMissingImage]);

  const imageContentRect = {
    x: 0,
    y: 0,
    width: HERO_WIDTH,
    height: heroHeight,
  };

  const handleLongPress = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (isMissingImage) return;
    const point = viewToImagePixel(
      e.nativeEvent.locationX,
      e.nativeEvent.locationY,
      imageContentRect,
      imageSize.width,
      imageSize.height
    );
    if (!point) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInitialPickerPixel(point);
    setPickerOpen(true);
  };

  const handleConfirmColor = async (hex: string) => {
    try {
      await addColor(hex);
      setPickerOpen(false);
    } catch (e) {
      Alert.alert(
        "Couldn't add color",
        e instanceof Error ? e.message : "Something went wrong. Try again."
      );
    }
  };

  const confirmDeleteProject = () => {
    if (!project) return;
    Alert.alert(
      "Delete project",
      `Remove "${project.name}" and its palette? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db.delete(projects).where(eq(projects.id, project.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (e) {
              Alert.alert(
                "Couldn't delete",
                e instanceof Error ? e.message : "Something went wrong."
              );
            }
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Text style={{ color: theme.colors.error, fontFamily: fontFamilies.body, textAlign: "center" }}>
          Failed to load project: {error.message}
        </Text>
      </View>
    );
  }

  if (isLoading || project === undefined) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: fontFamilies.body }}>
            Project not found
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing["2xl"],
          paddingBottom: theme.spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={22} color={theme.colors.primary} />
          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.colors.primary,
            }}
          >
            Back
          </Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: fontFamilies.displayItalic,
            fontSize: 24,
            color: theme.colors.onBackground,
            marginHorizontal: theme.spacing.sm,
          }}
        >
          {project.name}
        </Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing["5xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <Pressable
            onLongPress={handleLongPress}
            delayLongPress={400}
            disabled={isMissingImage}
            style={({ pressed }) => ({
              width: HERO_WIDTH,
              height: heroHeight,
              borderRadius: theme.radius["2xl"],
              overflow: "hidden",
              opacity: pressed ? 0.95 : 1,
            })}
          >
            {isMissingImage ? (
              <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: theme.colors.surfaceContainerLow }}
              >
                <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: fontFamilies.body }}>
                  Missing image
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: imageUri }}
                style={{ width: HERO_WIDTH, height: heroHeight }}
                resizeMode="cover"
              />
            )}
          </Pressable>
        </View>

        <View
          style={{
            marginHorizontal: theme.spacing["2xl"],
            marginTop: theme.spacing["2xl"],
            backgroundColor: theme.colors.surfaceContainerLow,
            borderRadius: theme.radius["3xl"],
            padding: theme.spacing["2xl"],
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Sample Color
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.displayItalic,
              fontSize: 28,
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            Press and hold the canvas
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.body,
              fontSize: 15,
              lineHeight: 22,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Long-press anywhere on the reference image above to open the sampler and extract a
            pigment for your palette.
          </Text>
        </View>

        <View style={{ paddingHorizontal: theme.spacing["2xl"], marginTop: theme.spacing["3xl"] }}>
          <View
            style={{
              backgroundColor: theme.colors.surfaceContainerLow,
              borderRadius: theme.radius["3xl"],
              padding: theme.spacing["2xl"],
            }}
          >
            <View style={{ marginBottom: theme.spacing["2xl"] }}>
              <Text
                style={{
                  fontFamily: fontFamilies.displayItalic,
                  fontSize: 32,
                  color: theme.colors.onSurface,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Palette
              </Text>
              <Text
                style={{
                  fontFamily: fontFamilies.label,
                  fontSize: 10,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: theme.colors.primary,
                }}
              >
                Tap a color to see the mix ratio
              </Text>
            </View>
            <PaletteGrid
              colors={paletteColors}
              onColorPress={(color) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMixSheetColor({ id: color.id, hexValue: color.hexValue });
              }}
            />
          </View>

          <View style={{ marginTop: theme.spacing["4xl"], alignItems: "center" }}>
            <DestructiveTextButton label="Delete Project" onPress={confirmDeleteProject} />
          </View>
        </View>
      </ScrollView>

      {imageUri && !isMissingImage && (
        <ColorPickerOverlay
          visible={pickerOpen}
          imageUri={imageUri}
          imageWidth={imageSize.width}
          imageHeight={imageSize.height}
          initialPixel={initialPickerPixel}
          onConfirm={handleConfirmColor}
          onCancel={() => setPickerOpen(false)}
        />
      )}
      {mixSheetColor !== null && (
        <PaintMixBottomSheet
          visible
          hex={mixSheetColor.hexValue}
          colorId={mixSheetColor.id}
          onDelete={deleteColor}
          onClose={() => setMixSheetColor(null)}
        />
      )}
    </View>
  );
}
