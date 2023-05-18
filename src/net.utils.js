import { createServer } from "net";

export function checkPort(host, port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on("error", () => {
      resolve(false);
    });
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port, host);
  });
}

export async function scanLocalNetwork(ipRange) {
  console.log(`Scanning local network ${ipRange}...`);
  const shouldOpenPorts = [80, 554, 37777];
  const deviceIps = [];
  for (let i = 1; i <= 255; i++) {
    const host = `${ipRange}${i}`;
    try {
      const data = await Promise.all(
        shouldOpenPorts.map((port) => checkPort(host, port))
      );
      if (data.filter(v === true).length === shouldOpenPorts.length) {
        deviceIps.push(host);
      }
    } catch (error) {}
  }
  console.log(`Found ${deviceIps.length} open ports: ${shouldOpenPorts}.`);
  return deviceIps;
}
