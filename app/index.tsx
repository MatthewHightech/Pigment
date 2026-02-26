import { View, Text, TouchableOpacity, FlatList, Alert, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { Plus, ImageOff } from "lucide-react-native";
import { eq } from "drizzle-orm";
import { useProjects } from "../hooks/ProjectsContext";
import { db } from "../db";
import { projects } from "../db/schema";
import { AddProjectModal } from "../components/AddProjectModal";

import "../global.css";


const PLACEHOLDER_URI = "missing";
const COLS = 2;
const GAP = 12;
const PAD = 16;
const CELL_SIZE = (Dimensions.get("window").width - PAD * 2 - GAP) / COLS;

export default function Index() {
  const router = useRouter();
  const { projects: projectList, isLoading, error } = useProjects();
  const [addModalVisible, setAddModalVisible] = useState(false);

  const openAddModal = useCallback(() => {
    setAddModalVisible(true);
  }, []);

  const handleCreateProject = useCallback(async (name: string, imageUri: string) => {
    await db.insert(projects).values({
      name,
      imageUri,
      createdAt: new Date(),
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
          onPress={openAddModal}
          className="rounded-squircle-sm w-10 h-10 bg-zinc-800 border border-zinc-700 items-center justify-center"
        >
          <Plus size={22} color="#fafafa" />
        </TouchableOpacity>
      </View>

      <AddProjectModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreate={handleCreateProject}
      />

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
