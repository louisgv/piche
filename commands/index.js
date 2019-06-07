import os from "os";
import http from "http";
import handler from "serve-handler";
import localtunnel from "localtunnel";
import clipboard from "clipboardy";
import fs from "fs-extra";
import uuid from "uuid/v1";

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Text, Color, Box } from "ink";

const useLogState = (tag, defaultValue = "hello", defaultColor = "white") => {
	const [log, setLogRaw] = useState(`${tag}\t | ${defaultValue}`);

	const setLog = s => setLogRaw(`${tag}\t | ${s}`);

	const [color, setColor] = useState(defaultColor);

	return [log, setLog, color, setColor];
};

const PicheStart = ({ tmp }) => {
	const workingPath = `${tmp ? os.tmpdir() : os.homedir()}/.piche`;

	const publicPath = `${workingPath}/public`;

	const statusFilePath = `${workingPath}/status.json`;

	const [
		localStatus,
		setLocalStatus,
		localStatusColor,
		setLocalStatusColor
	] = useLogState("piche-local", "owo setup server . . .", "yellow");

	const [
		tunnelStatus,
		setTunnelStatus,
		tunnelStatusColor,
		setTunnelStatusColor
	] = useLogState("piche-tunnel", "=w= waiting for piche-local . . .", "orange");

	const [tunnel, setTunnel] = useState();

	useEffect(() => {
		fs.ensureDirSync(publicPath);

		const server = new http.Server((req, res) => {
			return handler(req, res, {
				public: publicPath
			});
		});

		server.listen(0, () => {
			const localtunnelPort = server.address().port;

			setLocalStatusColor("pink");
			setTunnelStatusColor("orange");

			setLocalStatus(
				`️UwU up and running at http://localhost:${localtunnelPort}`
			);

			setTunnelStatus(`'w' setting up tunnel to ${localtunnelPort}`);

			localtunnel(localtunnelPort, async (err, tunnel) => {
				if (err) {
					setTunnelStatusColor("red");
					setLocalStatus(err);
					server.close();
				}
				setTunnelStatusColor("green");
				setTunnelStatus(`UwU up and running at ${tunnel.url}`);

				await fs.outputJson(statusFilePath, {
					port: localtunnelPort,
					url: tunnel.url
				});

				setTunnel(tunnel);
			});
		});

		process.on("SIGINT", () => {
			setLocalStatusColor("magenta");
			setTunnelStatusColor("cyan");
			setLocalStatus("UvU shutdown.");
			setTunnelStatus("UvU shutdown.");

			fs.removeSync(statusFilePath);

			if (tmp) {
				fs.removeSync(workingPath);
			}

			if (tunnel) {
				tunnel.close();
			}

			process.exit();
		});
	}, []);

	return (
		<Box flexDirection="column">
			<Color keyword={localStatusColor}>
				<Text>{localStatus}</Text>
			</Color>
			<Color keyword={tunnelStatusColor}>
				<Text>{tunnelStatus}</Text>
			</Color>
		</Box>
	);
};

const PicheClean = () => {
	const tmpPath = `${os.tmpdir()}/.piche`;
	const homePath = `${os.homedir()}/.piche`;

	const [status, setStatus, statusColor, setStatusColor] = useLogState(
		"piche-clean",
		"warming up . . .",
		"yellow"
	);
	useEffect(() => {
		const cleanup = async () => {
			setStatus(`'w' clean up ${tmpPath} . . .`);

			await fs.remove(tmpPath);

			setStatusColor("orange");
			setStatus(`'w' clean up ${homePath} . . .`);

			await fs.remove(homePath);

			setStatusColor("green");
			setStatus("UwU done.");
		};

		cleanup();
	}, []);

	return (
		<Color keyword={statusColor}>
			<Text>{status}</Text>
		</Color>
	);
};

/// UwU A localtunnel based pipe tool to share text quickly from terminal.
const Piche = ({ start, tmp, clean, name }) => {
	const [status, setStatus, statusColor, setStatusColor] = useLogState(
		"piche-core",
		"'w' piping data . . .",
		"yellow"
	);

	if (clean) {
		return <PicheClean />;
	}

	if (start) {
		return <PicheStart tmp={tmp} />;
	}

	const workingPath = `${tmp ? os.tmpdir() : os.homedir()}/.piche`;

	const publicPath = `${workingPath}/public`;

	const statusFilePath = `${workingPath}/status.json`;

	const outputFilePath = `${publicPath}/${name}`;

	useEffect(() => {
		const timer = setTimeout(() => {
			setStatusColor("red");
			setStatus("'x' ehh... nothing piped");
			process.stdin.destroy();
		}, 3000);

		process.stdin.once("data", e => {
			clearTimeout(timer);
			const data = e.toString();

			fs.outputFileSync(outputFilePath, data);

			const isPicheUp = fs.existsSync(statusFilePath);
			if (!isPicheUp) {
				clipboard.writeSync(name);

				setStatusColor("orange");
				setStatus(`>.< server is not up, no link to copy. Start a server with: npx piche -s${tmp ? 't' :''}. The file name (${name}) has been copied to your clipboard.`);
				return;
			}

			const status = fs.readJsonSync(statusFilePath);

			const tunnelUrl = `${status.url}/${name}`;
			clipboard.writeSync(tunnelUrl);

			setStatusColor("green");
			setStatus(`UwU copied to clipboard, url: ${tunnelUrl}`);
		});
	}, []);

	return (
		<Color keyword={statusColor}>
			<Text>{status}</Text>
		</Color>
	);
};

Piche.propTypes = {
	/// Start piche server
	start: PropTypes.bool,
	/// Use os.tmpdir/.piche instead of os.homedir/.piche
	tmp: PropTypes.bool,
	/// Cleanup os.tmpdir/.piche and os.homedir/.piche
	clean: PropTypes.bool,
	/// Name of the output file, default: an uuid/v1
	name: PropTypes.string
};

Piche.defaultProps = {
	start: false,
	tmp: false,
	clean: false,
	name: uuid()
};

Piche.shortFlags = {
	start: "s",
	tmp: "t",
	clean: "c",
	name: "n"
};

export default Piche;
