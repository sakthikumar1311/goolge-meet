import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Video, VideoOff, Mic, MicOff, ArrowLeft, Keyboard } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function JoinScreen({ navigation }) {
    const [roomID, setRoomID] = useState('');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    const handleJoin = () => {
        if (roomID.trim()) {
            navigation.navigate('Meeting', {
                roomID: roomID.trim().toLowerCase(),
                initialMic: isMicOn,
                initialCam: isCamOn
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Join with a code</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.previewContainer}>
                    <View style={styles.videoPreview}>
                        {!isCamOn && (
                            <View style={styles.cameraOffOverlay}>
                                <VideoOff color={Colors.white} size={48} />
                                <Text style={styles.cameraOffText}>Camera is off</Text>
                            </View>
                        )}
                        <View style={styles.previewControls}>
                            <TouchableOpacity
                                style={[styles.previewButton, !isMicOn && styles.buttonOff]}
                                onPress={() => setIsMicOn(!isMicOn)}
                            >
                                {isMicOn ? <Mic color={Colors.white} size={20} /> : <MicOff color={Colors.white} size={20} />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.previewButton, !isCamOn && styles.buttonOff]}
                                onPress={() => setIsCamOn(!isCamOn)}
                            >
                                {isCamOn ? <Video color={Colors.white} size={20} /> : <VideoOff color={Colors.white} size={20} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter meeting code"
                        placeholderTextColor={Colors.textSecondary}
                        value={roomID}
                        onChangeText={setRoomID}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Text style={styles.hintText}>Example: abc-defg-hij</Text>

                    <TouchableOpacity
                        style={[styles.joinButton, !roomID.trim() && styles.joinButtonDisabled]}
                        onPress={handleJoin}
                        disabled={!roomID.trim()}
                    >
                        <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
    },
    backButton: {
        padding: Spacing.s,
    },
    headerTitle: {
        ...Typography.h2,
        marginLeft: Spacing.m,
    },
    content: {
        flex: 1,
        padding: Spacing.l,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    videoPreview: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cameraOffOverlay: {
        alignItems: 'center',
    },
    cameraOffText: {
        ...Typography.caption,
        color: Colors.white,
        marginTop: Spacing.s,
    },
    previewControls: {
        position: 'absolute',
        bottom: Spacing.m,
        flexDirection: 'row',
    },
    previewButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(60, 64, 67, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.s,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    buttonOff: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    inputSection: {
        marginTop: Spacing.m,
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: Spacing.m,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    hintText: {
        ...Typography.caption,
        marginTop: Spacing.s,
        color: Colors.textSecondary,
    },
    joinButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.m,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    joinButtonDisabled: {
        backgroundColor: Colors.surface,
        opacity: 0.5,
    },
    joinButtonText: {
        ...Typography.button,
    },
});
