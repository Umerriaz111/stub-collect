import ApiService from '../services/apiService'

export function getPrintingTemplateList(params: any) {
    return ApiService.get(`/labelSpecification`, '', params)
}

export function updatePrintingTemplate(params: any) {
    return ApiService.patch(`/labelSpecification`, params)
}
