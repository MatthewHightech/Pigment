import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { ImageOff } from "lucide-react-native";
import { theme } from "../theme";

export interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, imageUri: string) => Promise<void>;
}

export function AddProjectModal({
  visible,
  onClose,
  onCreate,
}: AddProjectModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (visible) {
      setSelectedUri(null);
      setProjectName("");
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
    if (!selectedUri) return;
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
  }, [selectedUri, projectName, onCreate, onClose]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={dismissKeyboard}
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingTop: windowHeight * 0.18,
          backgroundColor: theme.colors.backdrop,
        }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View
            className="rounded-xl p-5 w-full max-w-[340px]"
            style={{ backgroundColor: theme.colors.surfaceElevated }}
          >
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.text }}
            >
              New project
            </Text>

            <TouchableOpacity
              onPress={selectImage}
              className="w-full rounded-lg overflow-hidden mb-4 active:opacity-90"
              style={{
                height: 160,
                backgroundColor: theme.colors.muted,
              }}
              activeOpacity={0.8}
            >
              {selectedUri ? (
                <Image
                  key={selectedUri}
                  source={{ uri: selectedUri }}
                  style={{ width: "100%", height: 160 }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <ImageOff size={40} color={theme.colors.textTertiary} />
                  <Text
                    className="mt-2 text-base"
                    style={{ color: theme.colors.textTertiary }}
                  >
                    Select image
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              className="rounded-lg px-3.5 py-3 text-base border mb-5"
              style={{
                ...theme.typography.body,
                lineHeight: 22,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceElevated,
              }}
              placeholder="Project name"
              placeholderTextColor={theme.colors.textTertiary}
              value={projectName}
              onChangeText={setProjectName}
              maxLength={50}
              autoCapitalize="words"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-lg items-center active:opacity-90"
                style={{ backgroundColor: theme.colors.muted }}
                activeOpacity={0.8}
              >
                <Text
                  className="text-base font-medium"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createProject}
                disabled={!selectedUri}
                className="flex-1 py-3 rounded-lg items-center active:opacity-90"
                style={{
                  backgroundColor: !selectedUri ? theme.colors.border : theme.colors.primary,
                  opacity: !selectedUri ? 0.8 : 1,
                }}
                activeOpacity={0.8}
              >
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: !selectedUri ? theme.colors.textTertiary : theme.colors.primaryForeground,
                  }}
                >
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
}
