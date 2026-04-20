import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { predictQueueWaitTime, predictZoneDensity } from './utils';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const INITIAL_ZONES = {
  gateA: { id: 'gateA', name: 'Gate A', density: 45, status: 'Open' },
  gateB: { id: 'gateB', name: 'Gate B', density: 88, status: 'Busy' },
  gateC: { id: 'gateC', name: 'Gate C', density: 30, status: 'Open' },
  gateD: { id: 'gateD', name: 'Gate D', density: 72, status: 'Busy' },
  gateE: { id: 'gateE', name: 'Gate E', density: 95, status: 'Avoid' },
  gateF: { id: 'gateF', name: 'Gate F', density: 12, status: 'Open' },
  northStand: { id: 'northStand', name: 'North Stand', density: 60, status: 'Open' },
  southStand: { id: 'southStand', name: 'South Stand', density: 82, status: 'Busy' },
  eastBlock: { id: 'eastBlock', name: 'East Block', density: 40, status: 'Open' },
  westBlock: { id: 'westBlock', name: 'West Block', density: 50, status: 'Open' },
};

const INITIAL_QUEUES = {
  gateA_entry: { id: 'gateA_entry', name: 'Gate A Entry', waitTime: 5, status: 'Open', type: 'gate' },
  gateB_entry: { id: 'gateB_entry', name: 'Gate B Entry', waitTime: 25, status: 'Busy', type: 'gate' },
  gateC_entry: { id: 'gateC_entry', name: 'Gate C Entry', waitTime: 2, status: 'Open', type: 'gate' },
  gateD_entry: { id: 'gateD_entry', name: 'Gate D Entry', waitTime: 18, status: 'Busy', type: 'gate' },
  gateE_entry: { id: 'gateE_entry', name: 'Gate E Entry', waitTime: 45, status: 'Avoid', type: 'gate' },
  gateF_entry: { id: 'gateF_entry', name: 'Gate F Entry', waitTime: 1, status: 'Open', type: 'gate' },
  food_north: { id: 'food_north', name: 'North Food Stall', waitTime: 15, status: 'Busy', type: 'food' },
  food_south: { id: 'food_south', name: 'South Food Stall', waitTime: 5, status: 'Open', type: 'food' },
  food_east: { id: 'food_east', name: 'East Food Stall', waitTime: 8, status: 'Open', type: 'food' },
  food_west: { id: 'food_west', name: 'West Food Stall', waitTime: 22, status: 'Busy', type: 'food' },
  restroom_north: { id: 'restroom_north', name: 'North Restrooms', waitTime: 2, status: 'Open', type: 'restroom' },
  restroom_south: { id: 'restroom_south', name: 'South Restrooms', waitTime: 12, status: 'Busy', type: 'restroom' },
};

class FirebaseService {
  constructor() {
    this.zones = { ...INITIAL_ZONES };
    this.queues = { ...INITIAL_QUEUES };
    this.listeners = new Set();
    this.intervalId = null;
    
    const isRealSetup = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('mock-key');

    if (isRealSetup) {
      try {
        const app = initializeApp(firebaseConfig);
        this.db = getDatabase(app);
        getAnalytics(app);
        const auth = getAuth(app);
        signInAnonymously(auth).catch(e => console.warn("Anon Auth warning:", e));
        this.initRealtimeData();
      } catch (err) {
        console.error("Firebase initialization failed, falling back to local simulation.", err);
        this.startLocalSimulation();
      }
    } else {
      console.warn("Using mock Firebase configuration. Continuing with local simulation.");
      this.startLocalSimulation();
    }
  }

  async initRealtimeData() {
    const arenaRef = ref(this.db, 'venue_status/venue_001');
    
    try {
      const snap = await get(arenaRef);
      if (!snap.exists()) {
        await set(arenaRef, { zones: INITIAL_ZONES, queues: INITIAL_QUEUES });
      }
    } catch(err) {
      console.warn("Could not seed initial data. Ensure DB rules are open (.read/.write = true)", err);
    }

    onValue(arenaRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.zones = data.zones || {};
        this.queues = data.queues || {};
        this.notifyListeners();
      }
    });

    // Start pushing simulation data directly to Firebase
    this.startFirebaseSimulationPusher();
  }

  startFirebaseSimulationPusher() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      this.shiftDataMetrics();
      set(ref(this.db, 'venue_status/venue_001'), { zones: this.zones, queues: this.queues }).catch(e => {
        console.error("Failed to push simulation data to Firebase DB.", e);
      });
    }, 8000);
  }

  startLocalSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      this.shiftDataMetrics();
      this.notifyListeners();
    }, 8000);
  }

  shiftDataMetrics() {
    Object.keys(this.zones).forEach(key => {
      let newDensity = predictZoneDensity(this.zones[key].density);
      let status = 'Open';
      if (newDensity >= 85) status = 'Avoid';
      else if (newDensity >= 60) status = 'Busy';
      this.zones[key] = { ...this.zones[key], density: newDensity, status };
    });

    Object.keys(this.queues).forEach(key => {
      let newWaitTime = predictQueueWaitTime(this.queues[key].waitTime);
      let status = 'Open';
      if (newWaitTime >= 30) status = 'Avoid';
      else if (newWaitTime >= 15) status = 'Busy';
      this.queues[key] = { ...this.queues[key], waitTime: newWaitTime, status };
    });
  }

  getSnapshot() {
    return {
      zones: { ...this.zones },
      queues: { ...this.queues }
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(l => l(snapshot));
  }
}

export const dbService = new FirebaseService();
