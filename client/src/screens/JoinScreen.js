import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Video, VideoOff, Mic, MicOff, ArrowLeft, Keyboard, Info, MoreVertical } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import VideoView from '../components/VideoView';

// Conditional require for native-only libraries
let mediaDevices;
if (Platform.OS !== 'web') {
    mediaDevices = require('react-native-webrtc').mediaDevices;
} else {
    mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : null;
}

export default function JoinScreen({ navigation }) {
    const [roomID, setRoomID] = useState('');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const streamRef = useRef(null);

    useEffect(() => {
        if (isCamOn) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isCamOn]);

    const startCamera = async () => {
        try {
            if (streamRef.current) stopCamera();

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: 'user' }
            });

            setLocalStream(stream);
            streamRef.current = stream;
        } catch (error) {
            console.error('Error starting camera:', error);
            setIsCamOn(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setLocalStream(null);
        }
    };

    const handleJoin = () => {
        if (roomID.trim()) {
            // Stop camera before navigating to avoid conflicts
            stopCamera();
            navigation.navigate('Meeting', {
                roomID: roomID.trim().toLowerCase(),
                initialMic: isMicOn,
                initialCam: isCamOn
            });
        }
    };

    const toggleCam = () => {
        setIsCamOn(!isCamOn);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Info color={Colors.text} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <MoreVertical color={Colors.text} size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardContent}
                >
                    <View style={styles.previewContainer}>
                        <View style={styles.videoPreview}>
                            {isCamOn && localStream ? (
                                <View style={StyleSheet.absoluteFill}>
                                    <VideoView
                                        stream={localStream}
                                        name="You"
                                        isLocal={true}
                                        isMuted={!isMicOn}
                                    />
                                </View>
                            ) : (
                                <View style={styles.cameraOffOverlay}>
                                    <View style={styles.avatarLarge}>
                                        <Text style={styles.avatarTextLarge}>Y</Text>
                                    </View>
                                </View>
                            )}

                            {/* Overlay Controls */}
                            <View style={styles.previewControls}>
                                <TouchableOpacity
                                    style={[styles.previewButton, !isMicOn && styles.buttonOff]}
                                    onPress={() => setIsMicOn(!isMicOn)}
                                >
                                    {isMicOn ? <Mic color={Colors.white} size={22} /> : <MicOff color={Colors.white} size={22} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.previewButton, !isCamOn && styles.buttonOff]}
                                    onPress={toggleCam}
                                >
                                    {isCamOn ? <Video color={Colors.white} size={22} /> : <VideoOff color={Colors.white} size={22} />}
                                </TouchableOpacity>
                            </View>

                            {/* Camera Status Text */}
                            {!isCamOn && (
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusBadgeText}>Camera is off</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Joining as</Text>
                        <View style={styles.userSection}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.userAvatarText}>Y</Text>
                            </View>
                            <View>
                                <Text style={styles.userName}>You</Text>
                                <Text style={styles.userEmail}>user@example.com</Text>
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter a meeting code"
                                placeholderTextColor={Colors.textSecondary}
                                value={roomID}
                                onChangeText={setRoomID}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.joinButton, !roomID.trim() && styles.joinButtonDisabled]}
                            onPress={handleJoin}
                            disabled={!roomID.trim()}
                        >
                            <Text style={[styles.joinButtonText, !roomID.trim() && styles.joinButtonTextDisabled]}>Join</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.s,
        height: 56,
    },
    backButton: {
        padding: Spacing.s,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerIcon: {
        padding: Spacing.s,
        marginLeft: Spacing.s,
    },
    scrollContent: {
        flexGrow: 1,
    },
    keyboardContent: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    previewContainer: {
        alignItems: 'center',
        marginTop: Spacing.m,
        marginBottom: Spacing.xl,
    },
    videoPreview: {
        width: '100%',
        aspectRatio: 1, // Square preview like mobile app
        backgroundColor: '#3C4043',
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    cameraOffOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#202124',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#7B1FA2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTextLarge: {
        color: Colors.white,
        fontSize: 40,
        fontWeight: '400',
    },
    previewControls: {
        position: 'absolute',
        bottom: 24,
        flexDirection: 'row',
        zIndex: 10,
    },
    previewButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(32, 33, 36, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonOff: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    statusBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(234, 67, 53, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusBadgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    inputSection: {
        marginTop: Spacing.m,
    },
    inputLabel: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginBottom: Spacing.m,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7B1FA2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.m,
    },
    userAvatarText: {
        color: Colors.white,
        fontSize: 18,
    },
    userName: {
        ...Typography.h3,
        color: Colors.text,
    },
    userEmail: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
    },
    inputWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: Spacing.xxl,
    },
    input: {
        height: 56,
        color: Colors.text,
        fontSize: 16,
        letterSpacing: 0.5,
    },
    joinButton: {
        backgroundColor: Colors.googleBlue,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    joinButtonDisabled: {
        backgroundColor: Colors.surface,
        elevation: 0,
    },
    joinButtonText: {
        ...Typography.button,
        color: Colors.white,
    },
    joinButtonTextDisabled: {
        color: Colors.textSecondary,
    },
});
