// src/utils/parametrageApi.js
import axiosInstance from './AxiosInstance';

class ParametrageApi {
  // Règles de congés
  static reglesConges = {
    getAll: () => axiosInstance.get('/api/regles-conges'),
    getById: (id) => axiosInstance.get(`/api/regles-conges/${id}`),
    create: (data) => axiosInstance.post('/api/regles-conges', data),
    update: (id, data) => axiosInstance.put(`/api/regles-conges/${id}`, data),
    delete: (id) => axiosInstance.delete(`/api/regles-conges/${id}`),
  };

  // Base IRSA
  static baseIrsa = {
    getAll: () => axiosInstance.get('/api/base-irsa'),
    getById: (id) => axiosInstance.get(`/api/base-irsa/${id}`),
    getByNumTranche: (numTranche) => axiosInstance.get(`/api/base-irsa/tranche/${numTranche}`),
    create: (data) => axiosInstance.post('/api/base-irsa', data),
    update: (id, data) => axiosInstance.put(`/api/base-irsa/${id}`, data),
    delete: (id) => axiosInstance.delete(`/api/base-irsa/${id}`),
    deleteByNumTranche: (numTranche) => axiosInstance.delete(`/api/base-irsa/tranche/${numTranche}`),
    calculate: (revenu) => axiosInstance.get('/api/base-irsa/calculer', { params: { revenu } }),
    calculateDetails: (revenu) => axiosInstance.get('/api/base-irsa/calculer-details', { params: { revenu } }),
    getTrancheForMontant: (montant) => axiosInstance.get('/api/base-irsa/tranche-pour-montant', { params: { montant } }),
    validate: () => axiosInstance.get('/api/base-irsa/validation'),
    reorder: () => axiosInstance.post('/api/base-irsa/reordonner'),
    initialize: () => axiosInstance.post('/api/base-irsa/initialiser-defaut'),
    testCalcul: () => axiosInstance.get('/api/base-irsa/test-calcul'),
  };

  // Règles d'annulation
  static reglesAnnulation = {
    getAll: () => axiosInstance.get('/api/regles-annulation'),
    getById: (id) => axiosInstance.get(`/api/regles-annulation/${id}`),
    getActives: () => axiosInstance.get('/api/regles-annulation/actives'),
    create: (data) => axiosInstance.post('/api/regles-annulation', data),
    update: (id, data) => axiosInstance.put(`/api/regles-annulation/${id}`, data),
    delete: (id) => axiosInstance.delete(`/api/regles-annulation/${id}`),
  };
}

export default ParametrageApi;