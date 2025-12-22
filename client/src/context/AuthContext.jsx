import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../service/api";

const INITIAL_STATE = {
    user: null, // Don't trust localStorage, wait for session check
    loading: true,
    error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return {
                user: null,
                loading: true,
                error: null,
            };
        case "LOGIN_SUCCESS":
            return {
                user: action.payload,
                loading: false,
                error: null,
            };
        case "LOGIN_FAILURE":
            return {
                user: null,
                loading: false,
                error: action.payload,
            };
        case "LOGOUT":
            return {
                user: null,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    // Build checkAuth function
    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user });
        } catch (err) {
            // Not authenticated or error
            dispatch({ type: "LOGOUT" });
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed", err);
        }
        dispatch({ type: "LOGOUT" });
    };

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                loading: state.loading,
                error: state.error,
                dispatch,
                logout,
                checkAuth, // Expose if needed
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Export alias for compatibility
export const AuthProvider = AuthContextProvider;
