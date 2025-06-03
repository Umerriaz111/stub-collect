import ApiService from '../services/apiService';

export function getChangeHistoryByOrder(id: any) {
    return ApiService.get(`/changeHistory/by-order/${id}`);
  }