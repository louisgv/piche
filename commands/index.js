import os from "os";
import http from "http";
import handler from "serve-handler";
import localtunnel from "localtunnel";
import clipboard from "clipboardy";
import fs from "fs-extra";

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
	] = useLogState("piche-local", "setup server . . .", "yellow");

	const [
		tunnelStatus,
		setTunnelStatus,
		tunnelStatusColor,
		setTunnelStatusColor
	] = useLogState("piche-tunnel", "waiting for piche-local . . .", "orange");

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

			setLocalStatus(`up and running at http://localhost:${localtunnelPort}`);

			setTunnelStatus(`setting up tunnel to ${localtunnelPort}`);

			localtunnel(localtunnelPort, async (err, tunnel) => {
				if (err) {
					setTunnelStatusColor("red");
					setLocalStatus(err);
					server.close();
				}
				setTunnelStatusColor("green");
				setTunnelStatus(`up and running at ${tunnel.url}`);

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
			setLocalStatus("shutdown.");
			setTunnelStatus("shutdown.");

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
			setStatus(`clean up ${tmpPath} . . .`);

			await fs.remove(tmpPath);

			setStatusColor("orange");
			setStatus(`clean up ${homePath} . . .`);

			await fs.remove(homePath);

			setStatusColor("green");
			setStatus("done.");
		};

		cleanup();
	}, []);

	return (
		<Color keyword={statusColor}>
			<Text>{status}</Text>
		</Color>
	);
};

/// piche a piece of text and send it to the temp folder
const Piche = ({ start, tmp, clean }) => {
	const [data, setData] = useState("loading . . .");

	if (clean) {
		return <PicheClean />;
	}

	if (start) {
		return <PicheStart tmp={tmp} />;
	}

	const workingPath = `${tmp ? os.tmpdir() : os.homedir()}/.piche`;

	const publicPath = `${workingPath}/public`;

	const statusFilePath = `${workingPath}/status.json`;


	useEffect(() => {
		const timer = setTimeout(() => {
			process.stdin.destroy();
		}, 1000);

		process.stdin.once("data", e => {
			clearTimeout(timer);

			setData(e.toString());
		});
	}, []);

	return <Text>Here comes the data: {data}</Text>;
};

Piche.propTypes = {
	/// Start piche server
	start: PropTypes.bool,
	/// Use os.tmpdir/.piche instead of os.homedir/.piche
	tmp: PropTypes.bool,
	/// Cleanup os.tmpdir/.piche and os.homedir/.piche
	clean: PropTypes.bool
};

Piche.defaultProps = {
	start: false,
	tmp: false,
	clean: false
};

Piche.shortFlags = {
	start: "s",
	tmp: "t",
	clean: "c"
};

export default Piche;
