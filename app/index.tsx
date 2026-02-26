import { View, Text, TouchableOpacity, FlatList, Alert, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { Plus, ImageOff } from "lucide-react-native";
import { eq } from "drizzle-orm";
import { useProjects } from "../hooks/ProjectsContext";
import { db } from "../db";
import { projects } from "../db/schema";

import "../global.css";


const PLACEHOLDER_URI = "missing";
const COLS = 2;
const GAP = 12;
const PAD = 16;
const CELL_SIZE = (Dimensions.get("window").width - PAD * 2 - GAP) / COLS;

export default function Index() {
  const router = useRouter();
  const { projects: projectList, isLoading, error } = useProjects();

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos to add a project.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const name = uri.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Project";

    // Convert to JPEG so HEIC and other formats work for display and color sampling
    let imageUri = uri;
    try {
      const { uri: jpegUri } = await manipulateAsync(uri, [], {
        format: SaveFormat.JPEG,
        compress: 0.9,
      });
      imageUri = jpegUri;
    } catch {
      // Keep original URI if conversion fails (e.g. already JPEG)
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const createdAt = new Date();
    await db.insert(projects).values({
      name: name.slice(0, 50),
      imageUri,
      createdAt,
    });
  }, []);

  const openProject = useCallback(
    (id: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({ pathname: "/workspace/[id]", params: { id: String(id) } } as any);
    },
    [router]
  ) as (id: number) => void;

  const confirmDeleteProject = useCallback((item: (typeof projectList)[number]) => {
    Alert.alert(
      "Delete project",
      `Remove "${item.name}" and its palette? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db.delete(projects).where(eq(projects.id, item.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof projectList)[number] }) => {
      const isMissing = item.imageUri === PLACEHOLDER_URI || !item.imageUri;
      return (
        <Pressable
          onPress={() => openProject(item.id)}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            confirmDeleteProject(item);
          }}
          style={{ width: CELL_SIZE, height: CELL_SIZE + 36 }}
          className="rounded-squircle overflow-hidden bg-zinc-800 border border-zinc-700/50"
        >
          <View style={{ width: CELL_SIZE, height: CELL_SIZE }}>
            {isMissing ? (
              <View className="flex-1 items-center justify-center bg-zinc-800" style={{ width: CELL_SIZE, height: CELL_SIZE }}>
                <ImageOff size={40} color="#71717a" />
                <Text className="text-zinc-500 text-xs mt-2 px-2 text-center">
                  Missing image
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                contentFit="cover"
              />
            )}
          </View>
          <View className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 px-2 py-2">
            <Text className="text-zinc-100 text-sm font-medium" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </Pressable>
      );
    },
    [openProject, confirmDeleteProject]
  );

  if (error) {
    return (
      <View className="flex-1 bg-cream-50 items-center justify-center p-6">
        <Text className="text-red-600 text-center">Failed to load projects: {error.message}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-cream-50 items-center justify-center p-6">
        <Text className="text-zinc-500">Loading projects…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream-50 pt-16 px-4 pb-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-semibold text-zinc-950">Pigment</Text>
        <TouchableOpacity
          onPress={pickImage}
          className="rounded-squircle-sm w-10 h-10 bg-zinc-800 border border-zinc-700 items-center justify-center"
        >
          <Plus size={22} color="#fafafa" />
        </TouchableOpacity>
      </View>
      {projectList.length > 0 ? (
        <> 
      <FlatList
        data={projectList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-zinc-500 text-base mb-2">No projects yet</Text>
            <Text className="text-zinc-600 text-sm">Tap + to add an image</Text>
          </View>
        }
      />
      </>
      ) : (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-zinc-500 text-base mb-2">No projects yet</Text>
          <Text className="text-zinc-600 text-sm">Tap + to add an image</Text>
        </View>
      )}
    </View>
  );
}
