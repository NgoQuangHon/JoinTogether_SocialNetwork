import api from './api';

import type { CreateReportRequest } from '../types/report';

export const getViolationTypes = () => {
    return api.get('/reports/violation-types');
};

export const createReport = (data: CreateReportRequest) => {
    return api.post('/reports', data);
};

export const getReports = () => {
    return api.get('/reports');
};

export const getReportById = (id: number) => {
    return api.get(`/reports/${id}`);
};
