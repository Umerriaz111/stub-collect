import ApiService from '../services/apiService'

export function getWebStoreList(params: any) {
    return ApiService.get(`/market`, '', params)
}
export function getWebStoreById(params: any) {
    return ApiService.get(`/market`, params)
}

export function addWebStore(params: any) {
    return ApiService.post(`/market`, params)
}

export function updateWebStore(params: any) {
    return ApiService.patch(`/market`, params)
}

export function deleteWebStore(params: any) {
    return ApiService.delete(`/market`, params)
}
