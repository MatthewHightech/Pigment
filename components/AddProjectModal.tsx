import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { ImageOff } from "lucide-react-native";

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
      <Pressable style={styles.modalBackdrop} onPress={dismissKeyboard}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New project</Text>

            <TouchableOpacity
              onPress={selectImage}
              style={styles.selectImageButton}
              activeOpacity={0.8}
            >
              {selectedUri ? (
                <Image
                  source={{ uri: selectedUri }}
                  style={styles.selectedImagePreview}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.selectImagePlaceholder}>
                  <ImageOff size={40} color="#71717a" />
                  <Text style={styles.selectImageText}>Select image</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.nameInput}
              placeholder="Project name"
              placeholderTextColor="#a1a1aa"
              value={projectName}
              onChangeText={setProjectName}
              maxLength={50}
              autoCapitalize="words"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.modalButton, styles.modalButtonCancel]}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createProject}
                disabled={!selectedUri}
                style={[
                  styles.modalButton,
                  styles.modalButtonCreate,
                  !selectedUri && styles.modalButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181b",
    marginBottom: 16,
  },
  selectImageButton: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e4e4e7",
    marginBottom: 16,
  },
  selectImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectImageText: {
    fontSize: 15,
    color: "#71717a",
  },
  selectedImagePreview: {
    width: "100%",
    height: "100%",
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#18181b",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#e4e4e7",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3f3f46",
  },
  modalButtonCreate: {
    backgroundColor: "#3b82f6",
  },
  modalButtonDisabled: {
    backgroundColor: "#a1a1aa",
    opacity: 0.8,
  },
  modalButtonCreateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
