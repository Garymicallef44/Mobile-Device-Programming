import { auth } from '@/firebaseConfig';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Implementing Auth Context Type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create Context for components to inherit data flow 
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
});

// define useAuth to use created Context
export const useAuth = () => useContext(AuthContext);

// Dummy export to silence route warning - this is not a route file
export default function DummyComponent() { return null; }

// Authentication Provider 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // User state to hold user data
  const [user, setUser] = useState<User | null>(null);
  // Loading state
  const [loading, setLoading] = useState(false);

  // Console check for user change
  useEffect(() => {
    console.log('=== User state changed in provider ===');
    console.log('Current user:', user ? user.email : 'null');
  }, [user]);

  // 
  useEffect(() => {
    console.log('Auth object:', auth);
    console.log('Setting up auth listener...');
    
    // Change user on states
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Sign Up function
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Create user with email and passowrd
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update user profile with credentials and name
      await updateProfile(userCredential.user, { displayName });
      console.log('Sign up successful:', userCredential.user.email);
      // Manually set user state
      setUser(userCredential.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Handle Signin process
  const signIn = async (email: string, password: string) => {
    try {
      console.log('About to call signInWithEmailAndPassword...');
      // Call sign in method
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result);
      console.log('User email:', result.user.email);
      console.log('Setting user state...');
      // Manually set user state in case listener doesn't fire
      setUser(result.user);
      console.log('User state set');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Handle logout process
  const logout = async () => {
    try {
      // Call sign out process with auth context
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
