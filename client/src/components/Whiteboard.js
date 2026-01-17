import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme/theme';
import SocketService from '../services/SocketService';

export default function Whiteboard(props) {
    const { isVisible, roomID } = props;
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        if (isVisible && SocketService.socket) {
            // Load initial state
            SocketService.socket.on('init-whiteboard', ({ paths }) => {
                setPaths(paths);
            });

            // Receive new drawings
            SocketService.socket.on('draw', ({ path }) => {
                setPaths(prev => [...prev, path]);
            });
        }
        return () => {
            SocketService.socket?.off('init-whiteboard');
            SocketService.socket?.off('draw');
        };
    }, [isVisible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gestureState) => {
                const { locationX, locationY } = event.nativeEvent;
                const newPoint = `${Math.round(locationX)},${Math.round(locationY)}`;
                setCurrentPath(prev => (prev ? `${prev} L ${newPoint}` : `M ${newPoint}`));
            },
            onPanResponderRelease: () => {
                if (currentPath) {
                    const finishedPath = currentPath;
                    setPaths(prev => [...prev, finishedPath]);
                    SocketService.socket?.emit('draw', { roomID: props.roomID, path: finishedPath });
                    setCurrentPath('');
                }
            },
        })
    ).current;

    if (!isVisible) return null;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <Svg style={styles.svg}>
                {paths.map((path, index) => (
                    <Path key={index} d={path} stroke={Colors.primary} strokeWidth={3} fill="none" />
                ))}
                {currentPath ? (
                    <Path d={currentPath} stroke={Colors.primary} strokeWidth={3} fill="none" />
                ) : null}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.9)',
        zIndex: 10,
    },
    svg: {
        flex: 1,
    },
});
