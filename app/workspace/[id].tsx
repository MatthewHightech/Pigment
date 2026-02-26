import {
  Dimensions,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useProjects } from "../../hooks/ProjectsContext";
import { useProjectColors } from "../../hooks/useProjectColors";
import { ColorPickerOverlay } from "../../components/ColorPickerOverlay";
import { PaintMixBottomSheet } from "../../components/PaintMixBottomSheet";
import { getContainRect, viewToImagePixel } from "../../lib/imageLayout";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WorkspaceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [layout, setLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [initialPickerPixel, setInitialPickerPixel] = useState({ x: 0, y: 0 });
  const [mixSheetColor, setMixSheetColor] = useState<{ id: number; hexValue: string } | null>(null);

  const projectIdNum = Number(id);
  const { projects: projectList, isLoading, error } = useProjects();
  const project = projectList.find((p) => p.id === projectIdNum);
  const { colors: paletteColors, addColor, deleteColor } = useProjectColors(project?.id);

  const imageUri = project?.imageUri;
  const isMissingImage = !imageUri || imageUri === "missing";

  const containRect = getContainRect(
    layout.width,
    layout.height,
    imageSize.width,
    imageSize.height
  );
  // Image is top-aligned; content rect for touch mapping has y = 0
  const imageContentRect = {
    x: containRect.x,
    y: 0,
    width: containRect.width,
    height: containRect.height,
  };

  useEffect(() => {
    if (!imageUri || isMissingImage) return;
    Image.getSize(
      imageUri,
      (w, h) => setImageSize({ width: w, height: h }),
      () => setImageSize({ width: 1, height: 1 })
    );
  }, [imageUri, isMissingImage]);

  const handleLongPress = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
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

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-destructive text-center">Failed to load project: {error.message}</Text>
      </View>
    );
  }

  if (isLoading || project === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        {isLoading ? (
          <ActivityIndicator size="large" color="#b45309" />
        ) : (
          <Text className="text-text-tertiary">Project not found</Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-lg active:opacity-70">
          <ChevronLeft size={24} color="#1c1917" />
        </TouchableOpacity>
        <Text className="text-text-primary font-semibold text-base flex-1 text-center" numberOfLines={1}>
          {project.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="px-4 py-3 border-b border-border">
        <Text className="text-text-secondary text-xs font-medium mb-2">Palette</Text>
        <View style={{ height: 52 }}>
          {paletteColors.length > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                style={{ height: 36 }}
              >
                {paletteColors.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMixSheetColor({ id: c.id, hexValue: c.hexValue });
                    }}
                    className="w-9 h-9 rounded-full border-2 border-border-strong active:opacity-90"
                    style={{ backgroundColor: c.hexValue }}
                  />
                ))}
              </ScrollView>
              <Text className="text-text-tertiary text-xs mt-1.5">
                Tap a color to see how to mix it
              </Text>
            </>
          ) : (
            <Text className="text-text-tertiary text-sm">Tap and hold on the image to add colors</Text>
          )}
        </View>
      </View>

      <View className="flex-1" onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        {isMissingImage ? (
          <View className="flex-1 items-center justify-center bg-muted">
            <Text className="text-muted-foreground">Missing image</Text>
          </View>
        ) : (
          <Pressable
            style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}
            onLongPress={handleLongPress}
            delayLongPress={400}
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: containRect.width,
                height: containRect.height,
              }}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </View>

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
