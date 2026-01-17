import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Video, Keyboard, Plus, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function HomeScreen({ navigation }) {
    const [roomID, setRoomID] = useState('');

    const handleNewMeeting = () => {
        // Generate a random ID for demonstration
        const newId = Math.random().toString(36).substring(2, 7);
        navigation.navigate('Meeting', { roomID: newId });
    };

    const handleJoinMeeting = () => {
        if (roomID.trim()) {
            navigation.navigate('Meeting', { roomID: roomID.trim() });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Video color={Colors.primary} size={48} />
                    <Text style={styles.title}>Google Meet</Text>
                    <Text style={styles.subtitle}>Premium video meetings. Now free for everyone.</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.newMeetingButton}
                        onPress={handleNewMeeting}
                    >
                        <Plus color={Colors.white} size={24} />
                        <Text style={styles.newMeetingText}>New meeting</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.joinContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter a code or link"
                            placeholderTextColor={Colors.textSecondary}
                            value={roomID}
                            onChangeText={setRoomID}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            style={[styles.joinButton, !roomID.trim() && styles.joinButtonDisabled]}
                            onPress={handleJoinMeeting}
                            disabled={!roomID.trim()}
                        >
                            <Text style={[styles.joinButtonText, !roomID.trim() && styles.joinButtonTextDisabled]}>Join</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Learn more about Google Meet</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.l,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        ...Typography.h1,
        marginTop: Spacing.m,
    },
    subtitle: {
        ...Typography.body,
        textAlign: 'center',
        color: Colors.textSecondary,
        marginTop: Spacing.s,
        paddingHorizontal: Spacing.m,
    },
    actionContainer: {
        width: '100%',
    },
    newMeetingButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.m,
        borderRadius: 8,
        marginBottom: Spacing.xl,
    },
    newMeetingText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
        marginLeft: Spacing.s,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.surface,
    },
    dividerText: {
        color: Colors.textSecondary,
        marginHorizontal: Spacing.m,
    },
    joinContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: Spacing.m,
        borderRadius: 8,
        marginRight: Spacing.s,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    joinButton: {
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
    },
    joinButtonDisabled: {
        opacity: 0.5,
    },
    joinButtonText: {
        color: Colors.accent,
        fontSize: 16,
        fontWeight: 'bold',
    },
    joinButtonTextDisabled: {
        color: Colors.textSecondary,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingTop: Spacing.xxl,
    },
    footerText: {
        color: Colors.accent,
        fontSize: 14,
    },
});
