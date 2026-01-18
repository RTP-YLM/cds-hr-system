import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Holiday {
    id: number;
    date: string;
    name: string;
    holiday_type: string;
    is_paid: boolean;
}

export const holidayService = {
    getHolidays: async (year?: number) => {
        const response = await axios.get(`${API_URL}/holidays`, {
            params: { year }
        });
        return response.data;
    },

    createHoliday: async (data: Omit<Holiday, 'id'>) => {
        const response = await axios.post(`${API_URL}/holidays`, data);
        return response.data;
    },

    updateHoliday: async (id: number, data: Partial<Holiday>) => {
        const response = await axios.put(`${API_URL}/holidays/${id}`, data);
        return response.data;
    },

    deleteHoliday: async (id: number) => {
        const response = await axios.delete(`${API_URL}/holidays/${id}`);
        return response.data;
    },

    getCalendarPreview: async (year: number) => {
        const response = await axios.get(`${API_URL}/holidays/preview`, { params: { year } });
        return response.data;
    }
};
