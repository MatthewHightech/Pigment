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
          style={{ width: CELL_SIZE, height: CELL_SIZE + 40 }}
          className="rounded-2xl overflow-hidden bg-muted border border-border active:opacity-95"
        >
          <View style={{ width: CELL_SIZE, height: CELL_SIZE }}>
            {isMissing ? (
              <View className="flex-1 items-center justify-center bg-muted" style={{ width: CELL_SIZE, height: CELL_SIZE }}>
                <ImageOff size={40} color="#78716c" />
                <Text className="text-muted-foreground text-xs mt-2 px-2 text-center">
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
          <View className="absolute bottom-0 left-0 right-0 bg-surface-overlay/95 px-3 py-2.5">
            <Text className="text-text-inverse text-sm font-medium" numberOfLines={1}>
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
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-destructive text-center text-base">Failed to load projects: {error.message}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-text-tertiary">Loading projects…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-16 px-4 pb-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-semibold text-text-primary">Pigment</Text>
        <TouchableOpacity
          onPress={openAddModal}
          className="rounded-xl w-11 h-11 bg-primary items-center justify-center active:opacity-90"
        >
          <Plus size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <AddProjectModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreate={handleCreateProject}
      />

      {projectList.length > 0 ? (
        <FlatList
          data={projectList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-text-secondary text-base mb-2">No projects yet</Text>
              <Text className="text-text-tertiary text-sm">Tap + to add an image</Text>
            </View>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-text-secondary text-base mb-2">No projects yet</Text>
          <Text className="text-text-tertiary text-sm">Tap + to add an image</Text>
        </View>
      )}
    </View>
  );
}
