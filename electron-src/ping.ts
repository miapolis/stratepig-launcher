import tcp from "tcp-ping";
import { SERVER_IP } from "./secrets";

interface PingResult {
  alive: boolean;
  time?: number;
}

const pingFn = async (): Promise<PingResult> => {
  return new Promise<PingResult>((resolve, _reject) => {
    tcp.ping({ address: SERVER_IP, port: 32500, attempts: 1 }, (_err, res) => {
      const alive = res.max !== undefined || res.min !== undefined;
      resolve({
        alive: alive,
        time: alive ? res.avg : undefined,
      });
    });
  });
};

export default pingFn;
