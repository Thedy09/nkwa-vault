import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Configuration axios avec token
  useEffect(() => {
    const token = Cookies.get('acv_token');
    if (token) {
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user && !checkingAuth) {
        await checkAuth();
      } else if (!token) {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [token]);

  const checkAuth = async () => {
    if (checkingAuth || !token) return; // Éviter les appels multiples et s'assurer qu'il y a un token
    
    setCheckingAuth(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        // Token invalide, déconnecter
        logout();
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      // Si erreur 401 (non autorisé), déconnecter
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  const login = async (email, password) => {
    if (loading || checkingAuth) return { success: false, message: 'Connexion en cours...' };
    
    try {
      setLoading(true);
      // Tentative de connexion
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      // Traitement de la réponse

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Sauvegarder le token dans les cookies
        Cookies.set('acv_token', authToken, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Configurer axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        setUser(userData);
        setToken(authToken);
        
        // Connexion réussie
        return { success: true, user: userData, redirectToAdmin: userData.role === 'ADMIN' };
      } else {
        console.error('Échec de connexion:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      // Tentative d'inscription
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        name
      });

      // Traitement de la réponse

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Sauvegarder le token dans les cookies
        Cookies.set('acv_token', authToken, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Configurer axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        setUser(userData);
        setToken(authToken);
        
        // Inscription réussie
        return { success: true, user: userData, redirectToAdmin: userData.role === 'ADMIN' };
      } else {
        console.error('Échec d\'inscription:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur d\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Supprimer le token des cookies
    Cookies.remove('acv_token');
    
    // Supprimer l'en-tête Authorization
    delete axios.defaults.headers.common['Authorization'];
    
    // Réinitialiser l'état
    setUser(null);
    setToken(null);
    setLoading(false);
    setCheckingAuth(false);
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isModerator = () => {
    return user?.role === 'MODERATOR' || user?.role === 'ADMIN';
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isModerator,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
