import { useGaneStore } from '../store/navStore';

export const useGaneState = () => {
  const { nav, isNavigating } = useGaneStore();
  
  return {
    vehicleState: nav,
    activeRoute: isNavigating ? { path: [] } : null,
    events: [],
    temporalGrid: [],
    v2xPeers: []
  };
};
