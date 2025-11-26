import {
  Package,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { TrackingData, TrackingHistory } from '../hooks/useTracking';

interface TrackingResultProps {
  data: TrackingData | null;
  loading: boolean;
  error: string | null;
}

export function TrackingResult({ data, loading, error }: TrackingResultProps) {
  if (loading) {
    return (
      <div className='tracking-result loading'>
        <div className='spinner'></div>
        <p>Tracking your package...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='tracking-result error'>
        <AlertCircle size={48} />
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='tracking-result empty'>
        <Package size={64} />
        <h3>Track Your Package</h3>
        <p>Enter your tracking number and select a courier to get started</p>
      </div>
    );
  }

  return (
    <div className='tracking-result'>
      <div className='tracking-header'>
        <div className='tracking-info'>
          <h2>
            <Package size={24} />
            Tracking Details
          </h2>
          <div className='info-grid'>
            <div className='info-item'>
              <span className='label'>AWB Number</span>
              <span className='value'>{data.awb}</span>
            </div>
            <div className='info-item'>
              <span className='label'>Courier</span>
              <span className='value'>{data.courier}</span>
            </div>
            <div className='info-item'>
              <span className='label'>Status</span>
              <span
                className={`status-badge ${data.status
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                <CheckCircle2 size={16} />
                {data.status}
              </span>
            </div>
            {data.receiver && (
              <div className='info-item'>
                <span className='label'>
                  <User size={16} />
                  Receiver
                </span>
                <span className='value'>{data.receiver}</span>
              </div>
            )}
            {data.origin && (
              <div className='info-item'>
                <span className='label'>
                  <MapPin size={16} />
                  Origin
                </span>
                <span className='value'>{data.origin}</span>
              </div>
            )}
            {data.destination && (
              <div className='info-item'>
                <span className='label'>
                  <MapPin size={16} />
                  Destination
                </span>
                <span className='value'>{data.destination}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {data.history && data.history.length > 0 && (
        <div className='tracking-history'>
          <h3>
            <Clock size={20} />
            Tracking History
          </h3>
          <div className='timeline'>
            {data.history.map((item: TrackingHistory, index: number) => (
              <div key={index} className='timeline-item'>
                <div className='timeline-marker'></div>
                <div className='timeline-content'>
                  <div className='timeline-date'>{item.date}</div>
                  <div className='timeline-description'>{item.description}</div>
                  {item.location && (
                    <div className='timeline-location'>{item.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
