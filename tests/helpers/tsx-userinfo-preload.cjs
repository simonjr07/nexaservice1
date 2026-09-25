// Some restricted Windows test hosts cannot answer os.userInfo(), which tsx
// calls to name its temporary directory before it starts the tested CLI.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require("node:os");

try {
  os.userInfo();
} catch {
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || "test-runner",
    homedir: os.homedir(),
    shell: null,
  });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("node:module").syncBuiltinESMExports();
}
