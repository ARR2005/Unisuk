import React, { createContext, useContext, useEffect, useState } from "react";

export const Auth = createContext<any | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null); 
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // onAuthStatechanged

    setTimeout(() => {
        setIsAuthenticated(false);
    }, 3000);
  }, [])

  const login = async (email, password) => {
     // login logic
     try {
        
     } catch (e) {
        
     }
  }
  
  const logout = async () => {
     // logout logic
     try {
        
     } catch (e) {
        
     }
  }

  const register =  async (email, studentID = null, username, password) => {
     // register logic
     try {
        
     } catch (error) {
        
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