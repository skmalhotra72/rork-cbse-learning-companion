import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppState } from '@/contexts/AppStateContext';
import { analyzeTextbookImage } from '@/services/aiService';
import { Subject } from '@/constants/cbse';
import colors from '@/constants/colors';
import { Camera, Upload, X, Sparkles, BookOpen, ArrowRight } from 'lucide-react-native';

export default function StuckScreen() {
  const router = useRouter();
  const { profile, addXP } = useAppState();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<{ explanation: string; relatedConcepts: string[] } | null>(
    null
  );

  if (!profile) {
    return null;
  }

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and photo library access is needed to upload textbook images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri || !selectedSubject || !question.trim()) {
      Alert.alert('Missing Information', 'Please select a subject, upload an image, and describe what you need help with.');
      return;
    }

    setAnalyzing(true);

    try {


      let base64Image = '';
      if (imageUri.startsWith('data:')) {
        base64Image = imageUri;
      } else {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();
        base64Image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const analysis = await analyzeTextbookImage(
        base64Image,
        question,
        selectedSubject,
        profile.class
      );

      setResult(analysis);
      addXP(15);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setQuestion('');
    setResult(null);
    setSelectedSubject(null);
  };

  if (result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.resultIconContainer}>
              <Sparkles color={colors.secondary} size={48} fill={colors.secondary} />
            </View>
            <Text style={styles.title}>{`Here's What I Found`}</Text>
          </View>

          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            </View>
          )}

          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>

          {result.relatedConcepts.length > 0 && (
            <View style={styles.conceptsCard}>
              <Text style={styles.conceptsTitle}>Related Concepts to Review</Text>
              {result.relatedConcepts.map((concept, index) => (
                <View key={index} style={styles.conceptItem}>
                  <View style={styles.conceptBullet} />
                  <Text style={styles.conceptText}>{concept}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Ask Another Question</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/dashboard' as any)}
            >
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
              <ArrowRight color={colors.surface} size={20} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <BookOpen color={colors.primary} size={48} />
          </View>
          <Text style={styles.title}>{`I'm Stuck!`}</Text>
          <Text style={styles.description}>
            Upload a textbook page and I&apos;ll help you understand it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subject</Text>
          <View style={styles.subjectsGrid}>
            {profile.subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectChip,
                  selectedSubject === subject && styles.subjectChipSelected,
                ]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    selectedSubject === subject && styles.subjectChipTextSelected,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you need help with?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="E.g., I don't understand this diagram or How do I solve this problem?"
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Textbook Page</Text>
          
          {!imageUri ? (
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <View style={styles.uploadIconContainer}>
                  <Camera color={colors.primary} size={32} />
                </View>
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={pickImageFromLibrary}>
                <View style={styles.uploadIconContainer}>
                  <Upload color={colors.accent.blue} size={32} />
                </View>
                <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                <X color={colors.surface} size={20} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!selectedSubject || !question.trim() || !imageUri || analyzing) &&
              styles.buttonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!selectedSubject || !question.trim() || !imageUri || analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <>
              <Sparkles color={colors.surface} size={20} />
              <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            </>
          )}
        </TouchableOpacity>

        {analyzing && (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Analyzing your textbook page...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subjectChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  subjectChipTextSelected: {
    color: colors.primary,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  conceptsCard: {
    backgroundColor: colors.accent.blue + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  conceptsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  conceptItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  conceptBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
    marginTop: 6,
  },
  conceptText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
