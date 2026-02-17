try {
  require("dotenv").config();
} catch (error) {
  // Ignore missing dotenv; environment variables can be supplied by shell.
}

const { generateCarousel, SAMPLE_INPUT } = require("./carouselGenerator");

async function main() {
  try {
    const generated = await generateCarousel(SAMPLE_INPUT, {
      allowMock: true,
      forceMock: process.env.MOCK_MODE === "true",
    });
    const modeDetail =
      generated && typeof generated._generation_mode === "string"
        ? generated._generation_mode
        : "unknown";
    const output = { ...generated };
    delete output._generation_mode;

    console.log(
      JSON.stringify(
        {
          mode_detail: modeDetail,
          output,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Failed to generate carousel.");
    console.error(error.message);
    process.exit(1);
  }
}

main();
