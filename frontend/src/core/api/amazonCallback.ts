import ApiService from '../services/apiService';

export function postAmazonCallback(data: { authCode: string; state: string }) {
    return ApiService.post('/market/register-callback/amazon', data);
  }