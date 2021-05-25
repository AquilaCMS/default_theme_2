import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// GET API key for Google Maps 
export const getAPIKeyGMaps = async () => {
    try {
        const response = await axios.get('pointOfSale/getKey');
        return response.data.api_key_google_map;
    } catch(err) {
        console.error('pointsOfSale.getAPIKeyGMaps');
        throw new Error(err?.response?.data?.message);
    }
};

// GET points of sale
export const getPointsOfSale = async () => {
    try {
        const response = await axios.get('pointsOfSale/populate');
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.getPointsOfSale');
        throw new Error(err?.response?.data?.message);
    }
};

// GET point of sale corresponding to an address
export const getPointOfSaleForDelivery = async (address) => {
    try {
        const response = await axios.post('pointsOfSale/findForDelivery', address);
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.getPointOfSaleForDelivery');
        throw new Error(err?.response?.data?.message);
    }
};

// Submit point of sale
export const setPointOfSale = async (body) => {
    try {
        const response = await axios.put('pointOfSale/orderReceipt', body);
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.setPointOfSale');
        throw new Error(err?.response?.data?.message);
    }
};