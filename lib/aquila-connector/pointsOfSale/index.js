import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

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