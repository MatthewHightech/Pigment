import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Pressable,
  Alert,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { ImageOff, X } from "lucide-react-native";
import { useTheme } from "../hooks/ThemeContext";
import { fontFamilies } from "../theme";

export interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, imageUri: string) => Promise<void>;
}

export function AddProjectModal({ visible, onClose, onCreate }: AddProjectModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const { theme } = useTheme();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedUri(null);
      setProjectName("");
      setIsCreating(false);
    }
  }, [visible]);

  const selectImage = useCallback(async () => {
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
    setSelectedUri(result.assets[0].uri);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const createProject = useCallback(async () => {
    if (!selectedUri || isCreating) {
      if (!selectedUri) {
        Alert.alert("Image required", "Select a reference image before creating your project.");
      }
      return;
    }
    setIsCreating(true);
    try {
      let imageUri = selectedUri;
      try {
        const context = ImageManipulator.manipulate(selectedUri);
        const imageRef = await context.renderAsync();
        const saveResult = await imageRef.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.9,
        });
        imageUri = saveResult.uri;
      } catch {
        // Keep original URI if conversion fails
      }
      const name = (projectName.trim() || "Untitled").slice(0, 50);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onCreate(name, imageUri);
      onClose();
    } catch (e) {
      Alert.alert(
        "Couldn't create project",
        e instanceof Error ? e.message : "Something went wrong. Try again."
      );
    } finally {
      setIsCreating(false);
    }
  }, [selectedUri, projectName, onCreate, onClose, isCreating]);

  if (!visible) return null;

  const canCreate = Boolean(selectedUri) && !isCreating;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.backdrop }]}
          onPress={onClose}
          accessibilityLabel="Dismiss"
        />

        <View
          style={[
            styles.card,
            {
              maxWidth: 360,
              marginTop: windowHeight * 0.14,
              marginHorizontal: theme.spacing["2xl"],
              backgroundColor: theme.colors.surfaceContainerLowest,
              borderRadius: theme.radius["2xl"],
              padding: theme.spacing["2xl"],
              shadowColor: theme.colors.onSurface,
              shadowOffset: { width: 0, height: 40 },
              shadowOpacity: 0.08,
              shadowRadius: 60,
              elevation: 8,
            },
          ]}
        >
          <View className="flex-row items-center justify-between" style={{ marginBottom: theme.spacing.lg }}>
            <Text
              style={{
                fontFamily: fontFamilies.displayItalic,
                fontSize: 28,
                color: theme.colors.onSurface,
              }}
            >
              New project
            </Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: theme.colors.onSurfaceVariant,
              marginBottom: theme.spacing.sm,
            }}
          >
            Reference image
          </Text>
          <TouchableOpacity
            onPress={selectImage}
            activeOpacity={0.85}
            style={{
              width: "100%",
              height: 180,
              borderRadius: theme.radius.lg,
              overflow: "hidden",
              backgroundColor: theme.colors.surfaceContainerLow,
              marginBottom: theme.spacing.lg,
            }}
          >
            {selectedUri ? (
              <Image
                key={selectedUri}
                source={{ uri: selectedUri }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <ImageOff size={40} color={theme.colors.onSurfaceVariant} />
                <Text
                  style={{
                    fontFamily: fontFamilies.body,
                    fontSize: 14,
                    color: theme.colors.onSurfaceVariant,
                    marginTop: theme.spacing.sm,
                  }}
                >
                  Select image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: theme.colors.onSurfaceVariant,
              marginBottom: theme.spacing.sm,
            }}
          >
            Project name
          </Text>
          <TextInput
            style={{
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              fontFamily: fontFamilies.body,
              fontSize: 16,
              color: theme.colors.onSurface,
              backgroundColor: theme.colors.surfaceContainerLow,
              marginBottom: theme.spacing["2xl"],
            }}
            placeholder="Untitled"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={projectName}
            onChangeText={setProjectName}
            maxLength={50}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          <TouchableOpacity
            onPress={createProject}
            disabled={!canCreate}
            activeOpacity={0.85}
            accessibilityLabel="Create project"
            accessibilityRole="button"
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: theme.spacing.lg,
              borderRadius: theme.radius.full,
              backgroundColor: canCreate
                ? theme.colors.primary
                : theme.colors.surfaceContainerHighest,
              marginBottom: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.label,
                fontSize: 12,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                fontWeight: "700",
                color: canCreate ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              }}
            >
              {isCreating ? "Creating…" : "Create Project"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    width: "100%",
    zIndex: 2,
  },
});
