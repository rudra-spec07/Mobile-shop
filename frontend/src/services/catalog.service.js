import apiClient from './api';

/**
 * Catalog API Service handling Brand, Mobile, and Image API calls
 */
export const catalogService = {
  // Brand Services
  getBrands: (params = {}, options = {}) => apiClient.get('/brands', { params, ...options }),
  getBrandById: (id, options = {}) => apiClient.get(`/brands/${id}`, options),
  createBrand: (data) => apiClient.post('/brands', data),
  updateBrand: (id, data) => apiClient.patch(`/brands/${id}`, data),
  updateBrandStatus: (id, status) => apiClient.patch(`/brands/${id}/status`, { status }),

  // Mobile Services
  getMobiles: (params = {}, options = {}) => apiClient.get('/mobiles', { params, ...options }),
  getFeaturedMobiles: (params = {}, options = {}) => apiClient.get('/mobiles/featured', { params, ...options }),
  getMobileById: (id, options = {}) => apiClient.get(`/mobiles/${id}`, options),
  createMobile: (data) =>
    data instanceof FormData
      ? apiClient.post('/mobiles', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.post('/mobiles', data),
  updateMobile: (id, data) => apiClient.patch(`/mobiles/${id}`, data),
  updateMobileStatus: (id, status) => apiClient.patch(`/mobiles/${id}/status`, { status }),
  updateMobileFeatured: (id, featured) => apiClient.patch(`/mobiles/${id}/featured`, { featured }),

  // Mobile Image Services
  getMobileImages: (mobileId, options = {}) => apiClient.get(`/mobiles/${mobileId}/images`, options),
  addMobileImage: (mobileId, data) =>
    data instanceof FormData
      ? apiClient.post(`/mobiles/${mobileId}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.post(`/mobiles/${mobileId}/images`, data),
  replaceMobileImage: (mobileId, imageId, data) =>
    data instanceof FormData
      ? apiClient.put(`/mobiles/${mobileId}/images/${imageId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.put(`/mobiles/${mobileId}/images/${imageId}`, data),
  setPrimaryImage: (mobileId, imageId) => apiClient.patch(`/mobiles/${mobileId}/images/${imageId}/primary`),
  deleteMobileImage: (mobileId, imageId) => apiClient.delete(`/mobiles/${mobileId}/images/${imageId}`),
  // Global Search & Metadata Services
  globalSearch: (q, limit = 5, options = {}) => apiClient.get('/search', { params: { q, limit }, ...options }),
  getCatalogFilters: (options = {}) => apiClient.get('/catalog/filters', options),
};

export default catalogService;
