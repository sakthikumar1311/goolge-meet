import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Edit3, Users, MoreVertical, Hand } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function MeetingControls({
    isMicOn,
    isCamOn,
    onToggleMic,
    onToggleCam,
    onHangup,
    onShareScreen,
    isSharingScreen,
    onToggleWhiteboard,
    isWhiteboardVisible,
    onShowParticipants,
    participantCount
}) {
    return (
        <View style={styles.container}>
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.button, !isMicOn && styles.buttonOff]}
                    onPress={onToggleMic}
                >
                    {isMicOn ? <Mic color={Colors.white} size={22} /> : <MicOff color={Colors.white} size={22} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, !isCamOn && styles.buttonOff]}
                    onPress={onToggleCam}
                >
                    {isCamOn ? <Video color={Colors.white} size={22} /> : <VideoOff color={Colors.white} size={22} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isSharingScreen && styles.buttonActive]}
                    onPress={onShareScreen}
                >
                    <ScreenShare color={isSharingScreen ? Colors.primary : Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isWhiteboardVisible && styles.buttonActive]}
                    onPress={onToggleWhiteboard}
                >
                    <Edit3 color={isWhiteboardVisible ? Colors.primary : Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={onShowParticipants}
                >
                    <View style={styles.participantBadge}>
                        <Users color={Colors.white} size={22} />
                        {participantCount > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{participantCount}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Hand color={Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <MoreVertical color={Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.hangupButton]}
                    onPress={onHangup}
                >
                    <PhoneOff color={Colors.white} size={22} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.m,
        backgroundColor: Colors.background,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.m,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Platform.OS === 'web' ? Spacing.m : Spacing.xs,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOff: {
        backgroundColor: Colors.error,
    },
    buttonActive: {
        backgroundColor: Colors.white,
    },
    hangupButton: {
        backgroundColor: Colors.error,
        width: 56,
        height: 40,
        borderRadius: 20,
    },
    participantBadge: {
        position: 'relative',
    },
    countBadge: {
        position: 'absolute',
        top: -5,
        right: -8,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    countText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
