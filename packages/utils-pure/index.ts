/**
 * @param length 长度
 * @param part 当长度为数组时，填充
 * @returns
 */
export function randomHex(length: number | number[], pad = '-') {
  if (Array.isArray(length)) {
    return length.map((l) => randomHex(l, pad)).join(pad)
  }
  return Array.from({
    length,
  })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
}

export function getXmlElement(xml: string, tag: string) {
  const m = xml.match(`<${tag}>(.*)</${tag}>`)
  return m ? m[1] : ''
}

export interface LoggerPushData {
  type: string
  msg: string
  date: Date
}

export function createLogger(options?: { pushData: LoggerPushData[] }) {
  const wrap = (type: string, ...args: any[]) => {
    if (options && options.pushData) {
      const msg = args
        .reduce<string>((str, cur) => `${str} ${cur}`, '')
        .substring(1)
      options.pushData.push({ msg, type, date: new Date() })
    }
    console[type](...args)
  }
  return {
    info: (...args: any[]) => wrap('info', ...args),
    error: (...args: any[]) => wrap('error', ...args),
    debug: (...args: any[]) => wrap('info', ...args),
  }
}

export function getHostname(url: string) {
  return url.split('/')[2].split('?')[0]
}

export async function asyncForEach<I = any>(
  array: I[],
  task: (arg: I) => Promise<any>,
  cb?: () => Promise<any>,
) {
  const len = array.length
  for (let index = 0; index < len; index++) {
    const item = array[index]
    await task(item)
    if (index < len - 1) {
      cb && (await cb())
    }
  }
}

export function setStoreArray(
  store: Record<string, any>,
  key: string,
  values: any[],
) {
  if (Reflect.has(store, key)) {
    return Reflect.set(store, key, Reflect.get(store, key).concat(values))
  }
  return Reflect.set(store, key, values)
}

export function getAuthInfo(basicToken: string) {
  basicToken = basicToken.replace('Basic ', '')

  const rawToken = Buffer.from(basicToken, 'base64').toString('utf-8')
  const [platform, phone, token] = rawToken.split(':')

  return {
    phone,
    token,
    auth: `Basic ${basicToken}`,
    platform,
  }
}

export function hashCode(str: string) {
  if (typeof str !== 'string') {
    return 0
  }
  let hash = 0
  let char = null
  if (str.length == 0) {
    return hash
  }
  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}
