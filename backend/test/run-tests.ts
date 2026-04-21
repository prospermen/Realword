import { runTests } from './app.test';
import { setupTestServer, teardownTestServer } from './helpers';

async function main() {
  await setupTestServer();

  try {
    await runTests();
    console.log('All backend integration tests passed.');
  } finally {
    await teardownTestServer();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
