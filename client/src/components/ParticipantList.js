import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Users, X } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

export default function ParticipantList({ isVisible, onClose, participants }) {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Users color={Colors.text} size={20} />
                            <Text style={styles.title}>People ({participants.length})</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X color={Colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={participants}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.participantItem}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text style={styles.participantName}>{item.name} {item.isLocal ? '(You)' : ''}</Text>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        ...Typography.h2,
        marginLeft: Spacing.s,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.m,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.m,
    },
    avatarText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    participantName: {
        ...Typography.body,
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.surface,
    },
});
