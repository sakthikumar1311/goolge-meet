import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Spacing } from '../theme/theme';

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
        <View style={[styles.container, isActiveSpeaker && styles.activeSpeakerContainer]}>
            <View style={styles.videoContainer}>
                {renderVideo()}
            </View>

            <View style={styles.badgeContainer}>
                <View style={styles.infoBadge}>
                    {isMuted && <View style={styles.micOffIcon}><Text style={styles.micOffText}>Muted</Text></View>}
                    <Text style={styles.infoText}>{isLocal ? 'You' : name}</Text>
                </View>
            </View>

            {isSharing && (
                <View style={styles.sharingBadge}>
                    <Text style={styles.sharingText}>Screen sharing</Text>
                </View>
            )}

            {isActiveSpeaker && (
                <View style={styles.speakerBadge}>
                    <View style={styles.speakerDot} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        margin: Spacing.xs,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeSpeakerContainer: {
        borderColor: Colors.primary,
    },
    videoContainer: {
        flex: 1,
    },
    rtcView: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        color: Colors.white,
        fontWeight: 'bold',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: Spacing.s,
        left: Spacing.s,
        right: Spacing.s,
        flexDirection: 'row',
    },
    infoBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    micOffIcon: {
        marginRight: Spacing.xs,
        backgroundColor: Colors.error,
        paddingHorizontal: 4,
        borderRadius: 2,
    },
    micOffText: {
        color: Colors.white,
        fontSize: 8,
        fontWeight: 'bold',
    },
    sharingBadge: {
        position: 'absolute',
        top: Spacing.s,
        left: Spacing.s,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sharingText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    speakerBadge: {
        position: 'absolute',
        top: Spacing.s,
        right: Spacing.s,
    },
    speakerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
});
