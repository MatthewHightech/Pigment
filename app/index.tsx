import {
  View,
  Text,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { Plus, Settings } from "lucide-react-native";
import { eq } from "drizzle-orm";
import { useProjects } from "../hooks/ProjectsContext";
import { useTheme } from "../hooks/ThemeContext";
import { db } from "../db";
import { projects } from "../db/schema";
import { AddProjectModal } from "../components/AddProjectModal";
import { AppHeader, HeaderIconButton } from "../components/ui/AppHeader";
import { ProjectCard } from "../components/ui/ProjectCard";
import { EmptyStudio } from "../components/ui/EmptyStudio";
import { fontFamilies } from "../theme";

import "../global.css";

const COLS = 2;
const GAP = 24;
const PAD = 32;
const CELL_SIZE = (Dimensions.get("window").width - PAD * 2 - GAP) / COLS;

export default function Index() {
  const router = useRouter();
  const { theme } = useTheme();
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
  );

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
    ({ item }: { item: (typeof projectList)[number] }) => (
      <ProjectCard
        id={item.id}
        name={item.name}
        imageUri={item.imageUri}
        cellSize={CELL_SIZE}
        onPress={() => openProject(item.id)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          confirmDeleteProject(item);
        }}
      />
    ),
    [openProject, confirmDeleteProject]
  );

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Text style={{ color: theme.colors.error, fontFamily: fontFamilies.body, textAlign: "center" }}>
          Failed to load projects: {error.message}
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: fontFamilies.body }}>
          Loading projects…
        </Text>
      </View>
    );
  }

  const isEmpty = projectList.length === 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <AppHeader
        left={
          <HeaderIconButton
            onPress={() => router.push({ pathname: "/settings" } as any)}
            accessibilityLabel="Settings"
          >
            <Settings size={24} color={theme.colors.primary} strokeWidth={1.75} />
          </HeaderIconButton>
        }
        right={
          <HeaderIconButton onPress={openAddModal} accessibilityLabel="Add project">
            <Plus size={24} color={theme.colors.primary} strokeWidth={2} />
          </HeaderIconButton>
        }
      />

      <AddProjectModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreate={handleCreateProject}
      />

      {isEmpty ? (
        <EmptyStudio onAddPress={openAddModal} />
      ) : (
        <FlatList
          data={projectList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          contentContainerStyle={{
            paddingHorizontal: PAD,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing["5xl"],
          }}
          ListHeaderComponent={
            <View style={{ marginBottom: theme.spacing["4xl"] }}>
              <Text
                style={{
                  fontFamily: fontFamilies.label,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.colors.primary,
                  marginBottom: theme.spacing.md,
                }}
              >
                Collection
              </Text>
              <Text
                style={{
                  fontFamily: fontFamilies.displayItalic,
                  fontSize: 48,
                  lineHeight: 48,
                  color: theme.colors.onSurface,
                }}
              >
                My Projects
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
