import { AppProvider } from './context/AppContext';
import { PhoneEmulator } from './components/PhoneEmulator';
import { SimulationControlPanel } from './components/SimulationControlPanel';

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        
        {/* Mobile Device Emulator Column */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1.2' }}>
          <PhoneEmulator />
        </div>

        {/* Simulation Control panel Column */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1' }}>
          <SimulationControlPanel />
        </div>

      </div>
    </AppProvider>
  );
}

export default App;
