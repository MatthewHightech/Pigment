import { Dimensions, Text, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProjects } from "../../hooks/ProjectsContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function WorkspaceScreen() {

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
    const [layout, setLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    const layoutRef = useRef({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    const imageSizeRef = useRef({ width: 1, height: 1 });

    const projectIdNum = Number(id);
    const { projects: projectList, isLoading, error } = useProjects();
    const project = projectList.find((p) => p.id === projectIdNum);

    const imageUri = project?.imageUri;
    const isMissingImage = !imageUri || imageUri === "missing";

    useEffect(() => {
      layoutRef.current = layout;
    }, [layout]);
    useEffect(() => {
      imageSizeRef.current = imageSize;
    }, [imageSize]);
    useEffect(() => {
      if (!imageUri || isMissingImage) return;
      Image.getSize(
        imageUri,
        (w, h) => setImageSize({ width: w, height: h }),
        () => setImageSize({ width: 1, height: 1 })
      );
    }, [imageUri, isMissingImage]);

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
    
          <View className="flex-1">
            {isMissingImage ? (
              <View className="flex-1 items-center justify-center bg-zinc-900">
                <Text className="text-zinc-500">Missing image</Text>
              </View>
            ) : (
              <Image
                source={{ uri: imageUri }}
                style={{ width: SCREEN_WIDTH, flex: 1 }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
    );
}