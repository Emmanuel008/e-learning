import axios from 'axios';
import apiClient from './apiClient';
import { BASE_URL } from './apiClient';

export const auth = {
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  logout: () =>
    apiClient.get('/auth/logout')
};

/**
 * User form actions (requires auth token).
 * save: { form_method: "save", name, email, password, phone, role, id? }
 * delete: { form_method: "delete", id }
 */
export const users = {
  iformAction: (body) =>
    apiClient.post('/users/iformAction', body),

  /** Public registration (no token). */
  register: (body) =>
    axios.post(`${BASE_URL}/users/register`, body, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    }),

  /** List users (paginated). Params: { paginate: true, per_page?: number, page?: number } */
  ilist: (params = {}) =>
    apiClient.get('/users/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  /** Get logged-in user profile. */
  iget: () =>
    apiClient.get('/users/iget')
};

/**
 * Module CRUD (requires auth token).
 * save: { form_method: "save", name, description, code, id? }
 * delete: { form_method: "delete", id }
 */
export const moduleApi = {
  ilist: (params = {}) =>
    apiClient.get('/module/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  iget: (id) =>
    apiClient.get('/module/iget', { params: { id } }),

  iformAction: (body) =>
    apiClient.post('/module/iformAction', body)
};

/**
 * Learning Material CRUD (requires auth token).
 * save: { form_method: "save", module_id, title, description, type, media?, id? }
 * delete: { form_method: "delete", id }
 */
export const learningMaterialApi = {
  ilist: (params = {}) =>
    apiClient.get('/learningMaterial/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  iget: (id) =>
    apiClient.get('/learningMaterial/iget', { params: { id } }),

  iformAction: (body) =>
    apiClient.post('/learningMaterial/iformAction', body)
};

/**
 * Quiz CRUD (requires auth token).
 * save: { form_method: "save", module_id, name?, question, options: [{ option, value }], correct_option, id? }
 * delete: { form_method: "delete", id }
 */
export const quizApi = {
  ilist: (params = {}) =>
    apiClient.get('/quiz/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  iget: (id) =>
    apiClient.get('/quiz/iget', { params: { id } }),

  iformAction: (body) =>
    apiClient.post('/quiz/iformAction', body)
};

/**
 * Quiz answer submit and results (requires auth token).
 * save: { form_method: "save", user_id, answers: [{ question_id, answer }] }
 * iresults: GET ?module_id=1 - get user's quiz results for a module
 */
export const quizAnswerApi = {
  iformAction: (body) =>
    apiClient.post('/quizAnswer/iformAction', body),

  iresults: (params) =>
    apiClient.get('/quizAnswer/iresults', { params })
};

/**
 * Certificate CRUD (requires auth token).
 * save: { form_method: "save", user_id, certificate: "data:application/pdf;base64,...", id? }
 * delete: { form_method: "delete", id }
 * ilist params: paginate, per_page, page, user_id (optional - filter by certificate owner)
 */
export const certificateApi = {
  ilist: (params = {}) =>
    apiClient.get('/certificate/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  iget: (id) =>
    apiClient.get('/certificate/iget', { params: { id } }),

  iformAction: (body) =>
    apiClient.post('/certificate/iformAction', body)
};

/**
 * Assignment CRUD (requires auth token).
 * save: { form_method: "save", title, description, assigned_user_id, document?: "data:application/pdf;base64,...", id? }
 * update: { form_method: "update", id, title, description, assigned_user_id, document? }
 * delete: { form_method: "delete", id }
 * ilist params: paginate, per_page, page, assigned_user_id (optional - filter by assigned user)
 */
export const assignmentApi = {
  ilist: (params = {}) =>
    apiClient.get('/assignment/ilist', { params: { paginate: true, per_page: 5, ...params } }),

  iget: (id) =>
    apiClient.get('/assignment/iget', { params: { id } }),

  iformAction: (body) =>
    apiClient.post('/assignment/iformAction', body)
};

const api = { auth, users, moduleApi, learningMaterialApi, quizApi, quizAnswerApi, certificateApi, assignmentApi };
export default api;
