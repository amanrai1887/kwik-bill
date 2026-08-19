import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Cloud,
} from 'lucide-react-native';
import { useMobileAuth } from '../context/AuthContext.tsx';

const { width } = Dimensions.get('window');

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, resendEmailVerification, loginWithToken } = useMobileAuth() as any;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const res = await registerWithEmail(email.trim(), password);
        if (res?.needVerification) {
          Alert.alert(
            '✉️ Verification Link Sent',
            `We have sent an activation link to ${email.trim()}.\n\nPlease open your email inbox (and spam folder), click the link, and then Sign In.`,
            [{ text: 'OK, Got It', onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      console.log('Login error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/email-not-verified') {
        Alert.alert(
          'Email Verification Required',
          'Please verify your email before logging in.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Resend Link',
              onPress: async () => {
                try {
                  await resendEmailVerification(email.trim(), password);
                  Alert.alert('Sent', 'Verification email sent to ' + email.trim());
                } catch (e: any) {
                  Alert.alert('Error', e.message);
                }
              },
            },
          ]
        );
        return;
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Incorrect email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email already registered. Please Sign In.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'Account not found. Please tap "Sign Up" below.';
      }
      Alert.alert('Sign In', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In',
      'For mobile devices, please Sign In using your registered Work Email & Password. Your account and verified email will log into your personal tenant workspace directly.',
      [
        { text: 'Use Email/Password', style: 'default' },
        {
          text: 'Open Demo Mode',
          onPress: async () => {
            setIsLoading(true);
            try {
              await loginWithToken('demo-mobile-token');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Deep Midnight Gradient Canvas */}
      <LinearGradient
        colors={['#030712', '#090d16', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Atmospheric Ambient Glowing Orbs */}
      <View style={styles.ambientTopLeftGlow} pointerEvents="none" />
      <View style={styles.ambientRightGlow} pointerEvents="none" />
      <View style={styles.ambientBottomGlow} pointerEvents="none" />

      {/* Decorative Dot Grids */}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Top Logo Badge */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.heroTitle}>
              {isSignUp ? 'Create your account ✨' : 'Welcome back 👋'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isSignUp ? 'Sign up to launch your ' : 'Sign in to continue to your '}
              <Text style={styles.heroSubtitleBold}>KwikBill</Text> dashboard.
            </Text>
          </View>

          {/* Frosted Glass Card Form */}
          <View style={styles.cardContainer}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#818cf8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@company.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#818cf8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••••"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#94a3b8" />
                  ) : (
                    <Eye size={18} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password link */}
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() =>
                  Alert.alert(
                    'Reset Password',
                    'Please enter your email to receive a password reset link.'
                  )
                }
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Primary Action Button - Magenta to Indigo Glow Gradient */}
            <TouchableOpacity
              onPress={handleAuthSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.primaryBtnWrapper}
            >
              <LinearGradient
                colors={['#8b5cf6', '#6366f1', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                    <ArrowRight size={18} color="#ffffff" strokeWidth={2.5} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* "or" Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue with Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {/* Google G Emblem */}
              <View style={styles.googleCircle}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Switch Sign In / Sign Up Footer */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} activeOpacity={0.7}>
              <Text style={styles.switchHighlight}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3 Bottom Value Props (Secure, Fast, Always Available) */}
          <View style={styles.valuePropsRow}>
            {/* Value Prop 1 */}
            <View style={styles.valuePropItem}>
              <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                <Shield size={16} color="#818cf8" />
              </View>
              <Text style={styles.valuePropTitle}>Secure & Encrypted</Text>
              <Text style={styles.valuePropSub}>Your data is safe</Text>
            </View>

            <View style={styles.valuePropDivider} />

            {/* Value Prop 2 */}
            <View style={styles.valuePropItem}>
              <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Zap size={16} color="#60a5fa" />
              </View>
              <Text style={styles.valuePropTitle}>Lightning Fast</Text>
              <Text style={styles.valuePropSub}>Built for speed</Text>
            </View>

            <View style={styles.valuePropDivider} />

            {/* Value Prop 3 */}
            <View style={styles.valuePropItem}>
              <View style={[styles.valuePropIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                <Cloud size={16} color="#c084fc" />
              </View>
              <Text style={styles.valuePropTitle}>Always Available</Text>
              <Text style={styles.valuePropSub}>99.9% Uptime</Text>
            </View>
          </View>

          {/* Copyright Footer */}
          <Text style={styles.copyrightText}>
            © 2026 KwikBill • All rights reserved
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  ambientTopLeftGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    top: 60,
    left: -40,
  },
  ambientRightGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    top: 160,
    right: -80,
  },
  ambientBottomGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  heroSubtitleBold: {
    color: '#a5b4fc',
    fontWeight: '800',
  },
  cardContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    color: '#818cf8',
    fontWeight: '600',
  },
  primaryBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: 48,
    borderRadius: 14,
  },
  googleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: '#ea4335',
    fontWeight: '900',
    fontSize: 13,
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 26,
  },
  switchText: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  switchHighlight: {
    fontSize: 12.5,
    color: '#818cf8',
    fontWeight: '800',
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
    marginTop: 18,
    fontWeight: '500',
  },
});
