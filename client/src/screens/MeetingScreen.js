import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, FlatList, Dimensions, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import VideoView from '../components/VideoView';
import MeetingControls from '../components/MeetingControls';
import Whiteboard from '../components/Whiteboard';
import ParticipantList from '../components/ParticipantList';
import { Users } from 'lucide-react-native';
import SocketService from '../services/SocketService';
import WebRTCService from '../services/WebRTCService';

// Safe dimension access for web
const getScreenWidth = () => {
    try {
        return Dimensions.get('window').width;
    } catch (e) {
        return 400; // Fallback
    }
};
const SCREEN_WIDTH = getScreenWidth();

// Conditional require for native-only libraries
let nativeMediaDevices;
if (Platform.OS !== 'web') {
    nativeMediaDevices = require('react-native-webrtc').mediaDevices;
}

const getMediaDevices = () => {
    if (Platform.OS === 'web') {
        return (typeof navigator !== 'undefined' && navigator.mediaDevices) ? navigator.mediaDevices : null;
    }
    return nativeMediaDevices;
};

export default function MeetingScreen({ route, navigation }) {
    const { roomID, initialMic = true, initialCam = true } = route.params;
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(initialMic);
    const [isCamOn, setIsCamOn] = useState(initialCam);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
    const [isParticipantListVisible, setIsParticipantListVisible] = useState(false);

    // Simulation states
    const [activeSpeakerId, setActiveSpeakerId] = useState(null);
    const [mockParticipants, setMockParticipants] = useState([]);

    const localStreamRef = useRef(null);
    const userIdRef = useRef(`User_${Math.floor(Math.random() * 1000)}`);

    useEffect(() => {
        const initMeeting = async () => {
            const stream = await startLocalStream(initialMic, initialCam);
            if (stream) {
                SocketService.connect();
                SocketService.joinRoom(roomID, userIdRef.current);
                setupSocketListeners(stream);
            }
        };

        initMeeting();

        // Simulation: Add mock participants if alone after 2 seconds
        const mockTimeout = setTimeout(() => {
            if (remoteStreams.length === 0) {
                setMockParticipants([
                    { id: 'mock1', name: 'Alex Thompson', isMuted: true },
                    { id: 'mock2', name: 'Sarah Wilson', isMuted: false },
                ]);
            }
        }, 2000);

        // Simulation: Change active speaker every 5 seconds
        const speakerInterval = setInterval(() => {
            const pool = ['local', 'mock1', 'mock2', ...remoteStreams.map(s => s.id)];
            const randomId = pool[Math.floor(Math.random() * pool.length)];
            setActiveSpeakerId(randomId);
        }, 5000);

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            SocketService.disconnect();
            WebRTCService.clearPeers();
            clearTimeout(mockTimeout);
            clearInterval(speakerInterval);
        };
    }, []);

    const setupSocketListeners = (stream) => {
        SocketService.onUserJoined(async ({ userID, socketId }) => {
            setMockParticipants([]); // Remove mocks when real user joins
            await WebRTCService.createPeerConnection(
                userID,
                stream,
                (peerId, remoteStream) => handleRemoteStream(peerId, remoteStream, socketId),
                handleIceCandidate
            );
            const createdOffer = await WebRTCService.createOffer(userID);
            SocketService.sendSignal(userID, { type: 'offer', offer: createdOffer });
        });

        SocketService.onSignalReceived(async ({ from, signal }) => {
            if (signal.type === 'offer') {
                await WebRTCService.createPeerConnection(
                    from,
                    stream,
                    (peerId, remoteStream) => handleRemoteStream(peerId, remoteStream),
                    handleIceCandidate
                );
                const answer = await WebRTCService.handleOffer(from, signal.offer);
                SocketService.sendSignal(from, { type: 'answer', answer });
            } else if (signal.type === 'answer') {
                await WebRTCService.handleAnswer(from, signal.answer);
            } else if (signal.type === 'ice-candidate') {
                await WebRTCService.handleIceCandidate(from, signal.candidate);
            }
        });

        SocketService.onUserDisconnected(({ socketId }) => {
            setRemoteStreams(prev => {
                const userToDisconnect = prev.find(s => s.socketId === socketId);
                if (userToDisconnect) {
                    WebRTCService.removePeer(userToDisconnect.id);
                }
                return prev.filter(s => s.socketId !== socketId);
            });
        });
    };

    const handleRemoteStream = (peerId, stream, socketId) => {
        setRemoteStreams(prev => {
            const exists = prev.find(s => s.id === peerId);
            if (exists) return prev;
            return [...prev, {
                id: peerId,
                socketId: socketId,
                stream,
                name: peerId,
                isLocal: false,
                isMuted: false
            }];
        });
    };

    const handleIceCandidate = (peerId, candidate) => {
        SocketService.sendSignal(peerId, { type: 'ice-candidate', candidate });
    };

    const startLocalStream = async (mic, cam) => {
        try {
            const stream = await getMediaDevices().getUserMedia({
                audio: mic,
                video: cam ? { facingMode: 'user' } : false,
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error getting user media:', error);
            // Fallback for devices without camera/mic or permissions denied
            setLocalStream(null);
            return { getTracks: () => [] };
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleCam = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCamOn(videoTrack.enabled);
            }
        }
    };

    const handleHangup = () => {
        navigation.navigate('Home');
    };

    const handleShareScreen = async () => {
        if (Platform.OS === 'web') {
            try {
                if (isSharingScreen) {
                    const stream = await startLocalStream(isMicOn, isCamOn);
                    Object.values(WebRTCService.peers).forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track.kind === 'video');
                        if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
                    });
                    setIsSharingScreen(false);
                } else {
                    const stream = await getMediaDevices().getDisplayMedia({ video: true });
                    setLocalStream(stream);
                    setIsSharingScreen(true);
                    Object.values(WebRTCService.peers).forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track.kind === 'video');
                        if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
                    });
                }
            } catch (e) {
                console.error('Screen share error:', e);
            }
        } else {
            // Simulation for native screen share
            setIsSharingScreen(!isSharingScreen);
        }
    };

    const renderVideoItem = ({ item }) => (
        <View style={[
            styles.videoWrapper,
            (allStreams.length === 1) && styles.singleVideo,
            (allStreams.length === 2) && styles.doubleVideo
        ]}>
            <VideoView
                stream={item.stream}
                name={item.name}
                isLocal={item.isLocal}
                isMuted={item.isMuted}
                isActiveSpeaker={activeSpeakerId === item.id}
                isSharing={item.isSharing}
            />
        </View>
    );

    const allStreams = [
        { id: 'local', stream: localStream, name: 'You', isLocal: true, isMuted: !isMicOn, isSharing: isSharingScreen },
        ...remoteStreams,
        ...mockParticipants.map(mp => ({ ...mp, stream: null, isLocal: false, isSharing: false }))
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.roomText}>{roomID}</Text>
                <Users color={Colors.textSecondary} size={16} />
            </View>

            <View style={styles.gridContainer}>
                <FlatList
                    data={allStreams}
                    renderItem={renderVideoItem}
                    keyExtractor={item => item.id}
                    numColumns={allStreams.length > 2 ? 2 : 1}
                    contentContainerStyle={styles.listContent}
                    key={allStreams.length > 2 ? 'grid' : 'list'}
                />
            </View>

            <Whiteboard
                isVisible={isWhiteboardVisible}
                roomID={roomID}
                onClose={() => setIsWhiteboardVisible(false)}
            />

            <ParticipantList
                isVisible={isParticipantListVisible}
                onClose={() => setIsParticipantListVisible(false)}
                participants={allStreams}
            />

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
                participantCount={allStreams.length}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
    },
    roomText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    gridContainer: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        padding: Spacing.s,
    },
    videoWrapper: {
        flex: 1,
        aspectRatio: 1,
        padding: Spacing.xs,
    },
    singleVideo: {
        aspectRatio: 9 / 16,
        maxHeight: '80%',
    },
    doubleVideo: {
        aspectRatio: 1,
    },
});
