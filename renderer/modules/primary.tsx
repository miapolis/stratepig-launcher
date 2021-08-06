import React from "react";
import styles from "./primary.module.css";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import HourglassEmptyRoundedIcon from "@material-ui/icons/HourglassEmptyRounded";
import FiberManualRecordRoundedIcon from "@material-ui/icons/FiberManualRecordRounded";

type ButtonState = "loading" | "play" | "update" | "updating";

const GRADIENTS: Map<ButtonState, string[]> = new Map()
  .set("play", ["00b712ee", "5aff15ff"])
  .set("update", ["0072ffee", "00c6ffff"])
  .set("updating", ["0072ffee", "00c6ffff"])
  .set("loading", ["414345ee", "232526ff"]);

const Primary: React.FC = () => {
  const [buttonState, setButtonState] = React.useState<ButtonState>("loading");
  const [pingData, setPingData] = React.useState(undefined);
  const [receivedBytes, setReceivedBytes] = React.useState(undefined);
  const [totalBytes, setTotalBytes] = React.useState(undefined);

  React.useEffect(() => {
    global.ipcRenderer.addListener("server_ping", (_event, message) => {
      setPingData(message);
    });
    global.ipcRenderer.addListener("updateFound", (_event, found) => {
      if (found) {
        setButtonState("update");
      } else {
        setButtonState("play");
      }
    });
    global.ipcRenderer.addListener("game_received_bytes", (_event, bytes) => {
      if (buttonState !== "updating") {
        setButtonState("updating");
      }
      setReceivedBytes(bytes);
    });
    global.ipcRenderer.addListener("game_total_bytes", (_event, bytes) => {
      setTotalBytes(bytes);
    });
    global.ipcRenderer.addListener("download_completed", (_event, _data) => {
      setButtonState("play");
    });

    setTimeout(() => {
      global.ipcRenderer.send("checkForUpdates");
    }, 1500);
  }, []);

  const mainButtonClick = () => {
    switch (buttonState) {
      case "update": {
        global.ipcRenderer.send("downloadLatest");
        break;
      }
      case "play": {
        global.ipcRenderer.send("startGame");
        break;
      }
    }
  };

  return (
    <div className={styles.primary}>
      <div className={styles.primaryInner}>
        <div className={styles.headerArea}>
          <h4>
            STRATEPIG <b>v0.7.1</b>
          </h4>
        </div>
        <div className={styles.coverArea}>
          <img src="https://stratepig.com/assets/images/Stratepig%20Playback.png" />
          <div className={styles.overlay}>
            <div className={styles.mainButtonContainer}>
              <div
                className={styles.mainButton}
                style={{
                  backgroundImage: `linear-gradient(85deg, #${
                    GRADIENTS.get(buttonState)[0]
                  }, #${GRADIENTS.get(buttonState)[1]})`,
                }}
                onClick={mainButtonClick}
              >
                {buttonState === "update" || buttonState === "updating" ? (
                  <>
                    <GetAppRoundedIcon
                      style={{ color: "white", width: "40px", height: "40px" }}
                    />
                    <h1>
                      {buttonState === "update" ? "UPDATE" : "UPDATING..."}
                    </h1>
                    {buttonState === "updating" &&
                    receivedBytes !== undefined ? (
                      <div
                        className={styles.progressOverlay}
                        style={{
                          width: `${(receivedBytes / totalBytes) * 100}%`,
                        }}
                      />
                    ) : undefined}
                  </>
                ) : buttonState === "loading" ? (
                  <>
                    <HourglassEmptyRoundedIcon
                      style={{ color: "white", width: "40px", height: "40px" }}
                    />
                    <h1>LOADING...</h1>
                  </>
                ) : (
                  <>
                    <PlayArrowRoundedIcon
                      style={{ color: "white", width: "40px", height: "40px" }}
                    />
                    <h1>PLAY</h1>
                  </>
                )}
              </div>
            </div>
            <div className={styles.statusBar}>
              {pingData ? (
                <>
                  <h3>Server: </h3>
                  <FiberManualRecordRoundedIcon
                    style={
                      pingData[0] === true
                        ? { color: "#5aff15ff" }
                        : { color: "#bbbbbb" }
                    }
                  />
                  <h3>
                    <b>{pingData[0] === true ? `ONLINE` : `OFFLINE`}</b>
                  </h3>
                  {pingData[0] === true ? (
                    <h3 style={{ marginLeft: 5, fontSize: 15 }}>{`${Math.round(
                      pingData[1]
                    )}ms`}</h3>
                  ) : undefined}
                </>
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Primary;
