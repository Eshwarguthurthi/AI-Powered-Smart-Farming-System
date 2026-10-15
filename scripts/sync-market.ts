// Downloads the open AGMARKNET archive and rebuilds data/market/ (see server/marketSnapshot.ts).
//   npm run market:sync
import { syncSnapshot } from "../server/marketSnapshot";

const meta = await syncSnapshot(true);
if (!meta) {
  console.error("Market archive could not be built.");
  process.exit(1);
}
console.log(meta);
