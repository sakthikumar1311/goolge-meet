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

                <TouchableOpacity style={styles.button}>
                    <Hand color={Colors.white} size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, (isWhiteboardVisible || isSharingScreen) && styles.buttonActive]}
                    onPress={onToggleWhiteboard}
                >
                    <MoreVertical color={(isWhiteboardVisible || isSharingScreen) ? Colors.googleBlue : Colors.white} size={22} />
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
        backgroundColor: 'transparent', // Controls float above the grid in some views, but standard Meet has a dark bar
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.m,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.s,
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#3C4043', // Specific Google Meet button color
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    buttonOff: {
        backgroundColor: Colors.error,
    },
    buttonActive: {
        backgroundColor: Colors.white,
    },
    hangupButton: {
        backgroundColor: Colors.error,
        width: 60,
        height: 40,
        borderRadius: 20,
    },
});
