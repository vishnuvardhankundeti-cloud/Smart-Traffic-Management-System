import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Vehicle Endpoints
export const getVehicles = (params) => api.get('/vehicles', { params });
export const getVehicle = (id) => api.get(`/vehicles/${id}`);
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Road Endpoints
export const getRoads = (params) => api.get('/roads', { params });
export const getRoad = (id) => api.get(`/roads/${id}`);
export const createRoad = (data) => api.post('/roads', data);
export const updateRoad = (id, data) => api.put(`/roads/${id}`, data);
export const deleteRoad = (id) => api.delete(`/roads/${id}`);
export const getCongestedRoads = () => api.get('/traffic/congested-roads');

// Intersections
export const getIntersections = () => api.get('/intersections');

// Routes (Dijkstra Shortest Path & Optimization)
export const calculateShortestPath = (data) => api.post('/routes/shortest-path', data);
export const optimizeRoute = (data) => api.post('/routes/optimize', data);
export const getRouteHistory = () => api.get('/routes/history');

// Traffic Monitoring
export const getTrafficOverview = () => api.get('/traffic/overview');
export const getTrafficDensity = () => api.get('/traffic/density');
export const getRoadStatusBreakdown = () => api.get('/traffic/road-status');

// Traffic Signals
export const getSignals = () => api.get('/signals');
export const getSignal = (id) => api.get(`/signals/${id}`);
export const createSignal = (data) => api.post('/signals', data);
export const updateSignal = (id, data) => api.put(`/signals/${id}`, data);
export const cycleSignal = (id) => api.post(`/signals/${id}/cycle`);

// Emergency Vehicles & Priority Queue
export const getEmergencyVehicles = () => api.get('/emergency/vehicles');
export const dispatchEmergencyVehicle = (data) => api.post('/emergency/vehicles', data);
export const resolveEmergency = (id) => api.post(`/emergency/${id}/resolve`);
export const getEmergencyPriorityQueue = () => api.get('/emergency/priority-queue');

// Simulation Control
export const getSimulationStatus = () => api.get('/simulation/status');
export const startSimulation = () => api.post('/simulation/start');
export const pauseSimulation = () => api.post('/simulation/pause');
export const resumeSimulation = () => api.post('/simulation/resume');
export const stopSimulation = () => api.post('/simulation/stop');
export const resetSimulation = () => api.post('/simulation/reset');
export const setSimulationSpeed = (multiplier) => api.post(`/simulation/speed/${multiplier}`);
export const getSimulationLogs = (limit = 30) => api.get('/simulation/logs', { params: { limit } });

// Analytics
export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getVehicleDistribution = () => api.get('/analytics/vehicle-distribution');
export const getTrafficDensityTrends = () => api.get('/analytics/traffic-density');
export const getRoadPerformance = () => api.get('/analytics/road-performance');
export const getCongestionBreakdown = () => api.get('/analytics/congestion');

export const getExportVehiclesUrl = () => '/api/analytics/export/vehicles';
export const getExportRoadsUrl = () => '/api/analytics/export/roads';

export default api;
