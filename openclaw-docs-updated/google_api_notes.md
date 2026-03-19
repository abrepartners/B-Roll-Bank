# Google AI Studio Findings

The key ending in ...VIAk is the "Openclaw1" key under the "Openclaw" project.
- Quota tier: FREE TIER — "Set up billing" button shown
- This is likely the key OpenClaw is using for Gemini

The key ending in ...Cx-s (the one Thomas provided) is under "ALYT Social" project.
- Quota tier: Tier 1 (has billing set up)

The key ending in ...gXPM is also labeled "OpenClaw" under "ALYT Social" project.
- Quota tier: Tier 1

PROBLEM: The Openclaw project key (...VIAk) is on FREE TIER with no billing. 
This is almost certainly why "API limit reached" is happening — free tier has very low rate limits.

SOLUTION: Either set up billing on the Openclaw project, or switch OpenClaw to use the ...Cx-s key which is already on Tier 1.
