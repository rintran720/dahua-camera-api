import { networkInterfaces as _networkInterfaces } from "os";
import { scanLocalNetwork } from "./net.util.js";
import { DahuaCamera } from "./DahuaCamera.js";

/**
 * Depend on OS:
 * "en0": on MACOS
 * "乙太網路": on this PC (window)
 * */
const ETHERNET = "乙太網路";

export function scanOpeningPortInNetwork() {
  const networkInterfaces = _networkInterfaces();
  //console.log(networkInterfaces);
  const ipv4Interfaces = networkInterfaces[ETHERNET]?.filter(
    ({ family }) => family === "IPv4"
  );
  // above code only works on windows machine change the interface name based on machine.

  if (ipv4Interfaces?.length > 0) {
    const ipv4Address = ipv4Interfaces[0]?.address;
    const ipRange = ipv4Address?.replace(/(\d+)(\.\d+$)/, "$1.");
    return scanLocalNetwork(ipRange);
  } else {
    console.error("No IPv4 network interfaces found.");
  }
}

export async function scanDevice(username, password) {
  try {
    const devices = await scanOpeningPortInNetwork();
    const connectedDevices = [];
    for (const idx in devices) {
      try {
        const cam = new DahuaCamera(devices[idx], username, password);
        await cam.getNetworkSync();
        connectedDevices.push(devices[idx]);
      } catch (error) {
        console.error(error);
      }
    }
    return connectedDevices;
  } catch (error) {
    console.error(error);
  }
}
