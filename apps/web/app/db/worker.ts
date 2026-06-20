// FIXME: not using that now?
import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init() {
    return new PGlite("idb://kei-db");
  },
});
