import apiClient from './api';

/**
 * Parts & Inventory API Service
 */
export const partsService = {
  // Part Category Endpoints
  getPartCategories: (params = {}, options = {}) => apiClient.get('/part-categories', { params, ...options }),
  getPartCategoryById: (id, options = {}) => apiClient.get(`/part-categories/${id}`, options),
  createPartCategory: (data) => apiClient.post('/part-categories', data),
  updatePartCategory: (id, data) => apiClient.patch(`/part-categories/${id}`, data),
  updatePartCategoryStatus: (id, status) => apiClient.patch(`/part-categories/${id}/status`, { status }),

  // Part CRUD Endpoints
  getParts: (params = {}, options = {}) => apiClient.get('/parts', { params, ...options }),
  getPartById: (id, options = {}) => apiClient.get(`/parts/${id}`, options),
  createPart: (data) =>
    data instanceof FormData
      ? apiClient.post('/parts', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.post('/parts', data),
  updatePart: (id, data) =>
    data instanceof FormData
      ? apiClient.patch(`/parts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.patch(`/parts/${id}`, data),
  deletePartImage: (id) => apiClient.delete(`/parts/${id}/image`),
  updatePartStatus: (id, status) => apiClient.patch(`/parts/${id}/status`, { status }),

  // Stock Operations Endpoints
  stockIn: (id, quantity) => apiClient.post(`/parts/${id}/stock-in`, { quantity: Number(quantity) }),
  stockOut: (id, quantity) => apiClient.post(`/parts/${id}/stock-out`, { quantity: Number(quantity) }),
  stockAdjustment: (id, newQuantity, reason) =>
    apiClient.post(`/parts/${id}/stock-adjustment`, {
      newQuantity: Number(newQuantity),
      reason,
    }),
  getInventoryHistory: (id, params = {}, options = {}) => apiClient.get(`/parts/${id}/inventory-history`, { params, ...options }),

  // Reports & Summary Endpoints
  getLowStock: (params = {}, options = {}) => apiClient.get('/inventory/low-stock', { params, ...options }),
  getOutOfStock: (params = {}, options = {}) => apiClient.get('/inventory/out-of-stock', { params, ...options }),
  getInventorySummary: (options = {}) => apiClient.get('/inventory/summary', options),
};

export default partsService;
