import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Edit3, Users, MoreVertical, Hand, MessageSquare } from 'lucide-react-native';
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
                    <ScreenShare color={isSharingScreen ? Colors.googleBlue : Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isWhiteboardVisible && styles.buttonActive]}
                    onPress={onToggleWhiteboard}
                >
                    <Edit3 color={isWhiteboardVisible ? Colors.googleBlue : Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={onShowParticipants}>
                    <Users color={Colors.white} size={22} />
                    {participantCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{participantCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.hangupButton]}
                    onPress={onHangup}
                >
                    <PhoneOff color={Colors.white} size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.m,
        backgroundColor: 'rgba(32, 33, 36, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.m,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: Spacing.s,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3C4043',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOff: {
        backgroundColor: '#EA4335',
    },
    buttonActive: {
        backgroundColor: '#E8F0FE',
    },
    hangupButton: {
        backgroundColor: '#EA4335',
        width: 64,
        height: 40,
        borderRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: Colors.googleBlue,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#202124',
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
