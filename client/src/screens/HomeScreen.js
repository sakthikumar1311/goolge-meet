import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Share, SafeAreaView, Platform, Dimensions, ScrollView } from 'react-native';
import { Video, Plus, Keyboard, Copy, Share2, X, Info, Menu, User, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CAROUSEL_ITEMS = [
    {
        id: '1',
        title: 'Get a link you can share',
        subtitle: 'Tap New meeting to get a link you can send to people you want to meet with',
        icon: <Share2 color={Colors.primary} size={48} />,
    },
    {
        id: '2',
        title: 'Your meeting is safe',
        subtitle: 'No one can join a meeting unless invited or admitted by the host',
        icon: <Video color={Colors.primary} size={48} />,
    },
    {
        id: '3',
        title: 'See everyone together',
        subtitle: 'To see more people at once, go to Change layout in the More options menu',
        icon: <Plus color={Colors.primary} size={48} />,
    }
];

export default function HomeScreen({ navigation }) {
    const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
    const [generatedId, setGeneratedId] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

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

    const onScroll = (event) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeIndex) {
            setActiveIndex(slide);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconButton}>
                    <Menu color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Meet</Text>
                <TouchableOpacity style={styles.profileButton}>
                    <View style={styles.profileAvatar}>
                        <User color={Colors.white} size={20} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Carousel Section */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {CAROUSEL_ITEMS.map((item) => (
                            <View key={item.id} style={styles.carouselItem}>
                                <View style={styles.iconCircle}>
                                    {item.icon}
                                </View>
                                <Text style={styles.carouselTitle}>{item.title}</Text>
                                <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {CAROUSEL_ITEMS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeIndex === index && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleCreateMeeting}
                    >
                        <Text style={styles.buttonText}>New meeting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Join')}
                    >
                        <Text style={styles.secondaryButtonText}>Join with a code</Text>
                    </TouchableOpacity>
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
                            <Text style={styles.linkText}>{`meet.google.com/${generatedId}`}</Text>
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
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        height: 56,
    },
    topBarTitle: {
        ...Typography.h1,
        fontSize: 20,
    },
    iconButton: {
        padding: Spacing.s,
    },
    profileButton: {
        padding: Spacing.s,
    },
    profileAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7B1FA2', // Purple avatar like Google defaults
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: Spacing.xxl,
    },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselItem: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    carouselTitle: {
        ...Typography.h2,
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    carouselSubtitle: {
        ...Typography.body,
        textAlign: 'center',
        color: Colors.textSecondary,
        paddingHorizontal: Spacing.m,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.secondary,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.primary,
        width: 18, // Stretched active dot
    },
    actionContainer: {
        paddingHorizontal: Spacing.l,
        gap: Spacing.m,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: Colors.googleBlue,
        width: '100%',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    buttonText: {
        ...Typography.button,
        color: Colors.white,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        width: '100%',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    secondaryButtonText: {
        ...Typography.button,
        color: Colors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
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
        fontSize: 20,
    },
    modalSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.l,
        lineHeight: 18,
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
        letterSpacing: 0.5,
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
        backgroundColor: Colors.googleBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 24,
    },
    startNowText: {
        ...Typography.button,
        marginLeft: Spacing.s,
    },
});
