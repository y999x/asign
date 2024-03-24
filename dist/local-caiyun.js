"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// ../../packages/utils-pure/index.ts
function randomHex(length, pad = "-") {
  return Array.isArray(length) ? length.map((l) => randomHex(l, pad)).join(pad) : Array.from({
    length
  }).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
function getXmlElement(xml, tag) {
  let m = xml.match(`<${tag}>(.*)</${tag}>`);
  return m ? m[1] : "";
}
async function asyncForEach(array, task, cb) {
  let len = array.length;
  for (let index = 0; index < len; index++) {
    let item = array[index];
    await task(item), index < len - 1 && cb && await cb();
  }
}
function setStoreArray(store, key, values) {
  return Reflect.has(store, key) ? Reflect.set(store, key, Reflect.get(store, key).concat(values)) : Reflect.set(store, key, values);
}
function getAuthInfo(basicToken) {
  basicToken = basicToken.replace("Basic ", "");
  let rawToken = Buffer.from(basicToken, "base64").toString("utf-8"), [platform, phone, token] = rawToken.split(":");
  return {
    phone,
    token,
    auth: `Basic ${basicToken}`,
    platform
  };
}
function hashCode(str) {
  if (typeof str != "string")
    return 0;
  let hash = 0, char = null;
  if (str.length == 0)
    return hash;
  for (let i = 0; i < str.length; i++)
    char = str.charCodeAt(i), hash = (hash << 5) - hash + char, hash = hash & hash;
  return hash;
}

// ../../core/caiyun/garden.ts
async function request($, api, name, ...args) {
  try {
    let { success, msg, result } = await api(...args);
    if (!success)
      $.logger.error(`${name}\u5931\u8D25`, msg);
    else
      return result;
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error);
  }
  return {};
}
async function loginGarden($, token, phone) {
  try {
    await $.gardenApi.login(token, phone);
  } catch (error) {
    $.logger.error("\u767B\u5F55\u679C\u56ED\u5931\u8D25", error);
  }
}
async function getTodaySign($) {
  let { todayCheckin } = await request(
    $,
    $.gardenApi.checkinInfo,
    "\u83B7\u53D6\u679C\u56ED\u7B7E\u5230\u4FE1\u606F"
  );
  return todayCheckin;
}
async function initTree($) {
  let { collectWater, treeLevel, nickName } = await request(
    $,
    $.gardenApi.initTree,
    "\u521D\u59CB\u5316\u679C\u56ED"
  );
  $.logger.info(`${nickName}\u62E5\u6709${treeLevel}\u7EA7\u679C\u6811\uFF0C\u5F53\u524D\u6C34\u6EF4${collectWater}`);
}
async function signInGarden($) {
  let todaySign = await getTodaySign($);
  if (todaySign !== void 0) {
    if (todaySign)
      return $.logger.info("\u4ECA\u65E5\u679C\u56ED\u5DF2\u7B7E\u5230");
    try {
      let { code, msg } = await request($, $.gardenApi.checkin, "\u679C\u56ED\u7B7E\u5230");
      code !== 1 && $.logger.error("\u679C\u56ED\u7B7E\u5230\u5931\u8D25", code, msg);
    } catch (error) {
      $.logger.error("\u679C\u56ED\u7B7E\u5230\u5F02\u5E38", error);
    }
  }
}
async function clickCartoon($, cartoonTypes) {
  cartoonTypes.length === 0 && cartoonTypes.push("cloud", "color", "widget", "mail"), await asyncForEach(
    cartoonTypes,
    async (cartoonType) => {
      let { msg, code } = await request(
        $,
        $.gardenApi.clickCartoon,
        "\u9886\u53D6\u573A\u666F\u6C34\u6EF4",
        cartoonType
      );
      [1, -1, -2].includes(code) ? $.logger.debug(`\u9886\u53D6\u573A\u666F\u6C34\u6EF4${cartoonType}`) : $.logger.error(`\u9886\u53D6\u573A\u666F\u6C34\u6EF4${cartoonType}\u5931\u8D25`, code, msg);
    },
    async () => await $.sleep(5e3)
  );
}
async function getTaskList($, headers) {
  let list = await request(
    $,
    $.gardenApi.getTaskList,
    "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868",
    headers
  );
  return Array.isArray(list) ? list : [];
}
async function getTaskStateList($, headers) {
  let list = await request(
    $,
    $.gardenApi.getTaskStateList,
    "\u83B7\u53D6\u4EFB\u52A1\u5B8C\u6210\u60C5\u51B5\u8868",
    headers
  );
  return Array.isArray(list) ? list : [];
}
async function doTask($, tasks, headers) {
  let taskList = [];
  return await asyncForEach(
    tasks,
    async ({ taskId, taskName }) => {
      let { code, summary } = await request(
        $,
        $.gardenApi.doTask,
        `\u63A5\u6536${taskName}\u4EFB\u52A1`,
        taskId,
        headers
      );
      code !== 1 ? $.logger.error(`\u9886\u53D6${taskName}\u5931\u8D25`, summary) : taskList.push({ taskId, taskName });
    },
    async () => await $.sleep(6e3)
  ), taskList;
}
async function doTaskByHeaders($, headers) {
  try {
    let taskList = await getTaskList($, headers);
    await $.sleep(1e3);
    let stateList = await getTaskStateList($, headers);
    if (stateList.length === 0)
      return await _run(taskList, []);
    let _givenList = stateList.filter((sl) => sl.taskState === 1).map((el) => taskList.find((tl) => tl.taskId === el.taskId)), _taskList = stateList.filter((sl) => sl.taskState === 0).map((el) => taskList.find((tl) => tl.taskId === el.taskId));
    return await _run(_taskList, _givenList);
    async function _run(_taskList2, _givenList2) {
      await $.sleep(5e3);
      let givenList = await doTask($, _taskList2, headers);
      await $.sleep(4e3), givenList.push(..._givenList2), await givenWater($, givenList, headers);
    }
  } catch (error) {
    $.logger.error("\u4EFB\u52A1\u5F02\u5E38", error);
  }
}
async function givenWater($, tasks, headers) {
  await asyncForEach(
    tasks,
    async ({ taskName, taskId }) => {
      let { water, msg } = await request(
        $,
        $.gardenApi.givenWater,
        `\u9886\u53D6${taskName}\u6C34\u6EF4`,
        taskId,
        headers
      );
      water === 0 ? $.logger.error(`\u9886\u53D6${taskName}\u5956\u52B1\u5931\u8D25`, msg) : $.logger.debug(`\u9886\u53D6${taskName}\u5956\u52B1`);
    },
    async () => await $.sleep(6e3)
  );
}
async function gardenTask($) {
  try {
    $.logger.info("------\u3010\u679C\u56ED\u3011------");
    let token = await getSsoTokenApi($, $.config.phone);
    if (!token)
      return $.logger.error("\u8DF3\u8FC7\u679C\u56ED\u4EFB\u52A1");
    await loginGarden($, token, $.config.phone), await initTree($), await signInGarden($), await $.sleep(2e3), $.logger.info("\u9886\u53D6\u573A\u666F\u6C34\u6EF4"), await clickCartoon($, []), $.logger.info("\u5B8C\u6210\u90AE\u7BB1\u4EFB\u52A1"), await doTaskByHeaders($, {
      "user-agent": $.DATA.baseUA + $.DATA.mailUaEnd,
      "x-requested-with": $.DATA.mailRequested
    }), await $.sleep(2e3), $.logger.info("\u5B8C\u6210\u4E91\u76D8\u4EFB\u52A1"), await doTaskByHeaders($, {
      "user-agent": $.DATA.baseUA,
      "x-requested-with": $.DATA.mcloudRequested
    });
  } catch (error) {
    $.logger.error("\u679C\u56ED\u4EFB\u52A1\u5F02\u5E38", error);
  }
}

// ../../core/caiyun/gardenApi.ts
function createGardenApi(http) {
  let gardenUrl = "https://happy.mail.10086.cn/jsp/cn/garden";
  return {
    login(token, account) {
      return http.get(
        `${gardenUrl}/login/caiyunsso.do?token=${token}&account=${account}&targetSourceId=001208&sourceid=1014&enableShare=1`,
        {
          followRedirect: !1,
          native: !0
        }
      );
    },
    checkinInfo() {
      return http.get(`${gardenUrl}/task/checkinInfo.do`);
    },
    initTree() {
      return http.get(`${gardenUrl}/user/initTree.do`);
    },
    /**
     * 需要对应 ua
     */
    getTaskList(headers = {}) {
      return http.get(`${gardenUrl}/task/taskList.do?clientType=PE`, {
        headers
      });
    },
    getTaskStateList(headers = {}) {
      return http.get(`${gardenUrl}/task/taskState.do`, {
        headers
      });
    },
    checkin() {
      return http.get(`${gardenUrl}/task/checkin.do`);
    },
    clickCartoon(cartoonType) {
      return http.get(
        `${gardenUrl}/user/clickCartoon.do?cartoonType=${cartoonType}`
      );
    },
    doTask(taskId, headers = {}) {
      return http.get(
        `${gardenUrl}/task/doTask.do?taskId=${taskId}`,
        {
          headers
        }
      );
    },
    givenWater(taskId, headers = {}) {
      return http.get(
        `${gardenUrl}/task/givenWater.do?taskId=${taskId}`,
        {
          headers
        }
      );
    }
  };
}

// ../../core/caiyun/api.ts
function createApi(http) {
  let yun139Url = "https://yun.139.com", caiyunUrl = "https://caiyun.feixin.10086.cn", mnoteUrl = "https://mnote.caiyun.feixin.10086.cn";
  return {
    querySpecToken(account, toSourceId = "001005") {
      return http.post(
        `${yun139Url}/orchestration/auth-rebuild/token/v1.0/querySpecToken`,
        {
          toSourceId,
          account: String(account),
          commonAccountInfo: { account: String(account), accountType: 1 }
        },
        {
          headers: {
            referer: "https://yun.139.com/w/",
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "accept-language": "zh-CN,zh;q=0.9"
          }
        }
      );
    },
    authTokenRefresh(token, account) {
      return http.post(
        "https://aas.caiyun.feixin.10086.cn/tellin/authTokenRefresh.do",
        `<?xml version="1.0" encoding="utf-8"?><root><token>${token}</token><account>${account}</account><clienttype>656</clienttype></root>`,
        {
          headers: {
            accept: "*/*",
            "content-type": "application/json; charset=utf-8"
          },
          responseType: "text"
        }
      );
    },
    getNoteAuthToken: async function(token, account) {
      let headers = (await http.post(
        `${mnoteUrl}/noteServer/api/authTokenRefresh.do`,
        {
          authToken: token,
          userPhone: String(account)
        },
        {
          headers: {
            APP_CP: "pc",
            APP_NUMBER: String(account),
            CP_VERSION: "7.7.1.20240115"
          },
          native: !0
        }
      )).headers;
      if (headers.app_auth)
        return {
          app_auth: headers.app_auth,
          app_number: headers.app_number,
          note_token: headers.note_token
        };
    },
    syncNoteBook: function(headers) {
      return http.post(
        `${mnoteUrl}/noteServer/api/syncNotebook.do `,
        { addNotebooks: [], delNotebooks: [], updateNotebooks: [] },
        {
          headers: {
            APP_CP: "pc",
            CP_VERSION: "7.7.1.20240115",
            ...headers
          }
        }
      );
    },
    createNote: function(noteId, title, account, headers, tags = []) {
      return http.post(
        `${mnoteUrl}/noteServer/api/createNote.do`,
        {
          archived: 0,
          attachmentdir: "",
          attachmentdirid: "",
          attachments: [],
          contentid: "",
          contents: [
            {
              data: "<span></span>",
              noteId,
              sortOrder: 0,
              type: "TEXT"
            }
          ],
          cp: "",
          createtime: String(Date.now()),
          description: "",
          expands: { noteType: 0 },
          landMark: [],
          latlng: "",
          location: "",
          noteid: noteId,
          remindtime: "",
          remindtype: 0,
          revision: "1",
          system: "",
          tags,
          title,
          topmost: "0",
          updatetime: String(Date.now()),
          userphone: String(account),
          version: "",
          visitTime: String(Date.now())
        },
        {
          headers: {
            APP_CP: "pc",
            APP_NUMBER: String(account),
            CP_VERSION: "7.7.1.20240115",
            ...headers
          }
        }
      );
    },
    deleteNote(noteid, headers) {
      return http.post(
        `${mnoteUrl}/noteServer/api/moveToRecycleBin.do`,
        { noteids: [{ noteid }] },
        {
          headers: {
            APP_CP: "pc",
            CP_VERSION: "7.7.1.20240115",
            ...headers
          }
        }
      );
    },
    tyrzLogin: function(ssoToken) {
      return http.get(
        `${caiyunUrl}/portal/auth/tyrzLogin.action?ssoToken=${ssoToken}`
      );
    },
    signInInfo: function() {
      return http.get(
        `${caiyunUrl}/market/signin/page/info?client=app`
      );
    },
    getDrawInWx: function() {
      return http.get(`${caiyunUrl}/market/playoffic/drawInfo`);
    },
    drawInWx: function() {
      return http.get(`${caiyunUrl}/market/playoffic/draw`);
    },
    signInfoInWx: function() {
      return http.get(
        `${caiyunUrl}/market/playoffic/followSignInfo?isWx=true`
      );
    },
    getDisk(account, catalogID) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/catalog/v1.0/getDisk`,
        {
          commonAccountInfo: { account: String(account) },
          catalogID,
          catalogType: -1,
          sortDirection: 1,
          catalogSortType: 0,
          contentSortType: 0,
          filterType: 1,
          startNumber: 1,
          endNumber: 40
        }
      );
    },
    queryBatchList: function() {
      return http.post(
        "https://grdt.middle.yun.139.com/openapi/pDynamicInfo/queryBatchList",
        {
          encodeData: "WBvKN8KKSLovAM=",
          encodeType: 2,
          pageSize: 3,
          dynamicType: 2
        }
      );
    },
    pcUploadFileRequest(account, parentCatalogID, contentSize, contentName, digest) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/uploadAndDownload/v1.0/pcUploadFileRequest`,
        {
          commonAccountInfo: { account: String(account) },
          fileCount: 1,
          totalSize: contentSize,
          uploadContentList: [
            {
              contentName,
              contentSize,
              comlexFlag: 0,
              digest
            }
          ],
          newCatalogName: "",
          parentCatalogID,
          operation: 0,
          path: "",
          manualRename: 2,
          autoCreatePath: [],
          tagID: "",
          tagType: "",
          seqNo: ""
        }
      );
    },
    createBatchOprTask(account, contentIds) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/createBatchOprTask`,
        {
          createBatchOprTaskReq: {
            taskType: 2,
            actionType: 201,
            taskInfo: {
              contentInfoList: contentIds,
              catalogInfoList: [],
              newCatalogID: ""
            },
            commonAccountInfo: {
              account,
              accountType: 1
            }
          }
        }
      );
    },
    queryBatchOprTaskDetail(account, taskID) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/queryBatchOprTaskDetail`,
        {
          queryBatchOprTaskDetailReq: {
            taskID,
            commonAccountInfo: {
              account,
              accountType: 1
            }
          }
        }
      );
    },
    clickTask(id) {
      return http.get(
        `${caiyunUrl}/market/signin/task/click?key=task&id=${id}`
      );
    },
    getTaskList(marketname = "sign_in_3") {
      return http.get(
        `${caiyunUrl}/market/signin/task/taskList?marketname=${marketname}&clientVersion=`
      );
    },
    receive() {
      return http.get(`${caiyunUrl}/market/signin/page/receive`);
    },
    shake() {
      return http.post(
        `${caiyunUrl}/market/shake-server/shake/shakeIt?flag=1`
      );
    },
    beinviteHecheng1T() {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/beinvite`);
    },
    finishHecheng1T() {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/finish?flag=true`);
    },
    getOutLink(account, coIDLst, dedicatedName) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud-rebuild/outlink/v1.0/getOutLink`,
        {
          getOutLinkReq: {
            subLinkType: 0,
            encrypt: 1,
            coIDLst,
            caIDLst: [],
            pubType: 1,
            dedicatedName,
            period: 1,
            periodUnit: 1,
            viewerLst: [],
            extInfo: {
              isWatermark: 0,
              shareChannel: "3001"
            },
            commonAccountInfo: {
              account,
              accountType: 1
            }
          }
        }
      );
    },
    getBlindboxTask() {
      return http.post(
        `${caiyunUrl}/market/task-service/task/api/blindBox/queryTaskInfo`,
        {
          marketName: "National_BlindBox",
          clientType: 1
        },
        {
          headers: {
            accept: "application/json"
          }
        }
      );
    },
    registerBlindboxTask(taskId) {
      return http.post(
        `${caiyunUrl}/market/task-service/task/api/blindBox/register`,
        {
          marketName: "National_BlindBox",
          taskId
        },
        {
          headers: {
            accept: "application/json"
          }
        }
      );
    },
    blindboxUser() {
      return http.post(
        `${caiyunUrl}/ycloud/blindbox/user/info`,
        {},
        {
          headers: {
            accept: "application/json"
          }
        }
      );
    },
    openBlindbox() {
      return http.post(
        `${caiyunUrl}/ycloud/blindbox/draw/openBox?from=main`,
        {},
        {
          headers: {
            accept: "application/json",
            "x-requested-with": "cn.cj.pe",
            referer: "https://caiyun.feixin.10086.cn/",
            origin: "https://caiyun.feixin.10086.cn",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36(139PE_WebView_Android_10.2.2_mcloud139)"
          }
        }
      );
    },
    datacenter(base64) {
      return http.post(
        "https://datacenter.mail.10086.cn/datacenter/",
        `data=${base64}&ext=${"crc=" + hashCode(base64)}`,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            platform: "h5"
          }
        }
      );
    },
    getCloudRecord(pn = 1, ps = 10, type = 1) {
      return http.get(
        `${caiyunUrl}/market/signin/public/cloudRecord?type=${type}&pageNumber=${pn}&pageSize=${ps}`
      );
    }
  };
}

// ../../core/caiyun/index.ts
async function request2($, api, name, ...args) {
  try {
    let { code, message, msg, result } = await api(...args);
    if (code !== 0)
      $.logger.fatal(`${name}\u5931\u8D25`, code, message || msg);
    else
      return result;
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error);
  }
  return {};
}
async function getSsoTokenApi($, phone) {
  try {
    let specToken = await $.api.querySpecToken(phone);
    if (!specToken.success) {
      $.logger.fatal("\u83B7\u53D6 ssoToken \u5931\u8D25", specToken.message);
      return;
    }
    return specToken.data.token;
  } catch (error) {
    $.logger.error("\u83B7\u53D6 ssoToken \u5F02\u5E38", error);
  }
}
async function getJwtTokenApi($, ssoToken) {
  return (await request2($, $.api.tyrzLogin, "\u83B7\u53D6 ssoToken ", ssoToken)).token;
}
async function signInApi($) {
  return await request2($, $.api.signInInfo, "\u7F51\u76D8\u7B7E\u5230");
}
async function signInWxApi($) {
  return await request2($, $.api.signInfoInWx, "\u5FAE\u4FE1\u7B7E\u5230");
}
async function getJwtToken($) {
  let ssoToken = await getSsoTokenApi($, $.config.phone);
  if (ssoToken)
    return await getJwtTokenApi($, ssoToken);
}
async function refreshToken($) {
  try {
    let { token, phone } = $.config, tokenXml = await $.api.authTokenRefresh(token, phone);
    return tokenXml ? getXmlElement(tokenXml, "token") : $.logger.error("authTokenRefresh \u5931\u8D25");
  } catch (error) {
    $.logger.error("\u5237\u65B0 token \u5931\u8D25", error);
  }
}
async function signIn($) {
  let { todaySignIn, total, toReceive } = await signInApi($) || {};
  if ($.logger.info(`\u5F53\u524D\u79EF\u5206${total}${toReceive ? `\uFF0C\u5F85\u9886\u53D6${toReceive}` : ""}`), todaySignIn === !0) {
    $.logger.info("\u7F51\u76D8\u4ECA\u65E5\u5DF2\u7B7E\u5230");
    return;
  }
  await $.sleep(1e3);
  let info = await signInApi($);
  if (info) {
    if (info.todaySignIn === !1) {
      $.logger.info("\u7F51\u76D8\u7B7E\u5230\u5931\u8D25");
      return;
    }
    $.logger.info("\u7F51\u76D8\u7B7E\u5230\u6210\u529F");
  }
}
async function signInWx($) {
  let info = await signInWxApi($);
  if (info) {
    if (info.todaySignIn === !1 && ($.logger.error("\u5FAE\u4FE1\u7B7E\u5230\u5931\u8D25"), info.isFollow === !1)) {
      $.logger.info("\u5F53\u524D\u8D26\u53F7\u6CA1\u6709\u7ED1\u5B9A\u5FAE\u4FE1\u516C\u4F17\u53F7\u3010\u4E2D\u56FD\u79FB\u52A8\u4E91\u76D8\u3011");
      return;
    }
    $.logger.info("\u5FAE\u4FE1\u7B7E\u5230\u6210\u529F");
  }
}
async function wxDraw($) {
  try {
    let drawInfo = await $.api.getDrawInWx();
    if (drawInfo.code !== 0) {
      $.logger.error(
        `\u83B7\u53D6\u5FAE\u4FE1\u62BD\u5956\u4FE1\u606F\u5931\u8D25\uFF0C\u8DF3\u8FC7\u8FD0\u884C\uFF0C${JSON.stringify(drawInfo)}`
      );
      return;
    }
    if (drawInfo.result.surplusNumber < 50) {
      $.logger.info(
        `\u5269\u4F59\u5FAE\u4FE1\u62BD\u5956\u6B21\u6570${drawInfo.result.surplusNumber}\uFF0C\u8DF3\u8FC7\u6267\u884C`
      );
      return;
    }
    let draw = await $.api.drawInWx();
    if (draw.code !== 0) {
      $.logger.error(`\u5FAE\u4FE1\u62BD\u5956\u5931\u8D25\uFF0C${JSON.stringify(draw)}`);
      return;
    }
    $.logger.info(`\u5FAE\u4FE1\u62BD\u5956\u6210\u529F\uFF0C\u83B7\u5F97\u3010${draw.result.prizeName}\u3011`);
  } catch (error) {
    $.logger.error("\u5FAE\u4FE1\u62BD\u5956\u5F02\u5E38", error);
  }
}
async function receive($) {
  return await request2($, $.api.receive, "\u9886\u53D6\u4E91\u6735");
}
async function clickTask($, task) {
  try {
    let { code, msg } = await $.api.clickTask(task);
    if (code === 0)
      return !0;
    $.logger.error(`\u70B9\u51FB\u4EFB\u52A1${task}\u5931\u8D25`, msg);
  } catch (error) {
    $.logger.error(`\u70B9\u51FB\u4EFB\u52A1${task}\u5F02\u5E38`, error);
  }
  return !1;
}
async function pcUploadFileRequest($, path2) {
  try {
    let { success, message, data } = await $.api.pcUploadFileRequest(
      $.config.phone,
      path2,
      0,
      randomHex(4) + ".png",
      "d41d8cd98f00b204e9800998ecf8427e"
    );
    if (success && data && data.uploadResult)
      return data.uploadResult.newContentIDList.map(
        ({ contentID }) => contentID
      );
    $.logger.error("\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25", message);
  } catch (error) {
    $.logger.error("\u4E0A\u4F20\u6587\u4EF6\u5F02\u5E38", error);
  }
}
async function deleteFiles($, ids) {
  try {
    let {
      data: {
        createBatchOprTaskRes: { taskID }
      }
    } = await $.api.createBatchOprTask($.config.phone, ids);
    await $.api.queryBatchOprTaskDetail($.config.phone, taskID);
  } catch (error) {
    $.logger.error("\u5220\u9664\u6587\u4EF6\u5931\u8D25", error);
  }
}
function getParentCatalogID() {
  return "00019700101000000001";
}
async function getNoteAuthToken($) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone);
  } catch (error) {
    $.logger.error("\u83B7\u53D6\u4E91\u7B14\u8BB0 Auth Token \u5F02\u5E38", error);
  }
}
async function uploadFileDaily($) {
  if (!await clickTask($, 106)) {
    $.logger.info("\u63A5\u6536\u4EFB\u52A1\u5931\u8D25\uFF0C\u8DF3\u8FC7\u4E0A\u4F20\u4EFB\u52A1");
    return;
  }
  let contentIDs = await pcUploadFileRequest($, getParentCatalogID());
  contentIDs && setStoreArray($.store, "files", contentIDs);
}
async function createNoteDaily($) {
  if (!$.config.auth) {
    $.logger.info("\u672A\u914D\u7F6E authToken\uFF0C\u8DF3\u8FC7\u4E91\u7B14\u8BB0\u4EFB\u52A1\u6267\u884C");
    return;
  }
  let headers = await getNoteAuthToken($);
  if (!headers) {
    $.logger.info("\u83B7\u53D6\u9274\u6743\u4FE1\u606F\u5931\u8D25\uFF0C\u8DF3\u8FC7\u4E91\u7B14\u8BB0\u4EFB\u52A1\u6267\u884C");
    return;
  }
  try {
    let id = randomHex(32);
    await $.api.createNote(id, `${randomHex(3)}`, $.config.phone, headers), await $.sleep(2e3), await $.api.deleteNote(id, headers);
  } catch (error) {
    $.logger.error("\u521B\u5EFA\u4E91\u7B14\u8BB0\u5F02\u5E38", error);
  }
}
async function _clickTask($, id, currstep) {
  return {
    434: 22
  }[id] ? (await clickTask($, id), !0) : currstep === 0 ? await clickTask($, id) : !0;
}
async function dailyTask($) {
  var _a;
  $.logger.start("------\u3010\u6BCF\u65E5\u3011------");
  let { day } = await request2($, $.api.getTaskList, "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868");
  if (!day || !day.length)
    return $.logger.info("\u65E0\u4EFB\u52A1\u5217\u8868\uFF0C\u7ED3\u675F");
  let taskFuncList = { 106: uploadFileDaily, 107: createNoteDaily }, doingList = [];
  for (let taskItem of day)
    taskItem.state === "FINISH" || taskItem.enable !== 1 || await _clickTask($, taskItem.id, taskItem.currstep) && (await ((_a = taskFuncList[taskItem.id]) == null ? void 0 : _a.call(taskFuncList, $)), doingList.push(taskItem.id));
  if (doingList.length) {
    let { day: day2 } = await request2($, $.api.getTaskList, "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868");
    if (!day2 || !day2.length)
      return;
    for (let taskItem of day2)
      doingList.includes(taskItem.id) && taskItem.state === "FINISH" && $.logger.success(`\u5B8C\u6210\uFF1A${taskItem.name}`);
  }
}
async function shareTime($) {
  try {
    let files = $.store.files;
    if (!files || !files[0]) {
      $.logger.fail("\u672A\u83B7\u53D6\u5230\u6587\u4EF6\u5217\u8868\uFF0C\u8DF3\u8FC7\u5206\u4EAB\u4EFB\u52A1");
      return;
    }
    let { code, message } = await $.api.getOutLink(
      $.config.phone,
      [files[0]],
      ""
    );
    if (code === "0")
      return !0;
    $.logger.fail("\u5206\u4EAB\u94FE\u63A5\u5931\u8D25", code, message);
  } catch (error) {
    $.logger.error("\u5206\u4EAB\u94FE\u63A5\u5F02\u5E38", error);
  }
}
async function hotTask($) {
  var _a;
  $.logger.start("------\u3010\u70ED\u95E8\u4EFB\u52A1\u3011------");
  let { time } = await request2($, $.api.getTaskList, "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868");
  if (!time)
    return;
  let taskIds = [434], taskFuncList = { 434: shareTime };
  for (let taskItem of time)
    taskItem.state === "FINISH" || taskItem.enable !== 1 || taskIds.includes(taskItem.id) && await _clickTask($, taskItem.id, taskItem.currstep) && await ((_a = taskFuncList[taskItem.id]) == null ? void 0 : _a.call(taskFuncList, $)) && $.logger.success(`\u5B8C\u6210\uFF1A${taskItem.name}`);
}
async function monthTaskOnMail($) {
  let { month } = await request2(
    $,
    $.api.getTaskList,
    "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868",
    "newsign_139mail"
  );
  if (!month)
    return;
  let doingList = [];
  for (let taskItem of month)
    [1008, 1009, 1010, 1013, 1014, 1016, 1017].includes(taskItem.id) && taskItem.state !== "FINISH" && await _clickTask($, taskItem.id, taskItem.currstep) && doingList.push(taskItem.id);
  if (doingList.length) {
    let { month: month2 } = await request2(
      $,
      $.api.getTaskList,
      "\u83B7\u53D6\u4EFB\u52A1\u5217\u8868",
      "newsign_139mail"
    );
    if (!month2)
      return;
    for (let taskItem of month2)
      doingList.includes(taskItem.id) && taskItem.state === "FINISH" && $.logger.success(`\u5B8C\u6210\uFF1A${taskItem.name}`);
  }
}
async function shake($) {
  let { shakePrizeconfig, shakeRecommend } = await request2(
    $,
    $.api.shake,
    "\u6447\u4E00\u6447"
  );
  if (shakeRecommend)
    return $.logger.debug(shakeRecommend.explain || shakeRecommend.img);
  if (shakePrizeconfig)
    return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name);
}
async function shakeTask($) {
  $.logger.start("------\u3010\u6447\u4E00\u6447\u3011------");
  let { delay, num } = $.config.shake;
  for (let index = 0; index < num; index++)
    await shake($), index < num - 1 && await $.sleep(delay * 1e3);
}
async function shareFind($) {
  let phone = $.config.phone;
  try {
    let data = {
      traceId: Number(Math.random().toString().substring(10)),
      tackTime: Date.now(),
      distinctId: randomHex([14, 15, 8, 7, 15]),
      eventName: "discoverNewVersion.Page.Share.QQ",
      event: "$manual",
      flushTime: Date.now(),
      model: "",
      osVersion: "",
      appVersion: "",
      manufacture: "",
      screenHeight: 895,
      os: "Android",
      screenWidth: 393,
      lib: "js",
      libVersion: "1.17.2",
      networkType: "",
      resumeFromBackground: "",
      screenName: "",
      title: "\u3010\u7CBE\u9009\u3011\u4E00\u7AD9\u5F0F\u8D44\u6E90\u5B9D\u5E93",
      eventDuration: "",
      elementPosition: "",
      elementId: "",
      elementContent: "",
      elementType: "",
      downloadChannel: "",
      crashedReason: "",
      phoneNumber: phone,
      storageTime: "",
      channel: "",
      activityName: "",
      platform: "h5",
      sdkVersion: "1.0.1",
      elementSelector: "",
      referrer: "",
      scene: "",
      latestScene: "",
      source: "content-open",
      urlPath: "",
      IP: "",
      url: `https://h.139.com/content/discoverNewVersion?columnId=20&token=STuid00000${Date.now()}${randomHex(
        20
      )}&targetSourceId=001005`,
      elementName: "",
      browser: "Chrome WebView",
      elementTargetUrl: "",
      referrerHost: "",
      browerVersion: "122.0.6261.106",
      latitude: "",
      pageDuration: "",
      longtitude: "",
      urlQuery: "",
      shareDepth: "",
      arriveTimeStamp: "",
      spare: { mobile: phone, channel: "" },
      public: "",
      province: "",
      city: "",
      carrier: ""
    };
    await $.api.datacenter(Buffer.from(JSON.stringify(data)).toString("base64"));
  } catch (error) {
    $.logger.error("\u5206\u4EAB\u6709\u5956\u5F02\u5E38", error);
  }
}
function getCloudRecord($) {
  return request2($, $.api.getCloudRecord, "\u83B7\u53D6\u4E91\u6735\u8BB0\u5F55");
}
function getShareFindCount($) {
  if (!$.localStorage.shareFind)
    return 20;
  let { lastUpdate, count } = $.localStorage.shareFind;
  return (/* @__PURE__ */ new Date()).getMonth() === new Date(lastUpdate).getMonth() ? 20 - count : 20;
}
async function shareFindTask($) {
  $.logger.start("------\u3010\u9080\u8BF7\u597D\u53CB\u770B\u7535\u5F71\u3011------"), $.logger.info("\u6D4B\u8BD5\u4E2D\u3002\u3002\u3002");
  let count = getShareFindCount($);
  if (count <= 0) {
    $.logger.info("\u672C\u6708\u5DF2\u5206\u4EAB");
    return;
  }
  let _count = 20 - --count;
  await shareFind($), await $.sleep(1e3), await receive($), await $.sleep(1e3);
  let { records } = await getCloudRecord($), recordFirst = records == null ? void 0 : records.find((record) => record.mark === "fxnrplus5");
  if (recordFirst && (/* @__PURE__ */ new Date()).getTime() - new Date(recordFirst.updatetime).getTime() < 2e4) {
    for (; count > 0; )
      _count++, count--, $.logger.debug("\u9080\u8BF7\u597D\u53CB"), await shareFind($), await $.sleep(2e3);
    await receive($);
    let { records: records2 } = await getCloudRecord($);
    (records2 == null ? void 0 : records2.filter((record) => record.mark === "fxnrplus5").length) > 6 ? $.logger.info("\u5B8C\u6210") : $.logger.error("\u672A\u77E5\u60C5\u51B5\uFF0C\u65E0\u6CD5\u5B8C\u6210\uFF08\u6216\u5DF2\u5B8C\u6210\uFF09\uFF0C\u4ECA\u65E5\u8DF3\u8FC7");
  } else
    $.logger.error("\u672A\u77E5\u60C5\u51B5\uFF0C\u65E0\u6CD5\u5B8C\u6210\uFF08\u6216\u5DF2\u5B8C\u6210\uFF09\uFF0C\u672C\u6B21\u8DF3\u8FC7"), _count += 10;
  $.localStorage.shareFind = {
    lastUpdate: (/* @__PURE__ */ new Date()).getTime(),
    count: _count
  };
}
async function openBlindbox($) {
  try {
    let { code, msg, result } = await $.api.openBlindbox();
    switch (code) {
      case 0:
        return $.logger.info("\u83B7\u5F97", result.prizeName);
      case 200105:
      case 200106:
        return $.logger.info(code, msg);
      default:
        return $.logger.warn("\u5F00\u76F2\u76D2\u5931\u8D25", code, msg);
    }
  } catch (error) {
    $.logger.error("openBlindbox \u5F02\u5E38", error);
  }
}
async function registerBlindboxTask($, taskId) {
  await request2($, $.api.registerBlindboxTask, "\u6CE8\u518C\u76F2\u76D2", taskId);
}
async function getBlindboxCount($) {
  try {
    let taskList = await request2($, $.api.getBlindboxTask, "\u83B7\u53D6\u76F2\u76D2\u4EFB\u52A1");
    if (!taskList)
      return;
    let taskIds = taskList.reduce((taskIds2, task) => (task.status === 0 && taskIds2.push(task.taskId), taskIds2), []);
    for (let taskId of taskIds)
      await registerBlindboxTask($, taskId);
  } catch (e2) {
  }
}
async function blindboxTask($) {
  $.logger.start("------\u3010\u5F00\u76F2\u76D2\u3011------"), $.logger.fail("bug \u4FEE\u590D\u4E2D\uFF0C\u8DF3\u8FC7");
  try {
    await getBlindboxCount($);
    let { result, code, msg } = await $.api.blindboxUser();
    if (!result || code !== 0)
      return $.logger.error("\u83B7\u53D6\u76F2\u76D2\u4FE1\u606F\u5931\u8D25", code, msg), await openBlindbox($);
    if (result.isChinaMobile === 1 && $.logger.debug("\u5C0A\u656C\u7684\u79FB\u4E0D\u52A8\u7528\u6237"), (result == null ? void 0 : result.chanceNum) === 0) {
      $.logger.info("\u4ECA\u65E5\u65E0\u673A\u4F1A");
      return;
    }
    for (let index = 0; index < result.chanceNum; index++)
      await openBlindbox($);
  } catch (error) {
    $.logger.error("\u5F00\u76F2\u76D2\u4EFB\u52A1\u5F02\u5E38", error);
  }
}
function checkHc1T({ localStorage }) {
  if (localStorage.hc1T) {
    let { lastUpdate } = localStorage.hc1T;
    if ((/* @__PURE__ */ new Date()).getMonth() <= new Date(lastUpdate).getMonth())
      return !0;
  }
}
async function hc1Task($) {
  if ($.logger.start("------\u3010\u5408\u6210\u829D\u9EBB\u3011------"), checkHc1T($)) {
    $.logger.info("\u672C\u6708\u5DF2\u9886\u53D6");
    return;
  }
  try {
    await request2($, $.api.beinviteHecheng1T, "\u5408\u6210\u829D\u9EBB"), await $.sleep(5e3), await request2($, $.api.finishHecheng1T, "\u5408\u6210\u829D\u9EBB"), $.logger.success("\u5B8C\u6210\u5408\u6210\u829D\u9EBB");
  } catch (error) {
    $.logger.error("\u5408\u6210\u829D\u9EBB\u5931\u8D25", error);
  }
}
async function afterTask($) {
  try {
    $.store && $.store.files && await deleteFiles($, $.store.files);
  } catch (error) {
    $.logger.error("afterTask \u5F02\u5E38", error);
  }
}
async function run($) {
  let { config } = $, taskList = [
    signIn,
    signInWx,
    wxDraw,
    monthTaskOnMail,
    dailyTask,
    hotTask,
    shareFindTask,
    hc1Task,
    blindboxTask,
    receive
  ];
  config && (config.garden && config.garden.enable && taskList.push(gardenTask), config.shake && config.shake.enable && taskList.push(shakeTask));
  for (let task of taskList)
    await task($), await $.sleep(1e3);
  await afterTask($);
}
function getOldConfig(config) {
  let isAuthToken = (str) => str.includes("|");
  if (config.token && !config.auth) {
    config.auth = config.token, config.token = void 0;
    return;
  }
  if (!(config.auth && !config.token) && config.token && config.auth) {
    config.auth = isAuthToken(config.auth) ? config.token : config.auth;
    return;
  }
}
function getTokenExpireTime(token) {
  return Number(token.split("|")[3]);
}
function isNeedRefresh(token) {
  return getTokenExpireTime(token) - Date.now() < 432e6;
}
async function createNewAuth($) {
  let config = $.config;
  if (!isNeedRefresh(config.token))
    return;
  $.logger.info("\u5C1D\u8BD5\u751F\u6210\u65B0\u7684 auth");
  let token = await refreshToken($);
  if (token)
    return Buffer.from(
      // @ts-ignore
      `${config.platform}:${config.phone}:${token}`
    ).toString("base64");
  $.logger.error("\u751F\u6210\u65B0 auth \u5931\u8D25");
}

// index.ts
var _conf = require('@asunajs/conf');
var _push = require('@asunajs/push');

// ../../packages/utils/index.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
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
function _getLocalStorage(path2) {
  return _fs.existsSync.call(void 0, path2) ? JSON.parse(_fs.readFileSync.call(void 0, path2, "utf-8")) : {};
}
function getLocalStorage(configPath, item) {
  try {
    return _getLocalStorage(_path2.default.resolve(_path.dirname.call(void 0, configPath), "asign.ls.json"))[item] || {};
  } catch (e3) {
  }
  return {};
}
function setLocalStorage(configPath, item, value) {
  try {
    let lsPath = _path2.default.resolve(_path.dirname.call(void 0, configPath), "asign.ls.json"), ls = _getLocalStorage(lsPath);
    ls[item] = value, _fs.writeFileSync.call(void 0, lsPath, JSON.stringify(ls));
  } catch (e) {
    console.error(e);
  }
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
var _toughcookie = require('tough-cookie');
async function main(config, localStorage = {}, option) {
  let logger = await createLogger({ pushData: option == null ? void 0 : option.pushData });
  if (config.phone.length !== 11 || !config.phone.startsWith("1")) {
    logger.info("auth \u683C\u5F0F\u89E3\u6790\u9519\u8BEF\uFF0C\u8BF7\u67E5\u770B\u662F\u5426\u586B\u5199\u6B63\u786E\u7684 auth");
    return;
  }
  let cookieJar = new (0, _toughcookie.CookieJar)(), DATA = {
    baseUA: "Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36",
    mailUaEnd: "(139PE_WebView_Android_10.2.2_mcloud139)",
    mailRequested: "cn.cj.pe",
    mcloudRequested: "com.chinamobile.mcloud"
  }, jwtToken, http = _nodegot.createRequest.call(void 0, {
    cookieJar,
    hooks: {
      beforeRequest: [
        (options) => {
          options.url.hostname === "caiyun.feixin.10086.cn" ? jwtToken && (options.headers.jwttoken = jwtToken) : options.headers.authorization = config.auth, options.native && (options.requestOptions.isReturnNativeResponse = !0);
        }
      ]
    },
    headers: {
      "user-agent": DATA.baseUA,
      "x-requested-with": DATA.mcloudRequested,
      charset: "utf-8",
      "content-type": "application/json;charset=UTF-8"
    }
  }), $ = {
    api: createApi(http),
    config,
    gardenApi: createGardenApi(http),
    logger,
    DATA,
    sleep,
    store: {},
    localStorage
  };
  if (logger.info("=============="), logger.info(`\u767B\u5F55\u8D26\u53F7\u3010${config.phone}\u3011`), jwtToken = await getJwtToken($), !jwtToken)
    return;
  await run($);
  let newAuth = await createNewAuth($);
  return logger.info(`==============

`), {
    newAuth,
    localStorage
  };
}
async function run2(inputPath) {
  let { config, path: path2 } = _conf.loadConfig.call(void 0, inputPath);
  if (!config)
    throw new Error("\u914D\u7F6E\u6587\u4EF6\u4E3A\u7A7A");
  let logger = await createLogger(), caiyun = config.caiyun;
  if (!caiyun || !caiyun.length)
    return logger.error("\u672A\u627E\u5230\u914D\u7F6E\u6587\u4EF6/\u53D8\u91CF");
  let pushData = [], ls = getLocalStorage(path2, "caiyun");
  for (let index = 0; index < caiyun.length; index++) {
    let c = caiyun[index];
    if (getOldConfig(c), !c.auth) {
      logger.error("\u8BE5\u914D\u7F6E\u4E2D\u4E0D\u5B58\u5728 auth");
      continue;
    }
    try {
      let authInfo = getAuthInfo(c.auth), { newAuth, localStorage } = await main(
        {
          ...c,
          ...authInfo
        },
        ls[authInfo.phone],
        { pushData }
      );
      newAuth && _conf.rewriteConfigSync.call(void 0, path2, ["caiyun", index, "auth"], newAuth), localStorage && (ls[authInfo.phone] = localStorage);
    } catch (error) {
      logger.error(error);
    }
  }
  setLocalStorage(path2, "caiyun", ls), await pushMessage({
    pushData,
    message: config.message,
    sendNotify: _push.sendNotify,
    createRequest: _nodegot.createRequest
  });
}



exports.main = main; exports.run = run2;
;(async () => { await module.exports.run(); })();
