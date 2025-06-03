/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from '../services/apiService';

export function addCarrier(params: any) {
  return ApiService.post(`/shipping_account`, params);
}

export function updateCarrier(params: any) {
  return ApiService.patch(`/shipping_account`, params);
}

export function getCarrierById(params: any) {
  return ApiService.get(`/shipping_account`, params);
}

export function getCarrierList(params: any) {
  return ApiService.get(`/shipping_account`, params);
}

export function deleteCarrier(params: any) {
  return ApiService.delete(`/shipping_account`, params);
}

export function addCarrierPreference(params: any) {
  return ApiService.put('/shippingAccountPreference', params);
}

export function removeCarrierPreference(params: any) {
  return ApiService.delete('/shippingAccountPreference', params);
}

export function getCourierApi(params: any) {
  return ApiService.get('/courier', params);
}

export function addCourierPreferenceApi(params: any) {
  return ApiService.post('/webstoreCourierPreference', params);
}

export function removeCourierPreferenceApi(params: any) {
  return ApiService.delete('/webstoreCourierPreference', params);
}
