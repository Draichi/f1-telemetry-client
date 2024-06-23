// import { F1TelemetryClient, constants } from "f1-telemetry-client";
const {
  F1TelemetryClient,
  constants,
} = require("@racehub-io/f1-telemetry-client");
const { PACKETS } = constants;
const fs = require("fs");
const dfd = require("danfojs-node");

/*
 *   'port' is optional, defaults to 20777
 *   'bigintEnabled' is optional, setting it to false makes the parser skip bigint values,
 *                   defaults to true
 *   'forwardAddresses' is optional, it's an array of Address objects to forward unparsed telemetry to. each address object is comprised of a port and an optional ip address
 *                   defaults to undefined
 *   'skipParsing' is optional, setting it to true will make the client not parse and emit content. You can consume telemetry data using forwardAddresses instead.
 *                   defaults to false
 */

let currentLapNumber = 1;
let data = [];
const client = new F1TelemetryClient({ port: 20777 });
// client.on(PACKETS, (data) => {
//   console.log(`\n\n\n ${typeof data} ${data}`)
// })
// !!! key m_frameIdentifier
// client.on(PACKETS.event, console.log);
client.on(PACKETS.motion, (_data) => {
  carMotionData = _data.m_carMotionData[0];
  data.push({
    frame: _data.m_header.m_frameIdentifier,
    X: carMotionData.m_worldPositionX.toFixed(2),
    Y: carMotionData.m_worldPositionY.toFixed(2),
  });
  // console.log(`Frame: ${_data.m_header.m_frameIdentifier}, X: ${carMotionData.m_worldPositionX.toFixed(6)}, Y: ${carMotionData.m_worldPositionY.toFixed(6)}`)
});
// client.on(PACKETS.carSetups, console.log);
client.on(PACKETS.lapData, (_data) => {
  // console.log(`\n\n\n ${typeof PACKETS} ${Object.keys(PACKETS)}`)
  // console.log(stream)
  //  stream.m_lapData[0]);

  let lapData = _data.m_lapData[0];
  // console.log(
  //   `\nNew lap: ${stream.m_lapData[0].m_currentLapNum} | last lap: ${currentLapNumber}`
  // );

  data.push({
    frame: _data.m_header.m_frameIdentifier,
    distance: lapData.m_lapDistance.toFixed(2),
  });
  // df.append(
  //   {
  //     // frame: _data.m_header.m_frameIdentifier,
  //     distance: lapData.m_lapDistance.toFixed(6),
  //   },
  //   [_data.m_header.m_frameIdentifier]
  // );
  if (currentLapNumber == _data.m_lapData[0].m_currentLapNum) {
    return;
  }
  // df = new dfd.DataFrame(data);
  fs.writeFileSync(
    `./data/lap-${currentLapNumber}-position.json`,
    JSON.stringify(data),
    "utf8"
  );
  currentLapNumber = lapData.m_currentLapNum;
  lastLapTimeInMS = lapData.m_lastLapTimeInMS;
  // console.log(`\nNew lap: ${currentLapNumber}`)

  //   console.log(`Lap number: ${currentLapNumber}`);
  //   console.log(brakeTemperatures);
  //   fs.writeFileSync(
  //     `./data/brake-temperature-${currentLapNumber}.json`,
  //     JSON.stringify(brakeTemperatures),
  //     "utf8"
  //   );
  //   //     // console.log(`\nNew Lap: ${currentLapNumber}`);
  //   //     lapData = { lapDistance: [], speed: [], lapTime: "" };
  // }
  //   lapData["lapDistance"].push(
  //     parseFloat(stream.m_lapData[0].m_lapDistance).toFixed(3)
  //   );
  //   // console.log(`\m_lapDistance: ${stream.m_lapData[0].m_lapDistance}`);
});
// client.on(PACKETS.session, console.log);
// client.on(PACKETS.participants, console.log);
client.on(PACKETS.carTelemetry, (stream) => {
  const foo = stream.m_carTelemetryData;
  const header = stream.m_header;
  // console.log(header);
  // console.log(foo[0]);
  // lapData["speed"].push(foo[0].m_speed);
  // console.log(`Brakes Temperature: ${foo[0].m_brakesTemperature[0]}`);
  // brakeTemperatures.push({
  //   time: header.m_sessionTime.toFixed(1),
  //   temperature: foo[0].m_brakesTemperature[0],
  // });
  // console.log(brakeTemperatures);
  // if (currentLapNumber != stream.m_lapData[0].m_currentLapNum) {
  //       lapData["lapTime"] = stream.m_lapData[0].m_lastLapTimeInMS;
  //       fs.writeFileSync(
  //         `./data/lap-${currentLapNumber}.json`,
  //         JSON.stringify(lapData),
  //         "utf8"
  //       );

  //       currentLapNumber = stream.m_lapData[0].m_currentLapNum;
  //       // console.log(`\nNew Lap: ${currentLapNumber}`);
  //       lapData = { lapDistance: [], speed: [], lapTime: "" };
  //     }

  //   foo.forEach((item) => {
  //     console.log(item);
  //   });
  //   console.log(stream.m_carTelemetryData.m_throttle);
  //   console.log(stream.m_carTelemetryData.m_engineRPM);
  //   client.stop();
});
// client.on(PACKETS.carStatus, console.log);
// client.on(PACKETS.finalClassification, console.log);
// client.on(PACKETS.lobbyInfo, console.log);
// client.on(PACKETS.carDamage, console.log);
// client.on(PACKETS.sessionHistory, console.log);
// client.on(PACKETS.tyreSets, console.log);
// client.on(PACKETS.motionEx, console.log);

// to start listening:
client.start();

// and when you want to stop:
// client.stop();
