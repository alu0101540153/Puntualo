Self-hosted runner setup for Proyecto-E20

This document shows the exact commands to register and run a GitHub Actions self-hosted runner on a Linux machine (x64). The CI workflow in this repo expects a runner with labels: `private-runner,linux,x64` and a running `mongod` on `127.0.0.1:27017`.

Prerequisites on the runner machine
- GitHub account with repository admin access
- `curl`, `tar`, `wget`, `jq` (optional) installed
- `node` and `npm` installed (the runner executes `npm install` / `npm test`)
- `mongod` installed and running locally (or accessible)
- `sudo` privileges to run the runner as a service (optional but recommended)

Overview
1. Create the runner in the GitHub repository UI and copy the one-time token.
2. Download and configure the runner on the machine.
3. (Optional) Install runner as a systemd service so it restarts automatically.
4. Verify the runner appears online in the repository's Actions > Runners page.

Step-by-step commands

# Replace these values with your repo info when running
OWNER=SyTW2526
REPO=Proyecto-E20
# In the GitHub UI: Settings -> Actions -> Runners -> New self-hosted runner -> Linux -> x64
# GitHub will show an URL and a token. Use them below.

# Create a directory for the runner and download it
mkdir -p ~/actions-runner && cd ~/actions-runner
# Copy the download link from the GitHub UI for the latest runner; example below is a template.
# You should copy the URL and version shown on the "Add runner" page.
# Example (replace with the URL your repo shows):
# RUNNER_URL=https://github.com/actions/runner/releases/download/v2.308.0/actions-runner-linux-x64-2.308.0.tar.gz
# Then run:
# curl -o actions-runner.tar.gz -L "$RUNNER_URL"
# For convenience, if you don't want to copy the URL: the script below will attempt to fetch the latest stable release automatically.

RUNNER_DL_URL=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.assets[] | select(.name|test("actions-runner-linux-x64")) | .browser_download_url')
if [ -z "$RUNNER_DL_URL" ]; then
  echo "Failed to resolve runner download URL automatically. Open GitHub repo Actions UI and copy the runner URL manually."
  exit 1
fi
curl -o actions-runner.tar.gz -L "$RUNNER_DL_URL"
tar xzf actions-runner.tar.gz

# Configure the runner (GitHub UI provides the token). Replace <GITHUB_URL> and <TOKEN> with values from GitHub's "Add runner" page.
# Example: ./config.sh --url https://github.com/SyTW2526/Proyecto-E20 --token AAAAAAA --labels private-runner,linux,x64

# IMPORTANT: you must copy the token from the GitHub UI; it is one-time use and expires after a short time.
# Run the config command below, replacing <TOKEN>:
./config.sh --url https://github.com/${OWNER}/${REPO} --token <TOKEN> --labels private-runner,linux,x64

# Start the runner (interactive)
./run.sh &

# Optional: install as a systemd service (recommended)
# This will ensure the runner restarts after reboots. Run these commands as the same user that configured the runner.
sudo ./svc.sh install
sudo ./svc.sh start

# Verify runner is online in GitHub UI: Settings -> Actions -> Runners

# Ensure mongod is running on the runner machine and listening on 127.0.0.1:27017
# If you already have mongod running (system service), skip these steps. Otherwise, example to start:
# sudo systemctl enable mongod
# sudo systemctl start mongod
# Check listening port
ss -ltnp | grep 27017 || nc -zv 127.0.0.1 27017 || echo "mongod not detected on 127.0.0.1:27017"

Notes & troubleshooting
- Tokens: the token shown on the "Add runner" page is one-time and short-lived. If it expires, regenerate by re-starting "Add runner" flow in GitHub UI.
- Labels: Make sure the labels match exactly what the workflow expects (`private-runner,linux,x64`). You can add additional labels during `config.sh`.
- Permissions: The user running the runner must have permissions to run the tests (access to node, npm, and project files).
- Logs: The runner writes logs in the `_diag` folder and runner root directory.

Security
- Keep the runner machine secure because workflow jobs will execute with permissions of the runner user.
- If the repo is public, consider using ephemeral self-hosted runners or restrict which workflows can use the runner.

If you want, I can:
- Add a `systemd` service unit template file to the repo and patch the README with exact token copy steps.
- Update the CI workflow to fall back to hosted runners if the self-hosted pool is unavailable.

Finished: add the token and run `./config.sh` from the commands above to register the runner. Once the runner is online, your CI job will be picked up and tests should connect to the `mongod` instance running there.
