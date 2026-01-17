import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, FlatList, Dimensions, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import VideoView from '../components/VideoView';
import MeetingControls from '../components/MeetingControls';
import Whiteboard from '../components/Whiteboard';
import ParticipantList from '../components/ParticipantList';
import SocketService from '../services/SocketService';
import WebRTCService from '../services/WebRTCService';

const { width } = Dimensions.get('window');

// Conditional require for native-only libraries
let nativeMediaDevices;
if (Platform.OS !== 'web') {
    nativeMediaDevices = require('react-native-webrtc').mediaDevices;
}

const getMediaDevices = () => {
    return Platform.OS === 'web' ? navigator.mediaDevices : nativeMediaDevices;
};

export default function MeetingScreen({ route, navigation }) {
    const { roomID } = route.params;
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
    const [isParticipantListVisible, setIsParticipantListVisible] = useState(false);

    const localStreamRef = useRef(null);
    const userIdRef = useRef(`User_${Math.floor(Math.random() * 1000)}`);

    useEffect(() => {
        const initMeeting = async () => {
            const stream = await startLocalStream();
            if (stream) {
                SocketService.connect();
                SocketService.joinRoom(roomID, userIdRef.current);
                setupSocketListeners(stream);
            }
        };

        initMeeting();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            SocketService.disconnect();
            WebRTCService.clearPeers();
        };
    }, []);

    const setupSocketListeners = (stream) => {
        SocketService.onUserJoined(async ({ userID, socketId }) => {
            console.log('User joined:', userID, socketId);
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
            console.log('User disconnected:', socketId);
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

    const startLocalStream = async () => {
        try {
            const stream = await getMediaDevices().getUserMedia({
                audio: true,
                video: {
                    facingMode: 'user',
                },
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error getting user media:', error);
            return null;
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
        navigation.goBack();
    };

    const handleShareScreen = async () => {
        try {
            if (isSharingScreen) {
                // Stop sharing and revert to camera
                const stream = await startLocalStream();
                // Replace tracks in all peer connections
                Object.values(WebRTCService.peers).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
                });
                setIsSharingScreen(false);
            } else {
                // Start screen share
                const stream = await getMediaDevices().getDisplayMedia({ video: true });
                setLocalStream(stream);
                setIsSharingScreen(true);
                // Replace tracks in all peer connections
                Object.values(WebRTCService.peers).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
                });
            }
        } catch (e) {
            console.error('Screen share error:', e);
        }
    };

    const toggleWhiteboard = () => {
        setIsWhiteboardVisible(!isWhiteboardVisible);
    };

    const toggleParticipantList = () => {
        setIsParticipantListVisible(!isParticipantListVisible);
    };

    const renderVideoItem = ({ item }) => (
        <View style={styles.videoWrapper}>
            <VideoView
                stream={item.stream}
                name={item.name}
                isLocal={item.isLocal}
                isMuted={item.isMuted}
            />
        </View>
    );

    const allStreams = [
        { id: 'local', stream: localStream, name: 'You', isLocal: true, isMuted: !isMicOn },
        ...remoteStreams
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.roomText}>Meeting: {roomID}</Text>
            </View>

            <View style={styles.gridContainer}>
                <FlatList
                    data={allStreams}
                    renderItem={renderVideoItem}
                    keyExtractor={item => item.id}
                    numColumns={allStreams.length > 2 ? 2 : 1}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            <Whiteboard isVisible={isWhiteboardVisible} roomID={roomID} />

            <ParticipantList
                isVisible={isParticipantListVisible}
                onClose={toggleParticipantList}
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
                onToggleWhiteboard={toggleWhiteboard}
                isWhiteboardVisible={isWhiteboardVisible}
                onShowParticipants={toggleParticipantList}
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
        alignItems: 'center',
    },
    roomText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    gridContainer: {
        flex: 1,
        paddingHorizontal: Spacing.s,
    },
    listContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    videoWrapper: {
        flex: 1,
        aspectRatio: 1,
        maxWidth: width - Spacing.m * 2,
    },
});
