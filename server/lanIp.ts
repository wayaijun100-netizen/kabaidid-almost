import os from 'os';

/**
 * Automatically detects the host machine's primary IPv4 LAN address
 * (e.g. 192.168.x.x, 10.x.x.x, or 172.16-31.x.x)
 */
export function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  const lanAddresses: string[] = [];
  const otherAddresses: string[] = [];

  for (const interfaceName of Object.keys(interfaces)) {
    const addresses = interfaces[interfaceName];
    if (!addresses) continue;

    for (const iface of addresses) {
      // Ignore IPv6 and internal loopback addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        const addr = iface.address;
        // Prioritize standard private LAN IP blocks
        if (
          addr.startsWith('192.168.') ||
          addr.startsWith('10.') ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr)
        ) {
          lanAddresses.push(addr);
        } else {
          otherAddresses.push(addr);
        }
      }
    }
  }

  if (lanAddresses.length > 0) {
    return lanAddresses[0];
  }
  if (otherAddresses.length > 0) {
    return otherAddresses[0];
  }

  return '127.0.0.1';
}
