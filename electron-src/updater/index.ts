import http from "http";
import fs from "fs";
import fetch from "node-fetch";
import AdmZip from "adm-zip";

import { UPDATE_SERVER_URL } from "../secrets";
import { Version } from "./version";

export const checkForUpdate = async (
  current: string,
  game = false
): Promise<boolean> => {
  const versionStr = await (
    await fetch(`${UPDATE_SERVER_URL}/${game ? "game" : "launcher"}/version`)
  ).text();
  const version = Version.fromString(versionStr);
  return version.isDifferentThan(Version.fromString(current));
};

export const downloadLatest = async (
  progressCallback: (total: number, received: number) => void,
  game = false
): Promise<void> => {
  return new Promise<void>((resolve, _reject) => {
    if (!game) {
      if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
      }
    } else {
      if (!fs.existsSync("./game/temp")) {
        fs.mkdirSync("./game/temp");
      }
    }
    const file = fs.createWriteStream(
      !game ? "./temp/launcher.zip" : "./game/temp/build.zip"
    );

    let total_bytes = 0;
    let received_bytes = 0;
    let interval: NodeJS.Timeout;

    http
      .get(`${UPDATE_SERVER_URL}/${!game ? "launcher" : "game"}/d`, (res) => {
        res.pipe(file);
        file.on("finish", () => {
          file.close();

          // Signal that download is completed if there are discrepancies
          progressCallback(total_bytes, total_bytes);

          clearInterval(interval);
          resolve();
        });
      })
      .on("response", (response) => {
        const index = response.rawHeaders.indexOf("X-Content-Length");
        total_bytes = parseInt(response.rawHeaders[index + 1] || "0");

        response.on("data", (data) => {
          received_bytes += data.length;
        });

        interval = setInterval(async () => {
          progressCallback(total_bytes, received_bytes);
        }, 300);
      })
      .on("error", (err) => {
        // Handle errors
        fs.unlink(
          !game ? "./temp/launcher.zip" : "./game/temp/build.zip",
          () => {}
        );
        console.log("ERR", err);
        resolve();
      });
  });
};

export const extractGame = () => {
  let zip = new AdmZip("./game/temp/build.zip");
  zip.extractAllTo("./game", true);
  fs.rmdirSync("./game/temp", {recursive: true});
}

export const writeNewGameVersion = async () => {
  const versionStr = await (
    await fetch(`${UPDATE_SERVER_URL}/game/version`)
  ).text();
  fs.writeFileSync("./game/version.txt", versionStr);
}
