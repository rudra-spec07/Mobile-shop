import apiClient from './api';

/**
 * Parts & Inventory API Service
 */
export const partsService = {
  // Part Category Endpoints
  getPartCategories: (params = {}) => apiClient.get('/part-categories', { params }),
  getPartCategoryById: (id) => apiClient.get(`/part-categories/${id}`),
  createPartCategory: (data) => apiClient.post('/part-categories', data),
  updatePartCategory: (id, data) => apiClient.patch(`/part-categories/${id}`, data),
  updatePartCategoryStatus: (id, status) => apiClient.patch(`/part-categories/${id}/status`, { status }),

  // Part CRUD Endpoints
  getParts: (params = {}) => apiClient.get('/parts', { params }),
  getPartById: (id) => apiClient.get(`/parts/${id}`),
  createPart: (data) => apiClient.post('/parts', data),
  updatePart: (id, data) => apiClient.patch(`/parts/${id}`, data),
  updatePartStatus: (id, status) => apiClient.patch(`/parts/${id}/status`, { status }),

  // Stock Operations Endpoints
  stockIn: (id, quantity) => apiClient.post(`/parts/${id}/stock-in`, { quantity: Number(quantity) }),
  stockOut: (id, quantity) => apiClient.post(`/parts/${id}/stock-out`, { quantity: Number(quantity) }),
  stockAdjustment: (id, newQuantity, reason) =>
    apiClient.post(`/parts/${id}/stock-adjustment`, {
      newQuantity: Number(newQuantity),
      reason,
    }),
  getInventoryHistory: (id, params = {}) => apiClient.get(`/parts/${id}/inventory-history`, { params }),

  // Reports & Summary Endpoints
  getLowStock: (params = {}) => apiClient.get('/inventory/low-stock', { params }),
  getOutOfStock: (params = {}) => apiClient.get('/inventory/out-of-stock', { params }),
  getInventorySummary: () => apiClient.get('/inventory/summary'),
};

export default partsService;
