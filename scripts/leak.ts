import { Telemetry } from '../test/lib/telemetry';

const objects: any = [];

const generateTelemetryEvent = () => {
  return {
    name: 'my-event',
    properties: {
      foo: 'bar',
      baz: 'qux',
    },
    measurements: {
      duration: 123213,
    },
  };
};

const randomRuns = Math.floor(Math.random() * 100000) + 10000;
console.log(`Randomized runs: ${randomRuns}`);

const run = async (runsLeft = randomRuns): Promise<void> => {
  if (runsLeft <= 0) {
    return console.log(`Finished!`);
  }

  for (let i = 0; i < 1000000; i++) {
    const telemetry = new Telemetry();

    telemetry.trackEvent(generateTelemetryEvent());
    telemetry.trackEvent(generateTelemetryEvent());
    telemetry.trackEvent(generateTelemetryEvent());
    telemetry.trackEvent(generateTelemetryEvent());

    objects.push(telemetry);
  }

  console.log(`Waiting after telemetry generation`, objects.length);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  objects.length = 0;

  console.log(`waiting after telemetry objects cleared`, objects.length);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log(`New run`);
  return run(runsLeft - 1);
};

run()
  .catch(console.error)
  .finally(() => process.exit(0));
