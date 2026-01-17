import { Platform } from 'react-native';

const peerConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

let PC, SD, IC;

if (Platform.OS === 'web') {
    PC = window.RTCPeerConnection;
    SD = window.RTCSessionDescription;
    IC = window.RTCIceCandidate;
} else {
    // Only require native lib on non-web platforms
    const WebRTC = require('react-native-webrtc');
    PC = WebRTC.RTCPeerConnection;
    SD = WebRTC.RTCSessionDescription;
    IC = WebRTC.RTCIceCandidate;
}

class WebRTCService {
    constructor() {
        this.peers = {}; // peerId -> RTCPeerConnection
    }

    createPeerConnection(peerId, localStream, onRemoteStream, onIceCandidate) {
        const peerConnection = new PC(peerConfiguration);

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidate(peerId, event.candidate);
            }
        };

        peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                onRemoteStream(peerId, event.streams[0]);
            }
        };

        this.peers[peerId] = peerConnection;
        return peerConnection;
    }

    async createOffer(peerId) {
        const pc = this.peers[peerId];
        if (pc) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            return offer;
        }
    }

    async handleOffer(peerId, offer) {
        const pc = this.peers[peerId];
        if (pc) {
            await pc.setRemoteDescription(new SD(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            return answer;
        }
    }

    async handleAnswer(peerId, answer) {
        const pc = this.peers[peerId];
        if (pc) {
            await pc.setRemoteDescription(new SD(answer));
        }
    }

    async handleIceCandidate(peerId, candidate) {
        const pc = this.peers[peerId];
        if (pc) {
            await pc.addIceCandidate(new IC(candidate));
        }
    }

    removePeer(peerId) {
        const pc = this.peers[peerId];
        if (pc) {
            pc.close();
            delete this.peers[peerId];
        }
    }

    clearPeers() {
        Object.keys(this.peers).forEach(peerId => this.removePeer(peerId));
    }
}

export default new WebRTCService();
