import ApiService from '../services/apiService';
import axios from 'axios';
import config from '../services/configService';

// Get Order Table Data
export function getTableData(params: any) {
  return ApiService.get('/order', '', params);
}
// Get Order Table Data
export function getSingleOrderData(params: any) {
  return ApiService.get('/order', params);
}
// Add shipment Data
export function addShipmentData(params: any) {
  return ApiService.post('/shipment', params);
}

export function getShipmentData(id: any) {
  return ApiService.get(`/order/get_shipment/${id}`);
}
// Get shipment all rates by address
export function getAllRatesByAddress(params: any) {
  return ApiService.patch('/shipment/rate_update_new_shipment', params);
}
// Get shipment all rates
export async function getAllRates(params: any) {
  try {
    const rates = await ApiService.get('/shipment/allrates', params);

    //Temporary solution to missing tag which is inconsistent and not easy to reproduce and fix on the BE side
    if (Array.isArray(rates.data) && rates.data.length > 1) {
      if (rates.data[0].tag != 'late' && rates.data[0].courier != 'USPS') {
        rates.data[0].tag = 'cheapest';
      }
      if (rates.data[1].tag != 'late' && rates.data[1].courier != 'USPS') {
        rates.data[1].tag = 'cheaper';
      }
    }

    return rates;
  } catch (error) {
    console.error('Error fetching rates:', error);
    throw error;
  }
}

// Get Order Table shipping_account/
export function getShippingAccountData() {
  return ApiService.get('/shipping_account');
}
// Get Analytics Bar Data
export function getAnalyticsData() {
  return ApiService.get('/order/status');
}
// Get Analytics Bar Data
export function getMarketPlaceDropdown() {
  const params: any = {
    enabled: true,
  };
  return ApiService.get('/market', '', params);
}

// Get Shipping Service
export function getShippingServices() {
  return ApiService.get('/shipping_account');
}

// Get updated Rate
let updateRateController: AbortController | null = null;
export function getUpdatedRate(params: any) {
  if (updateRateController) {
    updateRateController.abort();
    updateRateController = null;
  }

  const [resp, controller] = ApiService.patchWithAbort(`/shipment/rate_update`, params);
  updateRateController = controller;

  return resp;
}

export function getUpdateCharges(params: any) {
  return ApiService.patch(`/shipment`, params);
}

export function getGenerateLabel(params: any) {
  return ApiService.patch('/shipment/generate_labels', params);
}

export function getGenerateLabelForNewShipment(params: any) {
  return ApiService.patch(`/shipment/generate_labels_new_shipment`, params);
}

export function printLabel(label: any) {
  const labelApiUrl = config.VITE_APP_LABEL_API_URL;
  return axios.post(`${labelApiUrl}`, label);
}

export function syncAllMarketPlaces() {
  return ApiService.get(`/market/sync_all`);
}

export function syncMarketPlaceById(id: number) {
  return ApiService.get(`/market/sync/${id}`);
}

export function voidLabel(shipmentId: any) {
  return ApiService.patch(`/shipment/${shipmentId}/void_label`);
}

export function createOrder(id: any, isreturn?: boolean) {
  return ApiService.post(`/order${id ? `?id=${id}` : ''}${id && isreturn ? '&isReturn=true' : ''}`);
}
export function updateShipment(params: any) {
  return ApiService.patch('/shipment', params);
}

export function addressValidate(params: any) {
  return ApiService.post('/pii/validate-address', params);
}

export function updatePII(params: any) {
  return ApiService.patch('/pii', params);
}

export function createPII(params: any) {
  return ApiService.post('pii/for-shipment', params);
}

let fetchAddressListController: AbortController | null = null;
export function fetchAddressList(params: any) {
  fetchAddressListController?.abort();

  const [res, controller] = ApiService.getWithAbort(`/pii/auto-complete?address=${params}`);
  fetchAddressListController = controller;
  return res;
}

export function createNewShipperAddress(params: any) {
  return ApiService.post('shippingaccountaddress', params);
}

export function updateShipperAddress(params: any) {
  return ApiService.patch('shippingaccountaddress', params);
}
