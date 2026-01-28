import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, FlatList, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import VideoView from '../components/VideoView';
import MeetingControls from '../components/MeetingControls';
import Whiteboard from '../components/Whiteboard';
import ParticipantList from '../components/ParticipantList';
import { Users, Camera, Volume2, Info, ChevronLeft, ShieldCheck, MoreVertical } from 'lucide-react-native';
import SyncService from '../services/SyncService';

// Conditional require for native-only libraries
let mediaDevices;
if (Platform.OS !== 'web') {
    mediaDevices = require('react-native-webrtc').mediaDevices;
} else {
    mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// Single user experience - no mock participants

export default function MeetingScreen({ route, navigation }) {
    const { roomID, initialMic = true, initialCam = true } = route.params;
    const [localStream, setLocalStream] = useState(null);
    const [isMicOn, setIsMicOn] = useState(initialMic);
    const [isCamOn, setIsCamOn] = useState(initialCam);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
    const [isParticipantListVisible, setIsParticipantListVisible] = useState(false);

    // Single user state + Remote peers
    const [participants, setParticipants] = useState([
        { id: 'local', name: 'You', isLocal: true, stream: null, isMuted: !initialMic, isSharing: false }
    ]);
    const [remotePeers, setRemotePeers] = useState({});
    const peerID = useRef(Math.random().toString(36).substring(7)).current;
    const syncService = useRef(null);

    const streamRef = useRef(null);

    useEffect(() => {
        if (isCamOn) {
            startLocalStream();
        } else {
            stopLocalStream();
        }
        return () => stopLocalStream();
    }, [isCamOn]);

    useEffect(() => {
        if (Platform.OS === 'web') {
            syncService.current = new SyncService(roomID);

            const unsubscribe = syncService.current.subscribe((type, payload, senderID) => {
                if (senderID === peerID) return;

                switch (type) {
                    case 'JOIN':
                        // Respond with our state
                        syncService.current.broadcast('PRESENCE', {
                            isSharing: isSharingScreen,
                            isMicOn: isMicOn,
                            name: 'Peer ' + peerID.substring(0, 4)
                        }, peerID);

                        setRemotePeers(prev => ({
                            ...prev,
                            [senderID]: {
                                id: senderID,
                                name: payload.name || 'Remote User',
                                isLocal: false,
                                isSharing: payload.isSharing,
                                isMuted: !payload.isMicOn
                            }
                        }));
                        break;

                    case 'PRESENCE':
                        setRemotePeers(prev => ({
                            ...prev,
                            [senderID]: {
                                id: senderID,
                                name: payload.name || 'Remote User',
                                isLocal: false,
                                isSharing: payload.isSharing,
                                isMuted: !payload.isMicOn
                            }
                        }));
                        break;

                    case 'STATE_UPDATE':
                        setRemotePeers(prev => ({
                            ...prev,
                            [senderID]: {
                                ...prev[senderID],
                                isSharing: payload.isSharing,
                                isMuted: !payload.isMicOn
                            }
                        }));
                        break;

                    case 'LEAVE':
                        setRemotePeers(prev => {
                            const next = { ...prev };
                            delete next[senderID];
                            return next;
                        });
                        break;
                }
            });

            // Announce presence
            syncService.current.broadcast('JOIN', {
                isSharing: isSharingScreen,
                isMicOn: isMicOn,
                name: 'Peer ' + peerID.substring(0, 4)
            }, peerID);

            return () => {
                syncService.current.broadcast('LEAVE', {}, peerID);
                unsubscribe();
                syncService.current.cleanup();
            };
        }
    }, [roomID]);

    useEffect(() => {
        if (syncService.current) {
            syncService.current.broadcast('STATE_UPDATE', {
                isSharing: isSharingScreen,
                isMicOn: isMicOn
            }, peerID);
        }
    }, [isSharingScreen, isMicOn]);

    const allParticipants = [
        ...participants,
        ...Object.values(remotePeers)
    ];

    const startLocalStream = async () => {
        try {
            if (streamRef.current) stopLocalStream();

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: 'user' }
            });

            setLocalStream(stream);
            streamRef.current = stream;
        } catch (error) {
            console.error('Error starting local stream:', error);
            setIsCamOn(false);
        }
    };

    const stopLocalStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setLocalStream(null);
        }
    };

    const toggleMic = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isMicOn;
            }
        }
        setIsMicOn(!isMicOn);
    };

    const toggleCam = () => setIsCamOn(!isCamOn);

    const handleHangup = () => {
        stopLocalStream();
        navigation.navigate('Home');
    };

    const handleShareScreen = () => setIsSharingScreen(!isSharingScreen);

    const renderParticipant = ({ item }) => {
        const count = allParticipants.length;
        let itemStyle = styles.videoWrapper;

        if (count === 1) itemStyle = styles.singleVideo;
        else if (count === 2) itemStyle = styles.doubleVideo;
        else if (count <= 4) itemStyle = styles.quadVideo;
        else itemStyle = styles.sixVideo;

        return (
            <View style={itemStyle}>
                <VideoView
                    stream={item.isLocal ? localStream : null}
                    name={item.name}
                    isLocal={item.isLocal}
                    isMuted={item.isLocal ? !isMicOn : item.isMuted}
                    isActiveSpeaker={false} // Simple placeholder for now
                    isSharing={item.id === 'local' ? isSharingScreen : item.isSharing}
                />
            </View>
        );
    };

    const getColumns = () => {
        const count = participants.length;
        if (count <= 2) return 1;
        return 2;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <Text style={styles.roomIDText}>{roomID}</Text>
                    <ChevronLeft color={Colors.text} size={20} style={{ marginLeft: -4 }} />
                </View>
                <View style={styles.topBarRight}>
                    <TouchableOpacity style={styles.topIcon}>
                        <Camera color={Colors.text} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topIcon}>
                        <Volume2 color={Colors.text} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topIcon}>
                        <ShieldCheck color={Colors.text} size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Video Grid */}
            <View style={styles.gridContainer}>
                <FlatList
                    data={allParticipants}
                    renderItem={renderParticipant}
                    keyExtractor={item => item.id}
                    numColumns={allParticipants.length > 2 ? 2 : 1}
                    key={allParticipants.length > 2 ? '2' : '1'}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            <View style={{ height: 100 }} />

            {/* Bottom Controls */}
            <MeetingControls
                isMicOn={isMicOn}
                isCamOn={isCamOn}
                onToggleMic={toggleMic}
                onToggleCam={toggleCam}
                onHangup={handleHangup}
                onShareScreen={handleShareScreen}
                isSharingScreen={isSharingScreen}
                onToggleWhiteboard={() => setIsWhiteboardVisible(!isWhiteboardVisible)}
                isWhiteboardVisible={isWhiteboardVisible}
                onShowParticipants={() => setIsParticipantListVisible(!isParticipantListVisible)}
                participantCount={participants.length}
            />

            <Whiteboard
                isVisible={isWhiteboardVisible}
                roomID={roomID}
                onClose={() => setIsWhiteboardVisible(false)}
                syncService={syncService.current}
            />

            <ParticipantList
                isVisible={isParticipantListVisible}
                onClose={() => setIsParticipantListVisible(false)}
                participants={participants}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roomIDText: {
        ...Typography.h3,
        color: Colors.text,
        marginRight: Spacing.xs,
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topIcon: {
        padding: Spacing.s,
        marginLeft: Spacing.s,
    },
    gridContainer: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        padding: Spacing.xs,
    },
    videoWrapper: {
        flex: 1,
        aspectRatio: 1,
    },
    singleVideo: {
        width: '100%',
        aspectRatio: 0.7,
        padding: Spacing.xs,
    },
    doubleVideo: {
        width: '100%',
        height: SCREEN_WIDTH * 0.75,
        padding: Spacing.xs,
    },
    quadVideo: {
        width: '50%',
        aspectRatio: 0.8,
        padding: Spacing.xs,
    },
    sixVideo: {
        width: '50%',
        aspectRatio: 1,
        padding: Spacing.xs,
    },
});
