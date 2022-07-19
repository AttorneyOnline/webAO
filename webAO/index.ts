console.log("Creating a new client");
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Client, setClient, client, isLowMemory } from "./client";

console.log("Dingo1");

console.log("Dingo2");

import queryParser from "./utils/queryParser";
console.log("Dingo3");

let { ip: serverIP, mode, asset, theme } = queryParser();
console.log("Dingo4");

const fpPromise = FingerprintJS.load();
const createClient = () => {
  console.log("titty");
  fpPromise
    .then((fp) => fp.get())
    .then((result) => {
      // hdid = result.visitorId;
      console.log(" I AM MAKING A NEW CLIENT");
      setClient(new Client(serverIP));
      //   setClient(new Client(serverIP));

      isLowMemory();
      client.loadResources();
    });
};

console.log("Dingo");
createClient();
