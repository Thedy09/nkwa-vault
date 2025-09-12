import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

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
    if (token && !user && !checkingAuth) {
      checkAuth();
    } else if (!token) {
      setLoading(false);
    }
  }, [token, user, checkingAuth]);

  const checkAuth = async () => {
    if (checkingAuth) return; // Éviter les appels multiples
    
    setCheckingAuth(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/auth/me`);
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      logout();
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  const login = async (email, password) => {
    if (loading || checkingAuth) return { success: false, message: 'Connexion en cours...' };
    
    try {
      setLoading(true);
      console.log('Tentative de connexion pour:', email);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/auth/login`, {
        email,
        password
      });

      console.log('Réponse de connexion:', response.data);

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
        
        console.log('Connexion réussie pour:', userData.name);
        return { success: true, user: userData };
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
      console.log('Tentative d\'inscription pour:', email);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/auth/register`, {
        email,
        password,
        name
      });

      console.log('Réponse d\'inscription:', response.data);

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
        
        console.log('Inscription réussie pour:', userData.name);
        return { success: true, user: userData };
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
    return user?.role === 'admin';
  };

  const isModerator = () => {
    return user?.role === 'moderator' || user?.role === 'admin';
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

