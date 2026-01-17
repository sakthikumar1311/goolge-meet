import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Spacing } from '../theme/theme';

// Conditional require for native-only libraries
let RTCView;
if (Platform.OS !== 'web') {
    RTCView = require('react-native-webrtc').RTCView;
}

export default function VideoView({ stream, name, isLocal = false, isMuted = false }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (Platform.OS === 'web' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const renderVideo = () => {
        if (!stream) {
            return (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
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
                        transform: isLocal ? 'scaleX(-1)' : 'none',
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
                    mirror={isLocal}
                />
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {renderVideo()}
            <View style={styles.infoBadge}>
                <Text style={styles.infoText}>{isLocal ? 'You' : name}</Text>
            </View>
            {isMuted && (
                <View style={styles.muteBadge}>
                    <Text style={styles.muteText}>Muted</Text>
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
        margin: Spacing.s,
    },
    rtcView: {
        flex: 1,
    },
    webVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: [{ scaleX: -1 }], // For mirroring if needed, usually local only
    },
    placeholder: {
        flex: 1,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 48,
        color: Colors.white,
        fontWeight: 'bold',
    },
    infoBadge: {
        position: 'absolute',
        bottom: Spacing.s,
        left: Spacing.s,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: 4,
    },
    infoText: {
        color: Colors.white,
        fontSize: 12,
    },
    muteBadge: {
        position: 'absolute',
        top: Spacing.s,
        right: Spacing.s,
        backgroundColor: Colors.error,
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: 4,
    },
    muteText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
