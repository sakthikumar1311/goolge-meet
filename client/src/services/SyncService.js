import { Platform } from 'react-native';

class SyncService {
    constructor(roomID) {
        this.roomID = roomID;
        this.channelName = `meet_sync_${roomID}`;
        this.channel = null;
        this.subscribers = [];

        if (Platform.OS === 'web' && typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel(this.channelName);
            this.channel.onmessage = (event) => {
                const { type, payload, senderID } = event.data;
                this.subscribers.forEach(cb => cb(type, payload, senderID));
            };
        }
    }

    broadcast(type, payload, senderID) {
        if (this.channel) {
            this.channel.postMessage({ type, payload, senderID });
        }
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    cleanup() {
        if (this.channel) {
            this.channel.close();
        }
    }
}

export default SyncService;
