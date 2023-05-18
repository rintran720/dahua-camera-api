import { networkInterfaces as _networkInterfaces } from "os";
import { scanLocalNetwork } from "./net.util.js";

const ETHERNET = "en0"; // depend on OS, "en0" on MACOS
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
