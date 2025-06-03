import ApiService from '../services/apiService';

export function createAuthStateGenerator(data: { source: string; }) {
    return ApiService.post('/authStateGenerator', data);
}