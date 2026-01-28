import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { MicOff, Maximize2, Monitor, Layout, Window, MoreHorizontal } from 'lucide-react-native';

// Conditional require for native-only libraries
let RTCView;
if (Platform.OS !== 'web') {
    RTCView = require('react-native-webrtc').RTCView;
}

export default function VideoView({ stream, name, isLocal = false, isMuted = false, isActiveSpeaker = false, isSharing = false }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (Platform.OS === 'web' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const renderVideo = () => {
        if (isSharing) {
            return (
                <View style={styles.mockDesktop}>
                    <View style={styles.desktopHeader}>
                        <View style={styles.windowControls}>
                            <View style={[styles.windowDot, { backgroundColor: '#FF5F56' }]} />
                            <View style={[styles.windowDot, { backgroundColor: '#FFBD2E' }]} />
                            <View style={[styles.windowDot, { backgroundColor: '#27C93F' }]} />
                        </View>
                        <Text style={styles.desktopTitle}>Chrome - Google Meet Presentation</Text>
                    </View>
                    <View style={styles.desktopContent}>
                        <Monitor color="rgba(255,255,255,0.2)" size={80} strokeWidth={1} />
                        <Text style={styles.desktopPlaceholderText}>Presenting your screen</Text>
                    </View>
                    <View style={styles.desktopTaskbar}>
                        <Layout color="rgba(255,255,255,0.5)" size={16} />
                        <View style={styles.taskbarDivider} />
                        <View style={styles.taskbarIcon} />
                        <View style={styles.taskbarIcon} />
                        <View style={styles.taskbarIconActive} />
                    </View>
                </View>
            );
        }

        if (!stream) {
            return (
                <View style={styles.placeholder}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
                    </View>
                </View>
            );
        }

        if (Platform.OS === 'web') {
            return (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: (isLocal && !isSharing) ? 'scaleX(-1)' : 'none',
                    }}
                />
            );
        }

        if (RTCView) {
            return (
                <RTCView
                    streamURL={stream.toURL()}
                    style={styles.rtcView}
                    objectFit="cover"
                    mirror={isLocal && !isSharing}
                />
            );
        }

        return null;
    };

    return (
        <View style={[
            styles.container,
            isActiveSpeaker && styles.activeSpeakerContainer,
            isSharing && styles.sharingContainer
        ]}>
            <View style={styles.videoContainer}>
                {renderVideo()}
            </View>

            <View style={styles.badgeContainer}>
                <View style={[styles.infoBadge, isMuted && styles.mutedBadge]}>
                    <Text style={styles.infoText} numberOfLines={1}>
                        {isLocal ? 'You' : name}
                    </Text>
                    {isMuted && <MicOff color={Colors.white} size={12} style={styles.micIcon} />}
                </View>
            </View>

            {isSharing && (
                <View style={styles.sharingOverlay}>
                    <Maximize2 color={Colors.white} size={20} />
                    <Text style={styles.sharingText}>Presentation</Text>
                </View>
            )}

            {isActiveSpeaker && !isSharing && (
                <View style={styles.speakerIndicator}>
                    <View style={styles.wave} />
                    <View style={[styles.wave, styles.wave2]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        margin: Spacing.xs,
        borderWidth: 2,
        borderColor: 'transparent',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    activeSpeakerContainer: {
        borderColor: Colors.primary,
    },
    sharingContainer: {
        borderColor: Colors.success,
    },
    videoContainer: {
        flex: 1,
    },
    rtcView: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#3C4043',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    avatarText: {
        fontSize: 28,
        color: Colors.white,
        fontWeight: 'bold',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: Spacing.s,
        left: Spacing.s,
        right: Spacing.s,
    },
    infoBadge: {
        backgroundColor: 'rgba(32, 33, 36, 0.6)',
        paddingHorizontal: Spacing.s,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: '90%',
    },
    mutedBadge: {
        backgroundColor: 'rgba(234, 67, 53, 0.8)',
    },
    infoText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    micIcon: {
        marginLeft: Spacing.xs,
    },
    sharingOverlay: {
        position: 'absolute',
        top: Spacing.s,
        right: Spacing.s,
        backgroundColor: Colors.success,
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sharingText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    speakerIndicator: {
        position: 'absolute',
        top: Spacing.s,
        left: Spacing.s,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wave: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        opacity: 0.6,
    },
    wave2: {
        width: 20,
        height: 20,
        borderRadius: 10,
        opacity: 0.3,
    },
    mockDesktop: {
        flex: 1,
        backgroundColor: '#1a1a1b',
        padding: Spacing.s,
    },
    desktopHeader: {
        height: 30,
        backgroundColor: '#2d2e30',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.s,
    },
    windowControls: {
        flexDirection: 'row',
        gap: 6,
    },
    windowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    desktopTitle: {
        color: '#9a9b9d',
        fontSize: 10,
        marginLeft: Spacing.m,
    },
    desktopContent: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    desktopPlaceholderText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: Spacing.m,
    },
    desktopTaskbar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.m,
        marginTop: Spacing.s,
    },
    taskbarDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    taskbarIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    taskbarIconActive: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: Colors.googleBlue,
    },
});
