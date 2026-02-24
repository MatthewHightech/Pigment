import { View, Text, TouchableOpacity, FlatList, Alert, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Plus, ImageOff } from "lucide-react-native";
import { useLiveQuery } from "drizzle-orm/expo-sqlite/query";
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
  const { data: projectList = [] } = useLiveQuery(db.select().from(projects));

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
    const name = uri.split("/").pop() || "Project";
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const createdAt = new Date();
    await db.insert(projects).values({
      name: name.slice(0, 50),
      imageUri: uri,
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

  const renderItem = useCallback(
    ({ item }: { item: (typeof projectList)[number] }) => {
      const isMissing = item.imageUri === PLACEHOLDER_URI || !item.imageUri;
      return (
        <TouchableOpacity
          onPress={() => openProject(item.id)}
          activeOpacity={0.8}
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
        </TouchableOpacity>
      );
    },
    [openProject]
  );

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
      <Text className="text-zinc-900 font-semibold text-base mb-2">Project List {projectList.length}</Text>
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
