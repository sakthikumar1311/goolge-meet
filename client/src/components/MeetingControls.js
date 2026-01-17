import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MoreVertical, ScreenShare, Edit3, Users } from 'lucide-react-native';
import { Colors, Spacing } from '../theme/theme';

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
            <TouchableOpacity
                style={[styles.button, !isMicOn && styles.buttonOff]}
                onPress={onToggleMic}
            >
                {isMicOn ? <Mic color={Colors.white} size={24} /> : <MicOff color={Colors.white} size={24} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, !isCamOn && styles.buttonOff]}
                onPress={onToggleCam}
            >
                {isCamOn ? <Video color={Colors.white} size={24} /> : <VideoOff color={Colors.white} size={24} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, isSharingScreen && styles.buttonActive]}
                onPress={onShareScreen}
            >
                <ScreenShare color={isSharingScreen ? Colors.primary : Colors.white} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, isWhiteboardVisible && styles.buttonActive]}
                onPress={onToggleWhiteboard}
            >
                <Edit3 color={isWhiteboardVisible ? Colors.primary : Colors.white} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={onShowParticipants}
            >
                <Users color={Colors.white} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.hangupButton]}
                onPress={onHangup}
            >
                <PhoneOff color={Colors.white} size={24} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.l,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.s,
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
        height: 60,
        borderRadius: 30,
    },
});
