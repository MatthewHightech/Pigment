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

  const projectIdNum = Number(id);
  const { projects: projectList, isLoading, error } = useProjects();
  const project = projectList.find((p) => p.id === projectIdNum);
  const { colors: paletteColors, addColor } = useProjectColors(project?.id);

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
      <View className="flex-1 items-center justify-center bg-zinc-900 p-6">
        <Text className="text-red-400 text-center">Failed to load project: {error.message}</Text>
      </View>
    );
  }

  if (isLoading || project === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        {isLoading ? (
          <ActivityIndicator size="large" color="#fafafa" />
        ) : (
          <Text className="text-zinc-500">Project not found</Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-zinc-950 font-semibold text-base flex-1" numberOfLines={1}>
          {project.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      
        <View className="px-4 py-2 border-b border-zinc-200">
          <Text className="text-zinc-600 text-xs font-medium mb-2">Palette</Text>
          {paletteColors.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {paletteColors.map((c) => (
              <View
                key={c.id}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: c.hexValue,
                  borderWidth: 1,
                  borderColor: "#d4d4d8",
                }}
              />
            ))}
          </ScrollView>
          )}
          {paletteColors.length === 0 && (
            <Text className="text-zinc-500 text-sm">Tap and hold to add colors</Text>
          )}
        </View>

      <View className="flex-1" onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        {isMissingImage ? (
          <View className="flex-1 items-center justify-center bg-zinc-900">
            <Text className="text-zinc-500">Missing image</Text>
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
    </View>
  );
}
