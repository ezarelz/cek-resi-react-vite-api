export interface TrackingParams {
  courier: string | null;
  noresi: string | null;
}

export default function parseParams(): TrackingParams {
  const params = new URLSearchParams(window.location.search);

  return {
    courier: params.get('courier'),
    noresi: params.get('noresi'),
  };
}
