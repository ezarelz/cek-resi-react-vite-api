import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search } from 'lucide-react';

interface InputFormProps {
  onSubmit: (awb: string, courier: string) => void;
  loading: boolean;
  initialAwb?: string;
  initialCourier?: string;
}

const COURIERS = [
  { code: 'jne', name: 'JNE' },
  { code: 'jnt', name: 'J&T Express' },
  { code: 'spx', name: 'Shopee Express' },
  { code: 'sicepat', name: 'Sicepat Express' },
  { code: 'pos', name: 'POS Indonesia' },
  { code: 'anteraja', name: 'Anteraja' },
  { code: 'ninja', name: 'Ninja Express' },
  { code: 'lion', name: 'Lion Parcel' },
  { code: 'sap', name: 'SAP Express' },
  { code: 'ide', name: 'ID Express' },
  { code: 'wahana', name: 'Wahana' },
  { code: 'lex', name: 'Lazada Express' },
  { code: 'tiki', name: 'Tiki' },
];

export function InputForm({
  onSubmit,
  loading,
  initialAwb = '',
  initialCourier = '',
}: InputFormProps) {
  const [awb, setAwb] = useState(initialAwb);
  const [courier, setCourier] = useState(initialCourier);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (awb.trim() && courier) {
      onSubmit(awb.trim(), courier);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='tracking-form'>
      <div className='form-group'>
        <label htmlFor='awb'>Tracking Number (AWB/Resi)</label>
        <input
          id='awb'
          type='text'
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          placeholder='Enter tracking number'
          disabled={loading}
          required
        />
      </div>

      <div className='form-group'>
        <label htmlFor='courier'>Courier</label>
        <select
          id='courier'
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          disabled={loading}
          required
        >
          <option value=''>Select courier</option>
          {COURIERS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type='submit'
        disabled={loading || !awb.trim() || !courier}
        className='submit-btn'
      >
        <Search size={20} />
        {loading ? 'Tracking...' : 'Track Package'}
      </button>
    </form>
  );
}
