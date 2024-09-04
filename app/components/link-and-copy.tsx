import Link from 'next/link';
import { CopyButton } from 'components';

export function LinkAndCopy({url, path, hex}: {url?: string, path: string, hex?: string}) {
  if (!hex) {
    return <p className="font-mono animate-pulse">...</p>;
  }

  hex = hex.toLowerCase();
  if (hex[0] != '0' || hex[1] != 'x') {
    let split = hex.split('.');
    if (split.length > 0) {
      hex = split.pop();
    }
    hex = '0x' + hex;
  }

  return (
    <div className="whitespace-nowrap flex flex-row">
      <Link href={url + path + '/' + hex} target="_blank"
        className="text-light-blue dark:text-light-blue font-mono text-[17px]/[24px] hover:underline underline-offset-2">
        {hex}
      </Link>
      <CopyButton str={hex} />
    </div>
  );
}
