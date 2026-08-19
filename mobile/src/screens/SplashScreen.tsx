import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, Cloud } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const glowPulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Fade & Spring
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Loading Progress Bar Animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // 3. Continuous Ambient Orb Glow Loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 1.2,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: 1.0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 4. Auto finish
    if (onFinish) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 2500);

      return () => {
        clearTimeout(timer);
        pulseLoop.stop();
      };
    }

    return () => pulseLoop.stop();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Deep Midnight Canvas */}
      <LinearGradient
        colors={['#030712', '#090d16', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Atmospheric Neon Orbs */}
      <Animated.View
        style={[
          styles.ambientTopLeftGlow,
          { transform: [{ scale: glowPulseAnim }] },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.ambientRightGlow,
          { transform: [{ scale: glowPulseAnim }] },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.ambientBottomGlow,
          { transform: [{ scale: glowPulseAnim }] },
        ]}
        pointerEvents="none"
      />

      {/* Decorative Matrix Dot Grids */}
      <View style={styles.dotGridTopLeft} pointerEvents="none">
        {[...Array(24)].map((_, i) => (
          <View key={i} style={styles.gridDot} />
        ))}
      </View>
      <View style={styles.dotGridBottomRight} pointerEvents="none">
        {[...Array(24)].map((_, i) => (
          <View key={i} style={styles.gridDot} />
        ))}
      </View>

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glow Halo Behind Logo */}
        <Animated.View
          style={[
            styles.glowHalo,
            { transform: [{ scale: glowPulseAnim }] },
          ]}
        />

        {/* Brand App Icon Emblem */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        {/* Welcome & Brand Title */}
        <Text style={styles.brandTitle}>Welcome to KwikBill 👋</Text>
        <Text style={styles.brandSubtitle}>
          Fast, Smart, GST Ready Mobile Platform
        </Text>

        {/* Animated Progress Pill */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </Animated.View>

      {/* Bottom 3 Trust Badges (Matching Screenshot) */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.valuePropsRow}>
          {/* Badge 1 */}
          <View style={styles.valuePropItem}>
            <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
              <Shield size={16} color="#818cf8" />
            </View>
            <Text style={styles.valuePropTitle}>Secure & Encrypted</Text>
            <Text style={styles.valuePropSub}>Your data is safe</Text>
          </View>

          <View style={styles.valuePropDivider} />

          {/* Badge 2 */}
          <View style={styles.valuePropItem}>
            <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Zap size={16} color="#60a5fa" />
            </View>
            <Text style={styles.valuePropTitle}>Lightning Fast</Text>
            <Text style={styles.valuePropSub}>Built for speed</Text>
          </View>

          <View style={styles.valuePropDivider} />

          {/* Badge 3 */}
          <View style={styles.valuePropItem}>
            <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
              <Cloud size={16} color="#c084fc" />
            </View>
            <Text style={styles.valuePropTitle}>Always Available</Text>
            <Text style={styles.valuePropSub}>99.9% Uptime</Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          © 2026 KwikBill • All rights reserved
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientTopLeftGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    top: 80,
    left: -40,
  },
  ambientRightGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    top: 180,
    right: -80,
  },
  ambientBottomGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    bottom: -60,
    alignSelf: 'center',
  },
  dotGridTopLeft: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 70,
    height: 90,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    opacity: 0.15,
  },
  dotGridBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 70,
    height: 90,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    opacity: 0.15,
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  glowHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366f1',
    opacity: 0.4,
    top: 0,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  progressTrack: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 26,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 28,
    width: '100%',
    paddingHorizontal: 20,
  },
  valuePropsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  valuePropItem: {
    flex: 1,
    alignItems: 'center',
  },
  valuePropIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  valuePropTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  valuePropSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  valuePropDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  copyrightText: {
    fontSize: 10.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },
});
