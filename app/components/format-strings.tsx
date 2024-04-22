import { CopyButton } from './copy-button';

export function shortenHex(hex: string, copyable?: boolean) {
  if (!hex) return null;
  const shortened =  hex.slice(0, 7) + '...' + hex.slice(-5);

  return (
    <div className="flex flex-row">
      <span title={hex}>{shortened}</span>
      {copyable && <CopyButton str={hex} />}
    </div>
  );
}
