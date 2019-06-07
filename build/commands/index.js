// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = _interopRequireDefault(require("os"));

var _http = _interopRequireDefault(require("http"));

var _serveHandler = _interopRequireDefault(require("serve-handler"));

var _localtunnel = _interopRequireDefault(require("localtunnel"));

var _clipboardy = _interopRequireDefault(require("clipboardy"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ink = require("ink");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const useLogState = (tag, defaultValue = "hello", defaultColor = "white") => {
  const [log, setLogRaw] = (0, _react.useState)(`${tag}\t | ${defaultValue}`);

  const setLog = s => setLogRaw(`${tag}\t | ${s}`);

  const [color, setColor] = (0, _react.useState)(defaultColor);
  return [log, setLog, color, setColor];
};

const PicheStart = ({
  tmp
}) => {
  const workingPath = `${tmp ? _os.default.tmpdir() : _os.default.homedir()}/.piche`;
  const publicPath = `${workingPath}/public`;
  const statusFilePath = `${workingPath}/status.json`;
  const [localStatus, setLocalStatus, localStatusColor, setLocalStatusColor] = useLogState("piche-local", "setup server . . .", "yellow");
  const [tunnelStatus, setTunnelStatus, tunnelStatusColor, setTunnelStatusColor] = useLogState("piche-tunnel", "waiting for piche-local . . .", "orange");
  const [tunnel, setTunnel] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    _fsExtra.default.ensureDirSync(publicPath);

    const server = new _http.default.Server((req, res) => {
      return (0, _serveHandler.default)(req, res, {
        public: publicPath
      });
    });
    server.listen(0, () => {
      const localtunnelPort = server.address().port;
      setLocalStatusColor("pink");
      setTunnelStatusColor("orange");
      setLocalStatus(`up and running at http://localhost:${localtunnelPort}`);
      setTunnelStatus(`setting up tunnel to ${localtunnelPort}`);
      (0, _localtunnel.default)(localtunnelPort, async (err, tunnel) => {
        if (err) {
          setTunnelStatusColor("red");
          setLocalStatus(err);
          server.close();
        }

        setTunnelStatusColor("green");
        setTunnelStatus(`up and running at ${tunnel.url}`);
        await _fsExtra.default.outputJson(statusFilePath, {
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

      _fsExtra.default.removeSync(statusFilePath);

      if (tmp) {
        _fsExtra.default.removeSync(workingPath);
      }

      if (tunnel) {
        tunnel.close();
      }

      process.exit();
    });
  }, []);
  return _react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, _react.default.createElement(_ink.Color, {
    keyword: localStatusColor
  }, _react.default.createElement(_ink.Text, null, localStatus)), _react.default.createElement(_ink.Color, {
    keyword: tunnelStatusColor
  }, _react.default.createElement(_ink.Text, null, tunnelStatus)));
};

const PicheClean = () => {
  const tmpPath = `${_os.default.tmpdir()}/.piche`;
  const homePath = `${_os.default.homedir()}/.piche`;
  const [status, setStatus, statusColor, setStatusColor] = useLogState("piche-clean", "warming up . . .", "yellow");
  (0, _react.useEffect)(() => {
    const cleanup = async () => {
      setStatus(`clean up ${tmpPath} . . .`);
      await _fsExtra.default.remove(tmpPath);
      setStatusColor("orange");
      setStatus(`clean up ${homePath} . . .`);
      await _fsExtra.default.remove(homePath);
      setStatusColor("green");
      setStatus("done.");
    };

    cleanup();
  }, []);
  return _react.default.createElement(_ink.Color, {
    keyword: statusColor
  }, _react.default.createElement(_ink.Text, null, status));
}; /// piche a piece of text and send it to the temp folder


const Piche = ({
  start,
  tmp,
  clean
}) => {
  const [data, setData] = (0, _react.useState)("loading . . .");

  if (clean) {
    return _react.default.createElement(PicheClean, null);
  }

  if (start) {
    return _react.default.createElement(PicheStart, {
      tmp: tmp
    });
  }

  const workingPath = `${tmp ? _os.default.tmpdir() : _os.default.homedir()}/.piche`;
  const publicPath = `${workingPath}/public`;
  const statusFilePath = `${workingPath}/status.json`;
  (0, _react.useEffect)(() => {
    const timer = setTimeout(() => {
      process.stdin.destroy();
    }, 1000);
    process.stdin.once("data", e => {
      clearTimeout(timer);
      setData(e.toString());
    });
  }, []);
  return _react.default.createElement(_ink.Text, null, "Here comes the data: ", data);
};

Piche.propTypes = {
  /// Start piche server
  start: _propTypes.default.bool,
  /// Use os.tmpdir/.piche instead of os.homedir/.piche
  tmp: _propTypes.default.bool,
  /// Cleanup os.tmpdir/.piche and os.homedir/.piche
  clean: _propTypes.default.bool
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
var _default = Piche;
exports.default = _default;
},{}]},{},["index.js"], null)
//# sourceMappingURL=/index.js.map