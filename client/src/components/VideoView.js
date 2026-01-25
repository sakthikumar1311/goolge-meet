import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { MicOff, Maximize2 } from 'lucide-react-native';

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
        if (!stream && !isSharing) {
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
});
