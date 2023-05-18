import net from "net";

function isPortOpen(ip, port, callback) {
  const socket = new net.Socket();
  socket.setTimeout(10); // 10 mili-seconds
  socket.on("connect", function () {
    socket.destroy();
    callback(null, true);
  });
  socket.on("timeout", function () {
    socket.destroy();
    callback(new Error("Connection timed out"), false);
  });
  socket.on("error", function (err) {
    socket.destroy();
    callback(err, false);
  });
  socket.connect(port, ip);
}

// Example usage:
export function checkPort(host, port) {
  return new Promise((resolve, reject) => {
    isPortOpen(host, port, function (err, isOpen) {
      if (err) {
        reject(false);
      } else {
        resolve(isOpen);
      }
    });
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
      if (data.filter((v) => v === true).length === shouldOpenPorts.length) {
        deviceIps.push(host);
      }
    } catch (error) {}
  }
  console.log(`Found ${deviceIps.length} open ports: ${shouldOpenPorts}.`);
  return deviceIps;
}
