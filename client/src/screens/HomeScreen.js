import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Share, SafeAreaView, Platform } from 'react-native';
import { Video, Plus, Keyboard, Copy, Share2, X, Info } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function HomeScreen({ navigation }) {
    const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

    const handleCreateMeeting = () => {
        const newId = Math.random().toString(36).substring(2, 5) + '-' +
            Math.random().toString(36).substring(2, 6) + '-' +
            Math.random().toString(36).substring(2, 5);
        setGeneratedId(newId);
        setShowNewMeetingModal(true);
    };

    const handleStartNow = () => {
        setShowNewMeetingModal(false);
        navigation.navigate('Meeting', { roomID: generatedId });
    };

    const handleCopyLink = async () => {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
            try {
                await navigator.clipboard.writeText(generatedId);
                alert('Meeting link copied!');
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        } else {
            console.log('Copy (Native Simulation):', generatedId);
        }
    };

    const handleShareLink = async () => {
        try {
            await Share.share({
                message: `Join my Google Meet: ${generatedId}`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Video color={Colors.primary} size={64} />
                    <Text style={styles.title}>Google Meet</Text>
                    <Text style={styles.subtitle}>Premium video meetings. Now free for everyone.</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleCreateMeeting}
                    >
                        <Plus color={Colors.white} size={24} />
                        <Text style={styles.buttonText}>New meeting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Join')}
                    >
                        <Keyboard color={Colors.primary} size={24} />
                        <Text style={styles.secondaryButtonText}>Join with a code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Info color={Colors.primary} size={24} />
                        <Text style={styles.infoText}>Learn more about Google Meet</Text>
                    </View>
                </View>
            </View>

            {/* New Meeting Modal */}
            <Modal
                visible={showNewMeetingModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowNewMeetingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Here's the link to your meeting</Text>
                            <TouchableOpacity onPress={() => setShowNewMeetingModal(false)}>
                                <X color={Colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
                        </Text>

                        <View style={styles.linkContainer}>
                            <Text style={styles.linkText}>{generatedId}</Text>
                            <TouchableOpacity onPress={handleCopyLink}>
                                <Copy color={Colors.primary} size={20} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.shareOption} onPress={handleShareLink}>
                            <Share2 color={Colors.text} size={20} />
                            <Text style={styles.shareText}>Share invitation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.startNowButton} onPress={handleStartNow}>
                            <Video color={Colors.white} size={20} />
                            <Text style={styles.startNowText}>Start meeting now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.l,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
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
        paddingHorizontal: Spacing.l,
    },
    actionContainer: {
        width: '100%',
        gap: Spacing.m,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.m,
        borderRadius: 25,
    },
    buttonText: {
        ...Typography.button,
        marginLeft: Spacing.s,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.m,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    secondaryButtonText: {
        ...Typography.button,
        color: Colors.primary,
        marginLeft: Spacing.s,
    },
    infoSection: {
        marginTop: Spacing.xxl,
        width: '100%',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 12,
    },
    infoText: {
        ...Typography.bodySmall,
        color: Colors.accent,
        marginLeft: Spacing.m,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.l,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.l,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    modalTitle: {
        ...Typography.h2,
        flex: 1,
    },
    modalSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.l,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 8,
        marginBottom: Spacing.m,
    },
    linkText: {
        ...Typography.body,
        color: Colors.text,
    },
    shareOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.m,
        marginBottom: Spacing.m,
    },
    shareText: {
        ...Typography.body,
        marginLeft: Spacing.m,
    },
    startNowButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.m,
        borderRadius: 25,
    },
    startNowText: {
        ...Typography.button,
        marginLeft: Spacing.s,
    },
});
