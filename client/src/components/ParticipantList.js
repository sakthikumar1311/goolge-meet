import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Users, X, MoreVertical, Mic, MicOff } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function ParticipantList({ isVisible, onClose, participants }) {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>People ({participants.length})</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color={Colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={participants}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.participantItem}>
                                <View style={[styles.avatar, item.isLocal && { backgroundColor: '#7B1FA2' }]}>
                                    <Text style={styles.avatarText}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                                    </Text>
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.name}>
                                        {item.isLocal ? `${item.name} (You)` : item.name}
                                    </Text>
                                    <Text style={styles.role}>Meeting host</Text>
                                </View>
                                <View style={styles.actions}>
                                    <MoreVertical color={Colors.textSecondary} size={20} />
                                </View>
                            </View>
                        )}
                        contentContainerStyle={styles.list}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { // Changed from modalOverlay
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: { // Changed from modalContent
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        padding: Spacing.l,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    // titleContainer removed
    title: {
        ...Typography.h2,
        marginLeft: Spacing.s,
    },
    list: {
        paddingTop: Spacing.s,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.m,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.m,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '500',
    },
    info: {
        flex: 1,
    },
    name: {
        ...Typography.body,
        fontSize: 16,
        color: Colors.text,
    },
    role: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border + '33',
    },
});
