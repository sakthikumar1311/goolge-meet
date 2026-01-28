import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Text, ScrollView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Edit3, Eraser, Trash2, X, Circle, Download, Share2 } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme/theme';

const WHITEBOARD_COLORS = [
    '#3C4043', '#1A73E8', '#EA4335', '#FBBC04', '#34A853', '#A142F4', '#24C1E0', '#FF6D00'
];

const STROKE_WIDTHS = [2, 4, 8, 12, 24];

export default function Whiteboard(props) {
    const { isVisible, roomID, onClose, syncService } = props;
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [activeTool, setActiveTool] = useState('draw'); // draw, erase
    const [strokeColor, setStrokeColor] = useState(WHITEBOARD_COLORS[1]);
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [showSizePicker, setShowSizePicker] = useState(false);

    useEffect(() => {
        if (syncService && isVisible) {
            const unsubscribe = syncService.subscribe((type, payload) => {
                if (type === 'WHITEBOARD_DRAW') {
                    setPaths(prev => [...prev, payload]);
                } else if (type === 'WHITEBOARD_CLEAR') {
                    setPaths([]);
                }
            });
            return unsubscribe;
        }
    }, [syncService, isVisible]);

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
                        color: activeTool === 'erase' ? '#FFFFFF' : strokeColor,
                        width: activeTool === 'erase' ? 30 : strokeWidth
                    };
                    setPaths(prev => [...prev, finishedPath]);
                    setCurrentPath('');

                    if (syncService) {
                        syncService.broadcast('WHITEBOARD_DRAW', finishedPath);
                    }
                }
            },
        })
    ).current;

    const handleClear = () => {
        setPaths([]);
        if (syncService) {
            syncService.broadcast('WHITEBOARD_CLEAR', {});
        }
    };

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            {/* Jamboard-style Top Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <ArrowLeft color={Colors.secondary} size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Jamboard</Text>
                        <Text style={styles.subtitle}>{roomID}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Share2 color={Colors.googleBlue} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Download color={Colors.secondary} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Canvas Area with Dot Grid */}
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <View style={styles.dotGrid} />
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
                            stroke={activeTool === 'erase' ? '#FFFFFF' : strokeColor}
                            strokeWidth={activeTool === 'erase' ? 30 : strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}
                </Svg>
            </View>

            {/* Floating Toolbar (Side or Bottom) */}
            <View style={styles.controlsContainer}>
                {showSizePicker && (
                    <View style={styles.sizePicker}>
                        {STROKE_WIDTHS.map((width) => (
                            <TouchableOpacity
                                key={width}
                                style={[styles.sizeOption, strokeWidth === width && styles.activeSize]}
                                onPress={() => {
                                    setStrokeWidth(width);
                                    setShowSizePicker(false);
                                }}
                            >
                                <View style={[styles.sizeDot, { width: width / 2 + 2, height: width / 2 + 2, borderRadius: width / 4 + 1 }]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.colorPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                        {WHITEBOARD_COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorOption, { backgroundColor: color }, strokeColor === color && styles.activeColor]}
                                onPress={() => {
                                    setStrokeColor(color);
                                    setActiveTool('draw');
                                }}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.toolbar}>
                    <TouchableOpacity
                        style={[styles.toolButton, (activeTool === 'draw' && !showSizePicker) && styles.activeTool]}
                        onPress={() => setActiveTool('draw')}
                    >
                        <Edit3 color={(activeTool === 'draw' && !showSizePicker) ? Colors.white : Colors.secondary} size={22} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolButton, showSizePicker && styles.activeTool]}
                        onPress={() => setShowSizePicker(!showSizePicker)}
                    >
                        <View style={[styles.sizeIndicator, { width: 12, height: 12, borderRadius: 6 }]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolButton, activeTool === 'erase' && styles.activeTool]}
                        onPress={() => setActiveTool('erase')}
                    >
                        <Eraser color={activeTool === 'erase' ? Colors.white : Colors.secondary} size={22} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                        <Trash2 color={Colors.error} size={22} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Simple Arrow icon if needed, or use ChevronLeft
const ArrowLeft = ({ color, size }) => (
    <View style={{ transform: [{ rotate: '0deg' }] }}>
        <X color={color} size={size} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F8F9FA',
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        height: 64,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#DADCE0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        marginRight: Spacing.m,
        padding: Spacing.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3C4043',
    },
    subtitle: {
        fontSize: 12,
        color: '#70757A',
    },
    headerRight: {
        flexDirection: 'row',
    },
    headerIcon: {
        marginLeft: Spacing.m,
        padding: Spacing.xs,
    },
    canvasContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    dotGrid: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        // Simulation of dot grid background (can use a tiny pattern image or SVG)
        backgroundColor: 'transparent',
    },
    svg: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: Spacing.l,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
    },
    sizePicker: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: Spacing.s,
        borderRadius: 28,
        marginBottom: Spacing.s,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        gap: Spacing.s,
        borderWidth: 1,
        borderColor: '#DADCE0',
    },
    sizeOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F3F4',
    },
    activeSize: {
        backgroundColor: Colors.primary + '20',
        borderColor: Colors.googleBlue,
        borderWidth: 1,
    },
    sizeDot: {
        backgroundColor: '#3C4043',
    },
    colorPicker: {
        backgroundColor: Colors.white,
        padding: Spacing.s,
        borderRadius: 28,
        marginBottom: Spacing.s,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        maxWidth: '92%',
        borderWidth: 1,
        borderColor: '#DADCE0',
    },
    colorScroll: {
        gap: Spacing.s,
        paddingHorizontal: Spacing.xs,
    },
    colorOption: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeColor: {
        borderColor: '#DADCE0',
        transform: [{ scale: 1.15 }],
    },
    toolbar: {
        backgroundColor: Colors.white,
        flexDirection: 'row',
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.xs,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#DADCE0',
    },
    toolButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 1,
    },
    activeTool: {
        backgroundColor: '#E8F0FE', // Light blue background for active tool
    },
    sizeIndicator: {
        backgroundColor: Colors.secondary,
        borderWidth: 1,
        borderColor: '#DADCE0',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#DADCE0',
        marginHorizontal: Spacing.s,
    },
});
