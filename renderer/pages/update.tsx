import React from "react";
import styles from "../styles/update.module.css";

export default function Update() {
  const [receivedBytes, setReceivedBytes] = React.useState(0);
  const [totalBytes, setTotalBytes] = React.useState(0);

  const formatBytes = (a, b = 2, k = 1024) => {
    let d = Math.floor(Math.log(a) / Math.log(k));
    return 0 == a
      ? "0 Bytes"
      : parseFloat((a / Math.pow(k, d)).toFixed(Math.max(0, b))) +
          " " +
          ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
  };

  React.useEffect(() => {
    global.ipcRenderer.addListener("received_bytes", (_event, message) => {
      setReceivedBytes(message);
    });
    global.ipcRenderer.addListener("total_bytes", (_event, message) => {
      setTotalBytes(message);
    });
  }, []);

  return (
    <main className={styles.main}>
      <img
        width="150"
        height="150"
        src="icons/512.png"
        style={{
          borderRadius: 30,
          boxShadow: "0px 5px 5px 5px rgba(0, 0, 0, 20%)",
        }}
      />
      {receivedBytes !== 0 ? (
        <>
          <div
            style={{
              marginTop: 20,
              marginBottom: 0,
              height: 10,
              width: 130,
              backgroundColor: "#292929ff",
              borderRadius: "5px",
              boxShadow: "0px 0px 1px 2px rgba(0, 0, 0, 20%)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#00a727ff",
                transition: "width 0.5s linear",
                width: `${(receivedBytes / totalBytes) * 100}%`,
              }}
            />
          </div>
          <div style={{ width: 200, height: 10, textAlign: "center" }}>
            <h5 style={{ color: "#444444ff", marginTop: 5 }}>
              {`${formatBytes(receivedBytes)} / ${formatBytes(totalBytes)}`}
            </h5>
          </div>
        </>
      ) : undefined}
      <h3 style={{ position: "absolute", bottom: 20, color: "#b4b4b4ff" }}>
        {receivedBytes !== 0
          ? receivedBytes == totalBytes
            ? "Starting..."
            : "Installing..."
          : "Checking for updates..."}
      </h3>
    </main>
  );
}
