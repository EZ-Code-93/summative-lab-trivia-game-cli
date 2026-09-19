#!/usr/bin/env node 

import { program } from "commander"; 
import result from "../src/lib/testResult.js";
import triviaDB from "../src/lib/triviaDB.js"; 
import { showMainMenu } from "../src/lib/gameLogic.js"; 

await showMainMenu(result); 
await showMainMenu(triviaDB);
program.parse(process.argv);
