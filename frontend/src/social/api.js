import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const root = `${API_BASE_URL}/api/social`;

export const CATEGORIES = [
  { id: 'quotidien', label: 'Quotidien' },
  { id: 'conte', label: 'Conte' },
  { id: 'proverbe', label: 'Proverbe' },
  { id: 'musique', label: 'Musique' },
  { id: 'art', label: 'Art' },
  { id: 'devinette', label: 'Devinette' }
];

export function categoryLabel(id) {
  return CATEGORIES.find((item) => item.id === id)?.label || 'Publication';
}

export function mediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (Number.isNaN(minutes) || minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 14) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

export function errorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function getReels() {
  const response = await axios.get(`${root}/reels`, { params: { limit: 18 } });
  return response.data.data;
}

export async function getFeed({ mode = 'discover', offset = 0, category } = {}) {
  const response = await axios.get(`${root}/feed`, { params: { mode, offset, limit: 20, category } });
  return response.data.data;
}

export async function explore({ q = '', category = '', heritage = false, offset = 0 } = {}) {
  const response = await axios.get(`${root}/explore`, {
    params: { q, category, heritage: heritage ? '1' : undefined, offset, limit: 20 }
  });
  return response.data.data;
}

export async function getCommunity() {
  const response = await axios.get(`${root}/community`);
  return response.data.data;
}

export async function getInbox() {
  const response = await axios.get(`${root}/inbox`);
  return response.data.data;
}

export async function createPost(payload) {
  const response = await axios.post(`${root}/posts`, payload);
  return response.data.data.post;
}

export async function deletePost(id) {
  await axios.delete(`${root}/posts/${id}`);
}

export async function likePost(id) {
  const response = await axios.post(`${root}/posts/${id}/like`);
  return response.data.data.post;
}

export async function unlikePost(id) {
  const response = await axios.delete(`${root}/posts/${id}/like`);
  return response.data.data.post;
}

export async function getComments(id) {
  const response = await axios.get(`${root}/posts/${id}/comments`);
  return response.data.data.comments;
}

export async function addComment(id, body) {
  const response = await axios.post(`${root}/posts/${id}/comments`, { body });
  return response.data.data.comments;
}

export async function deleteComment(id) {
  const response = await axios.delete(`${root}/comments/${id}`);
  return response.data.data.comments;
}

export async function bookmarkPost(id) {
  const response = await axios.post(`${root}/posts/${id}/bookmark`);
  return response.data.data.post;
}

export async function unbookmarkPost(id) {
  const response = await axios.delete(`${root}/posts/${id}/bookmark`);
  return response.data.data.post;
}

export async function getBookmarks() {
  const response = await axios.get(`${root}/bookmarks`);
  return response.data.data.posts;
}

export async function getProfile(username) {
  const response = await axios.get(`${root}/users/${encodeURIComponent(username)}`);
  return response.data.data;
}

export async function getRelations(username, kind) {
  const response = await axios.get(`${root}/users/${encodeURIComponent(username)}/${kind}`);
  return response.data.data.users;
}

export async function followUser(username) {
  const response = await axios.post(`${root}/users/${encodeURIComponent(username)}/follow`);
  return response.data.data.user;
}

export async function unfollowUser(username) {
  const response = await axios.delete(`${root}/users/${encodeURIComponent(username)}/follow`);
  return response.data.data.user;
}

export async function updateProfile(payload) {
  const response = await axios.put(`${root}/auth/me`, payload);
  return response.data.data.user;
}

export async function getNotifications() {
  const response = await axios.get(`${root}/notifications`);
  return response.data.data.notifications;
}

export async function markNotificationsRead() {
  const response = await axios.post(`${root}/notifications/read`);
  return response.data.data.notifications;
}

export async function getConversations() {
  const response = await axios.get(`${root}/messages`);
  return response.data.data.conversations;
}

export async function getThread(username) {
  const response = await axios.get(`${root}/messages/${encodeURIComponent(username)}`);
  return response.data.data;
}

export async function sendMessage(username, body) {
  const response = await axios.post(`${root}/messages/${encodeURIComponent(username)}`, { body });
  return response.data.data;
}

export async function uploadMedia(file) {
  const form = new FormData();
  form.append('image', file);
  const response = await axios.post(`${root}/media`, form);
  return response.data.data;
}
