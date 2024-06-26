import { connect } from 'http2';
import { CopyButton } from './copy-button';

export function shortenHex(hex?: string, copyable?: boolean) {
  if (!hex) return '';
  const shortened =  hex.slice(0, 7) + '...' + hex.slice(-5);

  return (
    <div className="flex flex-row">
      <span title={hex}>{shortened}</span>
      {copyable && <CopyButton str={hex} />}
    </div>
  );
}

export function formatPortId(portId: string) {
  if (!portId) return null;
  const shortened =  portId.slice(0, 18) + '...' + portId.slice(-5);

  return (
    <div className="flex flex-row text-nowrap">
      <span title={portId}>{shortened}</span>
    </div>
  );
}

export function formatConnectionHops(connectionHops: string[]) {
  if (!connectionHops) return null;

  let asString = '';
  connectionHops.forEach((hop, index) => {
    asString += hop;
    if (index < connectionHops.length - 1) {
      asString += ', ';
    }
  });
  return asString;
}
