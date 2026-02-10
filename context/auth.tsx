import React, { createContext, useContext, useEffect, useState } from "react";
import {
    logout as firebaseLogout,
    signIn as firebaseSignIn,
    signUp as firebaseSignUp,
    onAuthStateChangedListener,
} from '../firebaseConfig';

export const Auth = createContext<any | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null); 
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
        const unsubscribe = onAuthStateChangedListener((user) => {
            setUser(user || null);
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
  }, [])

  const login = async (email, password) => {
      try {
          await firebaseSignIn(email, password);
      } catch (e) {
          throw e;
      }
  }
  
  const logout = async () => {
      try {
          await firebaseLogout();
      } catch (e) {
          throw e;
      }
  }

  const register =  async (email, studentID = null, username, password) => {
     // register logic
      try {
          await firebaseSignUp(email, password);
      } catch (error) {
          throw error;
      }
    }

    return (
        <Auth.Provider value={{ user, isAuthenticated, login, logout, register }}>
            {children}
        </Auth.Provider>
    )

}

export const useAuth = () => {
    const value = useContext(Auth);

    if(!value) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return value;
}