import { useEffect } from 'react';
import './App.css';
import { InputForm } from './components/InputForm';
import { TrackingResult } from './components/TrackingResult';
import { CopyLinkButton } from './components/CopyLinkButton';
import { ThemeToggle } from './components/ThemeToggle';
import { useTracking } from './hooks/useTracking';
import parseParams from './utils/parseParams';
import { Package2 } from 'lucide-react';

function App() {
  const { trackingData, loading, error, trackPackage, lastAwb, lastCourier } =
    useTracking();

  // Auto-track on mount if URL parameters are present (public mode)
  useEffect(() => {
    const params = parseParams();
    if (params.courier && params.noresi) {
      trackPackage(params.noresi, params.courier);
    }
  }, [trackPackage]);

  const handleTrack = (awb: string, courier: string) => {
    trackPackage(awb, courier);
  };

  return (
    <div className='app'>
      <header className='app-header'>
        <div className='header-content'>
          <h1>
            <Package2 size={32} />
            Track Resi
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className='app-main'>
        <div className='container'>
          <InputForm
            onSubmit={handleTrack}
            loading={loading}
            initialAwb={lastAwb}
            initialCourier={lastCourier}
          />

          <TrackingResult data={trackingData} loading={loading} error={error} />

          {trackingData && !loading && !error && (
            <div className='app-footer'>
              <CopyLinkButton
                awb={trackingData.awb}
                courier={trackingData.courier}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
