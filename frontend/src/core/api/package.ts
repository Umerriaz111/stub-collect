import ApiService from '../services/apiService'

export function createPackageByShipmentId(shipmentId: string, count: number, payload: Record<string, string | number>) {
    return ApiService.post(`/package/by-shipment/${shipmentId}/${count}`, payload)
}

export function clonePackage(payload: Record<string, string | number>) {
    return ApiService.post(`/package/clone`,payload)
}

export function getPackageById(id: string) {
    return ApiService.get(`/package/${id}`)
}

export function getPackagesByShipmentId(shipmentId: string) {
    return ApiService.get(`/package/by-shipment/${shipmentId}`)
}

export function updatePackage(payload: Record<string, string | number>) {
    return ApiService.patch(`/package`, payload)
}

export function updatePackageByShipmentId(shipmentId: string, payload: Record<string, string | number>) {
    return ApiService.patch(`/package/by-shipment/${shipmentId}`, payload)
}

export function deletePackage(id: string) {
    return ApiService.delete(`/package/${id}`)
}

export function getPackageTypesByCourierId(courierId: string) {
    return ApiService.get(`/courier/packageTypes/${courierId}`)
}
