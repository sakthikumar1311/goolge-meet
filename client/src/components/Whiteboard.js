import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Edit3, Eraser, Trash2, X } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import SocketService from '../services/SocketService';

export default function Whiteboard(props) {
    const { isVisible, roomID, onClose } = props;
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [activeTool, setActiveTool] = useState('draw'); // draw, erase

    useEffect(() => {
        if (isVisible && SocketService.socket) {
            SocketService.socket.on('init-whiteboard', ({ paths }) => {
                setPaths(paths || []);
            });

            SocketService.socket.on('draw', ({ path }) => {
                setPaths(prev => [...prev, path]);
            });

            SocketService.socket.on('clear-whiteboard', () => {
                setPaths([]);
            });
        }
        return () => {
            SocketService.socket?.off('init-whiteboard');
            SocketService.socket?.off('draw');
            SocketService.socket?.off('clear-whiteboard');
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
                    const finishedPath = {
                        d: currentPath,
                        color: activeTool === 'erase' ? '#FFFFFF' : Colors.primary,
                        width: activeTool === 'erase' ? 20 : 3
                    };
                    setPaths(prev => [...prev, finishedPath]);
                    SocketService.socket?.emit('draw', { roomID, path: finishedPath });
                    setCurrentPath('');
                }
            },
        })
    ).current;

    const handleClear = () => {
        setPaths([]);
        SocketService.socket?.emit('clear-whiteboard', { roomID });
    };

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Whiteboard</Text>
                <TouchableOpacity onPress={onClose}>
                    <X color={Colors.black} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <Svg style={styles.svg}>
                    {paths.map((path, index) => (
                        <Path
                            key={index}
                            d={path.d}
                            stroke={path.color}
                            strokeWidth={path.width}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                    {currentPath ? (
                        <Path
                            d={currentPath}
                            stroke={activeTool === 'erase' ? '#FFFFFF' : Colors.primary}
                            strokeWidth={activeTool === 'erase' ? 20 : 3}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}
                </Svg>
            </View>

            <View style={styles.toolbar}>
                <TouchableOpacity
                    style={[styles.toolButton, activeTool === 'draw' && styles.activeTool]}
                    onPress={() => setActiveTool('draw')}
                >
                    <Edit3 color={activeTool === 'draw' ? Colors.white : Colors.secondary} size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toolButton, activeTool === 'erase' && styles.activeTool]}
                    onPress={() => setActiveTool('erase')}
                >
                    <Eraser color={activeTool === 'erase' ? Colors.white : Colors.secondary} size={20} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                    <Trash2 color={Colors.error} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        zIndex: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.black,
    },
    canvasContainer: {
        flex: 1,
    },
    svg: {
        flex: 1,
    },
    toolbar: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: '10%',
        right: '10%',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        padding: Spacing.s,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    toolButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.xs,
    },
    activeTool: {
        backgroundColor: Colors.primary,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#DDDDDD',
        marginHorizontal: Spacing.s,
    },
});
