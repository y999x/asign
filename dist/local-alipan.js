"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// ../../packages/utils-pure/index.ts
function randomHex(length, pad = "-") {
  return Array.isArray(length) ? length.map((l) => randomHex(l, pad)).join(pad) : Array.from({
    length
  }).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

// ../../core/alipan/api.ts
function createApi(http) {
  let memberUrl = "https://member.aliyundrive.com", aliyundriveUrl = "https://api.aliyundrive.com", authUrl = "https://auth.aliyundrive.com", apiUrl = "https://api.alipan.com";
  return {
    refreshToken(refreshToken2) {
      return http.post(`${aliyundriveUrl}/token/refresh`, {
        refresh_token: refreshToken2
      });
    },
    getAccessToken(refreshToken2) {
      return http.post(`${authUrl}/v2/account/token`, {
        refresh_token: refreshToken2,
        grant_type: "refresh_token"
      });
    },
    signInList() {
      return http.post(
        `${memberUrl}/v2/activity/sign_in_list?_rx-s=mobile`,
        {
          "_rx-s": "mobile"
        }
      );
    },
    signIn() {
      return http.post(
        `${memberUrl}/v2/activity/sign_in_info?_rx-s=mobile`,
        {}
      );
    },
    signInReward(signInDay) {
      return http.post(
        `${memberUrl}/v1/activity/sign_in_reward?_rx-s=mobile`,
        {
          signInDay
        }
      );
    },
    signInTaskReward(signInDay) {
      return http.post(`${memberUrl}/v2/activity/sign_in_task_reward`, {
        signInDay
      });
    },
    updateDeviceExtras() {
      return http.post(
        `${apiUrl}/users/v1/users/update_device_extras`,
        {
          albumAccessAuthority: !0,
          albumBackupLeftFileTotal: 0,
          albumBackupLeftFileTotalSize: 0,
          albumFile: 0,
          autoBackupStatus: !0,
          // totalSize: 0,
          // useSize: 0,
          brand: "xiaomi",
          systemVersion: "Android 13"
        }
      );
    },
    createSession(deviceId, refreshToken2, pubKey, deviceName, modelName) {
      return http.post(
        "https://api.alipan.com/users/v1/users/device/create_session",
        {
          deviceName,
          modelName,
          nonce: "0",
          pubKey,
          refreshToken: refreshToken2
        },
        {
          headers: {
            "x-device-id": deviceId
          }
        }
      );
    },
    getDeviceAppletList() {
      return http.post(
        `${apiUrl}/adrive/v2/backup/device_applet_list_summary`,
        {}
      );
    },
    getDeviceList() {
      return http.post(`${apiUrl}/users/v2/users/device_list`, {});
    },
    getAlbumsInfo() {
      return http.post(
        `${aliyundriveUrl}/adrive/v1/user/albums_info`,
        {}
      );
    },
    getDeviceRoomList() {
      return http.post(
        "https://user.aliyundrive.com/v1/deviceRoom/listDevice",
        {}
      );
    },
    getDeviceRoomRewardInfoToday() {
      return http.post(
        `${memberUrl}/v1/deviceRoom/rewardInfoToday`,
        {}
      );
    },
    getDeviceRoomRewardEnergy(deviceId) {
      return http.post(
        `${memberUrl}/v1/deviceRoom/rewardEnergy`,
        {
          deviceId
        }
      );
    },
    createFile(deviceId, driveId) {
      let size = Math.floor(Math.random() * 3e4);
      return http.post(
        `${aliyundriveUrl}/adrive/v2/biz/albums/file/create`,
        {
          drive_id: driveId,
          part_info_list: [
            {
              part_number: 1,
              part_size: size
            }
          ],
          parent_file_id: "root",
          name: Math.floor(Math.random() * 1e8) + ".jpg",
          type: "file",
          check_name_mode: "auto_rename",
          size,
          create_scene: "album_autobackup",
          hidden: !1,
          content_type: "image/jpeg"
        },
        {
          headers: {
            "x-device-id": deviceId
          }
        }
      );
    },
    completeUpload(deviceId, driveId, fileId, uploadId) {
      return http.post(
        `${aliyundriveUrl}/v2/file/complete`,
        {
          drive_id: driveId,
          upload_id: uploadId,
          file_id: fileId
        },
        {
          headers: {
            "x-device-id": deviceId
          }
        }
      );
    },
    completeAlbumsUpload(deviceId, driveId, fileId, contentHash) {
      return http.post(
        `${aliyundriveUrl}/adrive/v2/biz/albums/file/complete`,
        {
          drive_id: driveId,
          file_id: fileId,
          content_hash: contentHash,
          content_hash_name: "sha1"
        },
        {
          headers: {
            "x-device-id": deviceId
          }
        }
      );
    },
    deleteFile(deviceId, driveId, fileId) {
      return http.post(
        `${apiUrl}/adrive/v4/batch`,
        {
          requests: [
            {
              body: {
                drive_id: driveId,
                file_id: fileId
              },
              id: fileId,
              method: "POST",
              url: "/file/delete"
            }
          ],
          resource: "file"
        },
        {
          headers: {
            "x-device-id": deviceId
          }
        }
      );
    },
    home() {
      return http.post(`${aliyundriveUrl}/apps/v2/users/home/widgets`, {});
    }
  };
}

// ../../core/alipan/index.ts
async function request($, api, name, ...args) {
  try {
    let { success, message, result } = await api(...args);
    if (!success)
      $.logger.error(`${name}\u5931\u8D25`, message);
    else
      return result;
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error);
  }
  return {};
}
async function refreshToken($, token) {
  try {
    let data = await $.api.getAccessToken(token);
    if (!data.access_token) {
      $.logger.error("\u83B7\u53D6 access_token \u5931\u8D25", JSON.stringify(data));
      return;
    }
    return data;
  } catch (error) {
    $.logger.error("\u83B7\u53D6 access_token \u5F02\u5E38", error);
  }
}
async function createDeviceApi($, refreshToken2, deviceId) {
  try {
    let { success } = await $.api.createSession(
      deviceId,
      refreshToken2,
      randomHex(32),
      "XiaoMi 14Pro",
      "xiaomi"
    );
    return success ? ($.logger.info("\u521B\u5EFA\u865A\u62DF\u8BBE\u5907\u6210\u529F"), !0) : ($.logger.error(`\u521B\u5EFA\u865A\u62DF\u8BBE\u5907${deviceId}\u5931\u8D25`), !1);
  } catch (error) {
    $.logger.error(`\u521B\u5EFA\u865A\u62DF\u8BBE\u5907${deviceId}\u5F02\u5E38`, error);
  }
  return !1;
}
async function getDeviceRoomListApi($) {
  try {
    let { items } = await $.api.getDeviceRoomList();
    if (!items) {
      $.logger.error("\u83B7\u53D6\u8BBE\u5907\u95F4\u5217\u8868\u5931\u8D25");
      return;
    }
    return items;
  } catch (error) {
    $.logger.error("\u83B7\u53D6\u8BBE\u5907\u95F4\u5217\u8868\u5F02\u5E38", error);
  }
}
async function getDeviceRoomRewardInfo($) {
  return request($, $.api.getDeviceRoomRewardInfoToday, "\u83B7\u53D6\u8BBE\u5907\u95F4\u9886\u53D6\u4FE1\u606F");
}
async function getAlbumsDriveId($) {
  try {
    let { code, message, data } = await $.api.getAlbumsInfo();
    if (code !== "200") {
      $.logger.error("\u83B7\u53D6\u76F8\u518C\u6587\u4EF6\u5939\u5931\u8D25", message);
      return;
    }
    return data.driveId;
  } catch (error) {
    $.logger.error("\u83B7\u53D6\u76F8\u518C\u6587\u4EF6\u5939\u5F02\u5E38", error);
  }
}
async function createDevice($) {
  let needNum = 5 - (await getDeviceRoomListApi($)).length;
  if (!(needNum <= 0)) {
    $.logger.info(`\u9700\u8981\u521B\u5EFA${needNum}\u4E2A\u865A\u62DF\u8BBE\u5907`);
    for (let i = 0; i < needNum; i++)
      await createDeviceApi($, $.DATA.refreshToken, randomHex(64));
  }
}
async function uploadFile($, deviceId, driveId) {
  try {
    let { file_id, upload_id } = await $.api.createFile(deviceId, driveId);
    if (file_id)
      return await $.sleep(1e3), await $.api.completeUpload(deviceId, driveId, file_id, upload_id), await $.api.completeAlbumsUpload(
        deviceId,
        driveId,
        file_id,
        "DA39A3EE5E6B4B0D3255BFEF95601890AFD80709"
      ), { file_id, upload_id };
    $.logger.error(`${deviceId}\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25`);
  } catch (error) {
    $.logger.error("\u4E0A\u4F20\u6587\u4EF6\u5F02\u5E38", error);
  }
  return {};
}
async function deviceRoomListHandle(deviceRooms) {
  let nofinishDevices = /* @__PURE__ */ new Set(), rewardEnergys = /* @__PURE__ */ new Set(), okNum = 0;
  for (let { canCollectEnergy, id, gmtCollectEnergy } of deviceRooms)
    !canCollectEnergy && new Date(gmtCollectEnergy).getDate() !== (/* @__PURE__ */ new Date()).getDate() ? nofinishDevices.add(id) : canCollectEnergy ? rewardEnergys.add(id) : okNum++;
  return {
    nofinishDevices: Array.from(nofinishDevices),
    rewardEnergys: Array.from(rewardEnergys),
    okNum
  };
}
async function getDeviceRoomRewardApi($, id) {
  return (await request($, $.api.getDeviceRoomRewardEnergy, `\u9886\u53D6${id}\u8BBE\u5907\u7A7A\u95F4`, id)).size;
}
async function deleteFileApi($, deviceId, driveId, fileId) {
  try {
    await $.api.deleteFile(deviceId, driveId, fileId);
  } catch (error) {
    $.logger.error(`\u5220\u9664\u6587\u4EF6${fileId}\u5F02\u5E38`, error);
  }
}
async function deleteFiles($, needDeleteFiles, driveId) {
  for (let [fileId, deviceId] of needDeleteFiles)
    await deleteFileApi($, deviceId, driveId, fileId), await $.sleep(1e3);
}
async function deviceRoomTask($) {
  let { rewardCountToday, rewardTotalSize } = await getDeviceRoomRewardInfo($);
  if (rewardCountToday >= 5) {
    $.logger.info(
      `\u4ECA\u65E5\u5DF2\u9886\u53D6${rewardCountToday}\u6B21\u8BBE\u5907\u95F4\u7A7A\u95F4\uFF0C\u5386\u53F2\u603B\u5171${rewardTotalSize}M`
    );
    return;
  }
  let driveId = await getAlbumsDriveId($);
  if (!driveId) {
    $.logger.error("\u672A\u83B7\u53D6\u5230\u6587\u4EF6\u5939\u6545\u8DF3\u8FC7\u6267\u884C");
    return;
  }
  let needDeleteFiles = /* @__PURE__ */ new Map();
  for (await createDevice($); await _deviceRoomTask(); )
    await $.sleep(2e3);
  await deleteFiles($, needDeleteFiles, driveId);
  async function _deviceRoomTask() {
    let items = await getDeviceRoomListApi($);
    if (!items)
      return $.logger.error("\u65E0\u6CD5\u83B7\u53D6\u865A\u62DF\u8BBE\u5907\uFF0C\u8DF3\u8FC7\u6267\u884C"), !1;
    if (items.length === 0)
      return $.logger.error("\u65E0\u6CD5\u521B\u5EFA\u865A\u62DF\u8BBE\u5907\uFF0C\u8DF3\u8FC7\u6267\u884C"), !1;
    let { nofinishDevices, rewardEnergys, okNum } = await deviceRoomListHandle(items);
    if (okNum >= 5)
      return !1;
    let tempNum = 0;
    for (let deviceId of rewardEnergys) {
      let size = await getDeviceRoomRewardApi($, deviceId);
      if (size && ($.logger.info(`\u9886\u53D6\u8BBE\u5907\u95F4\u6210\u529F\uFF0C\u83B7\u5F97${size}M`), tempNum++), tempNum + okNum >= 5)
        break;
      await $.sleep(1e3);
    }
    for (let deviceId of nofinishDevices) {
      let { file_id } = await uploadFile($, deviceId, driveId) || {};
      file_id && needDeleteFiles.set(file_id, deviceId), await $.sleep(1e3);
    }
    return !0;
  }
}
async function signIn($) {
  let { rewards, signInDay } = await request($, $.api.signIn, "\u7B7E\u5230");
  if (rewards) {
    for (let { status, type } of rewards)
      if (status === "finished")
        switch (type) {
          case "dailySignIn":
            await request($, $.api.signInReward, "\u9886\u53D6\u7B7E\u5230\u5956\u52B1", signInDay);
            break;
          case "dailyTask":
            await request($, $.api.signInTaskReward, "\u9886\u53D6\u6BCF\u65E5\u4EFB\u52A1\u5956\u52B1", signInDay);
            break;
          default:
            break;
        }
  }
}
async function getDeviceList($) {
  try {
    let data = await $.api.getDeviceAppletList();
    if (!data.deviceItems) {
      $.logger.error("\u83B7\u53D6\u8BBE\u5907\u4FE1\u606F\u5931\u8D25", JSON.stringify(data));
      return;
    }
    if (data.deviceItems.length === 0) {
      $.logger.error("\u83B7\u53D6\u5230\u7684\u8BBE\u5907\u5217\u8868\u672A\u7A7A");
      return;
    }
    return data.deviceItems;
  } catch (error) {
    $.logger.error("\u83B7\u53D6\u8BBE\u5907\u4FE1\u606F\u5F02\u5E38", error);
  }
}
async function getDevice($) {
  let devices = await getDeviceList($);
  return devices ? devices.find(({ deviceId }) => deviceId) : void 0;
}
async function signInTask($) {
  let { rewards } = await request($, $.api.signIn, "\u7B7E\u5230");
  if (rewards.find(
    ({ type, status }) => type === "dailyTask" && (status === "verification" || status === "finished")
  ))
    return;
  let { deviceId, backupViews } = await getDevice($) || {};
  if (!deviceId) {
    $.logger.error("\u672A\u83B7\u53D6\u5230\u8BBE\u5907 id\uFF0C\u8DF3\u8FC7\u6BCF\u65E5\u4EFB\u52A1\u6267\u884C");
    return;
  }
  $.DATA.deviceId = deviceId;
  let backupView = backupViews.find(({ view }) => view === "album");
  if (!backupView) {
    $.logger.error("\u672A\u83B7\u53D6\u5230\u6587\u4EF6\u5939 id\uFF0C\u8DF3\u8FC7\u6BCF\u65E5\u4EFB\u52A1\u6267\u884C");
    return;
  }
  await request($, $.api.updateDeviceExtras, "\u4E0A\u62A5\u5907\u4EFD");
  let needDeleteFiles = /* @__PURE__ */ new Map();
  for (let i = 0; i < 10; i++) {
    let { file_id } = await uploadFile($, deviceId, backupView.driveId);
    file_id && needDeleteFiles.set(file_id, deviceId), await $.sleep(2e3);
  }
  $.DATA.afterTask.push(
    async () => await deleteFiles($, needDeleteFiles, backupView.driveId)
  );
}
async function printSignInInfo($) {
  let { rewards } = await request($, $.api.signIn, "\u7B7E\u5230");
  if (!rewards)
    return;
  let statusMap = {
    unfinished: "\u672A\u5B8C\u6210",
    finished: "\u672A\u9886\u53D6\u5956\u52B1",
    verification: "\u5DF2\u9886\u53D6\u5956\u52B1",
    notStart: "\u672A\u5F00\u59CB"
  };
  rewards.forEach(({ remind, name, status }) => {
    $.logger.info(`${remind}/${name}/${statusMap[status]}`);
  });
}
async function run($) {
  let taskList = [deviceRoomTask, signInTask, signIn, printSignInInfo];
  for (let task of taskList)
    await task($), await $.sleep(1e3);
  for (let task of $.DATA.afterTask)
    await task(), await $.sleep(1e3);
}

// index.ts
var _conf = require('@asunajs/conf');
var _push = require('@asunajs/push');

// ../../packages/utils/index.ts
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
function sleep(time) {
  return new Promise((res) => setTimeout(() => res(time), time));
}
async function createLogger(options) {
  let { createConsola, consola } = await Promise.resolve().then(() => _interopRequireWildcard(require("./dist-B4EUE7N7.cjs")));
  return consola.options.level = 5, createConsola({
    level: 5,
    reporters: [
      {
        log: ({ type, args, level, date }) => {
          if (options && options.pushData) {
            let msg = args.reduce((str, cur) => `${str} ${cur}`, "").substring(1);
            options.pushData.push({ msg, type, level, date });
          }
          consola[type].apply(consola, args);
        }
      }
    ]
  });
}
function sha256(input) {
  return _crypto2.default.createHash("sha256").update(input).digest("hex");
}
async function pushMessage({
  pushData,
  message,
  sendNotify: sendNotify2,
  createRequest: createRequest2
}) {
  if (pushData.length && message) {
    if (message.onlyError && !pushData.some((el) => el.type === "error"))
      return;
    let msg = pushData.filter((el) => el.level < 4).map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`).join(`
`);
    msg && await sendNotify2(
      {
        logger: await createLogger(),
        http: { fetch: (op) => createRequest2().request(op) }
      },
      message,
      message.title || "asign \u8FD0\u884C\u63A8\u9001",
      msg
    );
  }
}

// index.ts
var _nodegot = require('@catlair/node-got');

// utils.ts
var _secp256k1 = require('secp256k1');
function getSignature(nonce, user_id, deviceId) {
  let toHex = (bytes) => Buffer.from(bytes).toString("hex"), toU8 = (str) => new Uint8Array(Buffer.from(str, "hex")), privateKey = toU8(sha256(user_id)), publicKey = "04" + toHex(_secp256k1.publicKeyCreate.call(void 0, privateKey));
  return { signature: toHex(
    _secp256k1.ecdsaSign.call(void 0, 
      toU8(sha256(`5dde4e1bdf9e4966b387ba58f4b3fdc3:${deviceId}:${user_id}:${nonce}`)),
      privateKey
    ).signature
  ) + "01", publicKey };
}

// index.ts
function getXSignature(DATA, userId) {
  if (DATA["x-signature"])
    return DATA["x-signature"];
  let t = DATA.deviceId ? getSignature(0, userId, DATA.deviceId).signature : "";
  return DATA["x-signature"] = t, t || randomHex(128) + "01";
}
async function main({ token }, option) {
  if (!token)
    return;
  let logger = await createLogger({ pushData: option == null ? void 0 : option.pushData }), DATA = {
    deviceId: "",
    afterTask: []
  }, accessToken, userId, $ = {
    api: createApi(
      _nodegot.createRequest.call(void 0, {
        hooks: {
          beforeRequest: [
            (options) => {
              options.headers = {
                "x-device-id": DATA.deviceId,
                authorization: accessToken ? `Bearer ${accessToken}` : "",
                "x-signature": getXSignature(DATA, userId),
                ...options.headers
              };
            }
          ]
        },
        headers: {
          "content-type": "application/json;charset=UTF-8",
          referer: "https://alipan.com/",
          origin: "https://alipan.com/",
          "x-canary": "client=Android,app=adrive,version=v5.3.0",
          "user-agent": "AliApp(AYSD/5.3.0) com.alicloud.databox/34760760 Channel/36176727979800@rimet_android_5.3.0 language/zh-CN /Android Mobile/Mi 6X"
        }
      })
    ),
    logger,
    DATA,
    sleep
  }, rtData = await refreshToken($, token.trim());
  if (rtData)
    return DATA.refreshToken = rtData.refresh_token, accessToken = rtData.access_token, userId = rtData.user_id, DATA.deviceId = rtData.device_id, $.logger.info("-------------"), $.logger.info(`\u4F60\u597D${rtData.nick_name || rtData.user_name}`), await run($), rtData.refresh_token;
}
async function run2(inputPath) {
  let { config, path } = _conf.loadConfig.call(void 0, inputPath), logger = await createLogger(), alipan = config.alipan;
  if (!alipan || !alipan.length || !alipan[0].token)
    return logger.error("\u672A\u627E\u5230\u914D\u7F6E\u6587\u4EF6/\u53D8\u91CF");
  let pushData = [];
  for (let index = 0; index < alipan.length; index++) {
    let c = alipan[index];
    if (c.token)
      try {
        let token = await main(c, { pushData });
        token && _conf.rewriteConfigSync.call(void 0, path, ["alipan", index, "token"], token);
      } catch (error) {
        logger.error(error);
      }
  }
  await pushMessage({
    pushData,
    message: config.message,
    sendNotify: _push.sendNotify,
    createRequest: _nodegot.createRequest
  });
}



exports.main = main; exports.run = run2;
;(async () => { await module.exports.run(); })();
