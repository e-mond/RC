import { createContext, useContext, useState, useEffect } from "react";
import { session } from "@/utils/session";
import apiClient from "@/services/apiClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from local storage token
    useEffect(() => {
        const initAuth = async () => {
            const token = session.getToken();

            if (token) {
                try {
                    // Verify token and get user data
                    // We use the profile endpoint to validate the token
                    const response = await apiClient.get('/auth/profile/');

                    // Handle different response structures
                    const userData = response.data.user || response.data;
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    // If profile fetch fails (e.g. 401), clear session
                    session.clearAll();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData, tokens) => {
        // Tokens are likely already set by authService, but for safety:
        if (tokens) {
            if (tokens.access || tokens.token) {
                session.setToken(tokens.access || tokens.token);
            }
            if (tokens.refresh) {
                session.setRefreshToken(tokens.refresh);
            }
        }

        // If userData is not provided (e.g. just tokens), we might want to fetch it
        // But usually login flow provides it.
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        session.clearAll();
        setUser(null);
        setIsAuthenticated(false);
        // Optional: Redirect to login or handled by protected routes
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        setUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};