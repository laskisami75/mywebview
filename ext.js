
//====== Shorthand names ======
const GeneratorFunction = function*(){}.constructor
const Generator = function*(){}.constructor.prototype
const AsyncGeneratorFunction = async function*(){}.constructor
const AsyncGenerator = async function*(){}.constructor.prototype
const AsyncFunction = async function(){}.constructor
const defined = new Map()
const ent = Object.entries
const obj = Object.fromEntries
const arr = Array.from
const has = Reflect.has
const get = Reflect.get
const set = Reflect.set
const del = Reflect.deleteProperty
const def = Reflect.defineProperty
const keys = Reflect.ownKeys
const values = Object.values
const assign = Object.assign
const create = Object.create
const getProto = Object.getPrototypeOf
const setProto = Object.setPrototypeOf
const getDescs = Object.getOwnPropertyDescriptors
const getDesc = Object.getOwnPropertyDescriptor
const defProps = Object.defineProperties
const defProp = Object.defineProperty

//====== Hidden types ======
defineExt(globalThis, {
  Descriptor,
  GeneratorFunction,
  Generator,
  AsyncGeneratorFunction,
  AsyncGenerator,
  AsyncFunction,
  defined,
  ent,
  obj,
  arr,
  has,
  get,
  set,
  del,
  def,
  keys,
  values,
  assign,
  create,
  getProto,
  setProto,
  getDescs,
  getDesc,
  defProps,
  defProp,
})

//====== Symbols ======
defineExt(Symbol, {
  //entry: Symbol('Symbol.entry'),
  isConstructor: Symbol('Symbol.isConstructor'),
  isPrototype: Symbol('Symbol.isPrototype'),
})

//====== Builtin classes ======
const builtin = ent(getDescs(globalThis))
  .map(([name, desc]) => new Descriptor(globalThis, name, desc))
  .filter(s => s.type == 'method')
  .filter(s => has(s.value, 'prototype'))

builtin.forEach(s => {
  define(s.value, { [Symbol.isConstructor]: true })
  if (s.value !== Function)
    define(s.value.prototype, { [Symbol.isPrototype]: true })
})

//====== Utility classes ======
function Descriptor(inheritedFrom, name, desc) {
  return {
    name,
    ...desc,
    inheritedFrom,
    get type() {
      if (has(this, 'value')) {
       if (isfn(this.value))
          return 'method'
        return 'property'
      }
      if (this.get && this.set)
        return 'accessor'
      if (this.get)
        return 'getter'
      if (this.set)
        return 'setter'
      return 'unknown'
    },
    get [Symbol.toStringTag]() {
      return 'Descriptor'
    },
  }
}

//====== Define function ======
function allKeys(object) {
  return chain(object)
    .flatMap(keys)
    .unique()
}
function safeIter(value, max = 100000) {
  return arr(value[Symbol.iterator]().take(max))
}
function safeObj(value) {
  return { ...value }
}
function str(value) {
  return issym(value) ? value.toString() : `${value}`
}
function sym(value) {
  /*if (issym(value))
    return value
  const matches = value.match(/^Symbol\.(.+)$/)
  if (matches)
    return Symbol[m[1]]*/
  return issym(value) ? value : Symbol[value.replace(/(?<=^Symbol\.)(.+)$/, '$1')]
}
function len(value) {
  return value.length
}
function char(i) {
  return String.fromCharCode(i)
}
function saveAs(blob, name) {
  const a = elem('a[style="display: none"]')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = name
  
  body.append(a)
  a.click()
  
  a.remove()
  URL.revokeObjectURL(url)
}
function tryGet(value, key, thisArg) {
  try {
    return get(value, key, thisArg ?? value)
  }
  catch (e) {
    console.error(`Cannot get property '${key}' of`, value)
  }
}
function props(value, ...rest) {
  rest = rest.map(str).join('|').split('|').map(s => sym(s) ?? s)
  return rest.reduce((s, n) => assign(s, { [n]: value[n] }), {})
}
function except(value, ...rest) {
  const copy = { ...value }
  for (const key of rest)
    delete copy[key]
  return copy
}
function clear(value) {
  for (const key of keys(value))
    delete value[key]
  return value
}
function swap(value, a, b) {
  if (isobj(value)) {
    const entries = ent(value).swap(a, b)
    clear(value)
    return assign(value, obj(entries))
  }
}
function resolve(root, sel) {
  if (sel == undefined)
    return resolve(globalThis, root)
  
  const parts = sel.split(/[\.\[\]]+/g)
  return parts.reduce((s, n) => s[n], root)
}
function sharedEquals(a, b) {
  const aKeys = allKeys(a).filter(key => !isfn(a[key]))
  const bKeys = allKeys(b).filter(key => !isfn(b[key]))
  
  const sharedKeys = aKeys.reduce((s, n) => bKeys.includes(n) ? [...s, n] : s, [])
  for (const key of sharedKeys) {
    if (a[key] !== b[key])
      return false
  }
  return true
}
function defineExt(type, defs) {
  const data = ent(getDescs(defs))
    .map(([name, desc]) => new Descriptor(defs, name, desc))
    .map(({ name, type }) => ({ name, type }))
  defined.set(type, (defined.get(type) ?? []).concat(data))
  return define(type, defs)
}
function define(type, defs) {
  return defProps(type, getDescs(defs))
}

//====== Utility functions ======
function descs(object) {
  return chain(object)
    .flatMap(s => ent(getDescs(s))
      .map(([n, d]) => new Descriptor(s, n, d))
    )
    .uniqueBy(s => s.name)
    //.sort(s => s.name)
}
function desc(object, name) {
  const parent = chain(object).find(s => getDesc(s, name))
  return new Descriptor(parent, name, getDesc(parent, name))
}

//====== More utility functions ======
function json(object) {
  return JSON.stringify(object, null, 2)
    .replaceAll(`"`, `'`)
    .replaceAll(/(?<=^\s*)'([^']+)': (.+?)(?=,?$)/gm, '$1: $2')
}
function range(a, b) {
  if (b == undefined)
    return range(0, a)
  return Array.from({ length: b - a }, (_, i) => a + i)
}
function copy(str) {
  navigator.clipboard.writeText(str)
}
function time() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

//====== Global definitions ======
defineExt(globalThis, {
  allKeys,
  safeIter,
  safeObj,
  str,
  sym,
  len,
  char,
  saveAs,
  tryGet,
  props,
  except,
  clear,
  swap,
  resolve,
  sharedEquals,
  defineExt,
  define,
  descs,
  desc,
  json,
  range,
  copy,
  time,
  chain,
})

//====== Utility generators ======
function* chain(node, stop = Object) {
  while (node) {
    if (isobj(stop) && node === stop)
      break
    if ((isctor(stop) || isfn(stop)) && node === stop.prototype)
      break
    yield node
    node = getProto(node)
  }
}

//====== Global definitions ======
defineExt(globalThis, {
  chain,
})

//====== Utility tagged templates ======
function raw(strings, ...rest) {
  const raw = strings.raw.map(s => s.replaceAll(String.raw`\$`, '$'))
  return String.raw({ raw }, ...rest)
}
function apply(fn) {
  return (strings, ...rest) => {
    return String.raw({ raw: strings }, ...rest.map(fn))
  }
}
function regex(flag, ...rest) {
  if (!isstr(flag))
    return regex('')(flag, ...rest)
  return (strings, ...rest) => {
    return new RegExp(raw(strings, ...rest), flag)
  }
}
function node(strs, ...data) {
  //console.log('data', data)
  function isnode(s) {
    return s instanceof Node
  }
  function combine(strs, data) {
    const parts = [strs[0]]
    for (let i = 0; i < data.length; i++) {
      if (isnode(data[i])) {
        parts.push([data[i]])
        parts.push(strs[i+1])
      }
      else if (isarr(data[i]) && isnode(data[i][0])) {
        parts.push(data[i])
        parts.push(strs[i+1])
      }
      else {
        parts[parts.length-1] += data[i] + strs[i+1]
      }
    }
    return parts
  }
  function make(str) {
    const voidTags = [
      'area',  'base', 'br',    'col',
      'embed', 'hr',   'img',   'input',
      'link',  'meta', 'param', 'source',
      'track', 'wbr',
    ]
    return str.seqMatch(
      /^\s+/,
      /^>/,
      /^\/>(?<selfClosingTag>)/,
      /^<(?<openTag>[^\s\/>]+)/,
      /^<\/(?<closeTag>[^\s\/>]+)/,
      /^(?<name>[^=]+)="(?<value>[^"]+)"/,
      /^(?<name>[^=]+)='(?<value>[^']+)'/,
      /^(?<name>[^=]+)=(?<value>[^\s\/>]+)/,
      /^(?<name>[^\s\/>]+)(?<value>)/,
    )
    .map(s => s.groups)
    .filter(s => s)
    .reduce((s, n, i) => {
      if (has(n, 'openTag')) {
        s.tag = n.openTag
        if (voidTags.includes(n.openTag))
          s.type = 'selfClosingTag'
        else
          s.type = 'openTag'
      }
      if (has(n, 'closeTag')) {
        s.tag = n.closeTag
        s.type = 'closeTag'
      }
      if (has(n, 'selfClosingTag'))
        s.type = 'selfClosingTag'
      if (has(n, 'name'))
        s.attribs.push(n)
      return s
    },
    {
      attribs: [],
    })
  }
  
  const parts = combine(strs, data)
  //console.log('combine', parts)
  for (let i = 0; i < parts.length; i++) {
    if (isstr(parts[i])) {
      const masked = parts[i].mask(/"[^"]+"|'[^']+'/g)
      parts[i] = masked.str.split(/(?<=>)|(?=<)/g)
        .filter(s => s.test(/\S/))
        .map(s => masked.unmask(s))
    }
  }
  //console.log('parts', parts)
  
  const stack = [new DocumentFragment()]
  let underSvg = false
  for (const part of parts) {
    for (const str of part) {
      if (isstr(str)) {
        //console.log('str', str)
        if (str.startsWith('<')) {
          const making = make(str)
          //console.log('making', making)
          if (making.type == 'openTag' || making.type == 'selfClosingTag') {
            if (making.tag == 'svg')
              underSvg = true
            const el = underSvg
              ? document.createElementNS('http://www.w3.org/2000/svg', making.tag)
              : document.createElement(making.tag)
            for (const attr of making.attribs) {
              if (attr.name.startsWith('on'))
                el[attr.name] = Function(`return ${attr.value}`)()
              else
                el.setAttribute(attr.name, attr.value)
            }
            
            stack[stack.length-1].append(el)
            if (making.type == 'openTag')
              stack.push(el)
          }
          else if (making.type == 'closeTag') {
            if (making.tag == 'svg')
              underSvg = false
            stack.pop()
          }
        }
        else {
          stack[stack.length-1].append(new Text(str))
        }
      }
      else {
        stack[stack.length-1].append(str)
      }
    }
  }
  if (stack.length != 1) {
    console.error('Did you forget to close some of the html tags?', stack)
    throw new Error(`Invalid stack size (${stack.length})`, { cause: stack })
  }
  return stack[stack.length-1]
}

//====== Global definitions ======
defineExt(globalThis, {
  raw,
  apply,
  regex,
  node,
})

//====== Type helpers ======
function type(s) {
  if (s === null)
    return 'null'
  if (s === undefined)
    return 'undefined'
  //if (typeof s == 'object' && has(s, Symbol.entry))
  //  return 'entry'
  if (Array.isArray(s))
    return 'array'
  //if (s.constructor == Generator)
  //  return 'generator'
  //if (s instanceof Element)
  //  return 'element'
  //if (s instanceof Map)
  //  return 'map'
  if (typeof s == 'object' && is(s, RegExp))
    return 'regex'
  if (typeof s == 'object' && has(s, Symbol.iterator))
    return 'iterator'
  //if (typeof s == 'function' && has(s, Symbol.isConstructor))
  //  return 'constructor'
  return typeof s
}
function whatis(s) {
  if (isctor(s))
    return `${s.name}`
  return Object.prototype.toString.call(s).slice(8, -1)
}
function is(s, t) {
  return s instanceof t
}
function isnull(s) { return s == null }
function isundef(s) { return s == undefined }
function isstr(s) { return type(s) == 'string' }
function isnum(s) { return type(s) == 'number' }
function isbool(s) { return type(s) == 'boolean' }
function issym(s) { return type(s) == 'symbol' }
function isobj(s) { return type(s) == 'object' }
function isfn(s) { return type(s) == 'function' }
//function isent(s) { return type(s) == 'entry' }
function isbint(s) { return type(s) == 'bigint' }
function isarr(s) { return type(s) == 'array' }
//function isgen(s) { return type(s) == 'generator' }
function isgen(s) { return is(s, Generator) }
function isiter(s) { return type(s) == 'iterator' }
function isregex(s) { return type(s) == 'regex' }
//function iselem(s) { return type(s) == 'element' }
//function ismap(s) { return type(s) == 'map' }
//function isctor(s) { return type(s) == 'constructor' }
function isctor(s) { return own(s, Symbol.isConstructor) }
function isproto(s) { return own(s, Symbol.isPrototype) }
function isprim(s) { return isnull(s) || isundef(s) || isstr(s) || isnum(s) || isbool(s) || issym(s) || isbint(s) }
function arrof(s, inst) { return isarr(s) && s.length > 0 && s.every(s => is(s, inst)) }

//====== Global definitions ======
defineExt(globalThis, {
  type,
  whatis,
  is,
  isnull,
  isundef,
  isstr,
  isnum,
  isbool,
  issym,
  isobj,
  isfn,
  //isent,
  isbint,
  isarr,
  isgen,
  isiter,
  isregex,
  //iselem,
  //ismap,
  isctor,
  isproto,
  isprim,
  arrof,
})

//====== RegExp, Object, Array, String & Number ======
defineExt(RegExp.prototype, {
  replace(re, repl) {
    return regex`${this.source.replace(re, repl)}`
  },
  replaceAll(re, repl) {
    return regex`${this.source.replaceAll(re, repl)}`
  },
})
defineExt(RegExp, {
  escape(str) {
    return str.replace(/[()\[\]{}|\\^$*+?.]/g, '\\$&')
  },
})
defineExt(Array.prototype, {
  shuffle() {
    for (let i = this.length-1; i >= 0; i--) {
      const j = Math.random() * i | 0
      
      const temp = this[i]
      this[i] = this[j]
      this[j] = temp
    }
    return this
  },
  remove(value) {
    const index = this.findIndex(s => s === value)
    if (index > -1)
      this.splice(index, 1)
    return this
  },
  swap(a, b) {
    if (!isnum(a))
      a = this.indexOf(a)
    if (!isnum(b))
      b = this.indexOf(b)
    
    const temp = this[a]
    this[a] = this[b]
    this[b] = temp
    return this
  },
})
setProto(Array.prototype, new Proxy(Iterator.prototype, {
  get(target, key, thisArg) {
    if (issym(key))
      return get(target, key, thisArg)
    const num = Number(key)
    if (!isNaN(num))
      return thisArg.at(num)
    return get(target, key, thisArg)
  },
}))
const _slice = String.prototype.slice
defineExt(String.prototype, {
  toInt() {
    return parseInt(this)
  },
  toFloat() {
    return parseFloat(this)
  },
  toNumbers() {
    return this.match(/(-?\.\d+)|(-?\d+\.\d+)|(-?\d+)/g)
      .map(s => parseFloat(s))
  },
  test(re) {
    return re.test(this)
  },
  parseHTML() {
    return new DOMParser().parseFromString(this, 'text/html')
  },
  *seqMatch(...rest) {
    let i = 0
    while (i < this.length) {
      const m = rest.map(s => this.slice(i).match(s)).find(s => s)
      //console.log('m', m)
      if (!m)
        throw new Error('None of the regexes matched the current sequence', { cause: { sequence: this.slice(i) }})
      yield m
      
      i += m[0].length + m.index
    }
  },
  slice(a, b) {
    return _slice.call(this, isfn(a) ? a(this) : a, isfn(b) ? b(this) : b)
  },
  mask(re) {
    return this.matchAll(re)
      .reduce((s, n, i) => {
        s.str = s.str.replace(n[0], `\0${char(i+1)}`)
        s.rep.push(n[0])
        return s
      },
      {
        str: this.replaceAll('\0', '\0\0'),
        rep: [],
        replaceMask(re, repl) {
          for (let i = 0; i < this.rep.length; i++)
            this.rep[i] = this.rep[i].replace(re, repl)
        },
        unmask(str) {
          const rep = this.rep
          function _unmask(str) {
            for (let i = 0; i < rep.length; i++)
              str = str.replace(regex`(?<!\0)\0${char(i+1)}`, rep[i])
            str = str.replaceAll('\0\0', '\0')
            return str
          }
          
          str ??= this.str
          if (isstr(str))
            return _unmask(str)
          else if (isarr(str))
            return str.map(s => _unmask(s))
        },
      })
  },
  has(re) {
    return !!this.match(re)
  },
  matchBrace(i) {
    const braces = {
      '(': ')',
      '[': ']',
      '{': '}',
    }
    const brace = this[i]
    if (!keys(braces).includes(brace))
      return null
    
    let stack = 1
    while (stack > 0) {
      i++
      if (this[i] == brace)
        stack++
      else if (this[i] == braces[brace])
        stack--
    }
    return i
  },
  trimStart(re = /\s+/) {
    if (isstr(re))
      re = regex`^(?:${RegExp.escape(re)})+`
    else
      re = regex`^${re.source.replace(/^\^/, '')}`
    return this.replace(re, '')
  },
  trimEnd(re = /\s+/) {
    if (isstr(re))
      re = regex`(?:${RegExp.escape(re)})+$`
    else
      re = regex`${re.source.replace(/\$$/, '')}$`
    return this.replace(re, '')
  },
  trim(re = /\s+/) {
    return this.trimStart(re).trimEnd(re)
  },
  without(re = /\s+/g) {
    return this.replaceAll(re, '')
  },
})
defineExt(Number.prototype, {
  clamp(a, b) {
    return max(a, min(b, this))
  },
  fixed(digits) {
    return this.toFixed(digits)
      .replace(/(?<=\..*?)0+$/, '')
      .replace(/\.$/, '')
      .replace(/(?<=^-)0\.|^0\./, '.')
  },
})

//====== Proxy ======
const proxies = new WeakSet()
const _Proxy = Proxy
defineExt(globalThis, {
  Proxy: new Proxy(Proxy, {
    construct(target, args) {
      const proxy = new _Proxy(...args)
      proxies.add(proxy)
      return proxy
    },
    get(target, key, thisArg) {
      if (key == Symbol.hasInstance)
        return inst => proxies.has(inst)
      return get(target, key, thisArg)
    }
  }),
})

//====== Date ======
defineExt(Date.prototype, {
  localeTime() {
    return this.toLocaleTimeString('en-GB')
  },
  localeDate() {
    return this.toLocaleDateString('en-GB')
  },
  localeFull() {
    return `${this.localeTime()} ${this.localeDate()}`
  },
})

//====== FileList & File ======
if (has(globalThis,  'FileList')) {
  defineExt(FileList.prototype, {
    add(...rest) {
      const transfer = new DataTransfer()
      for (const file of this)
        transfer.items.add(file)
      for (const file of rest)
        transfer.items.add(file)
      return transfer.files
    },
  })
  defineExt(FileList, {
    get empty() {
      return new DataTransfer().files
    },
  })
}
defineExt(File.prototype, {
  read() {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.readAsDataURL(this)
    })
  },
  readText() {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.readAsText(this)
    })
  },
})

//====== Image ======
if (has(globalThis,  'Image')) {
  defineExt(Image, {
    load(url) {
      return new Promise(resolve => {
        const img = new Image()
        img.onload = e => resolve(e.target)
        img.src = url
      })
    },
  })
  defineExt(Image.prototype, {
    resize(width, height) {
      width ??= this.naturalWidth * (height / this.naturalHeight)
      height ??= this.naturalHeight * (width / this.naturalWidth)
      
      const canvas = elem('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this, 0, 0, width, height)
      
      const url = canvas.toDataURL('image/jpeg', 1)
      //this.src = url
      //return Image.load(url)
      return url
    },
  })
}

//====== Iterator ======
function compareFn(fn = String) {
  return (a, b) => {
    return fn(a) > fn(b) ? 1 : -1
  }
}
/*defineExt(Generator.prototype, {
  _arr: [],
  _ind: 0,
  _next: Generator.prototype.next,
  next(arg) {
    //if (this._ind == 0)
    //  this._arr = arr(this)
    const result = this._next(arg)
    if (!result.done)
      this._arr.push(result.value)
    return result
  },
})*/
defineExt(Iterator.prototype, {
  clone() {
    return Iterator.clonable(this).clone()
  },
  join(sep = '') {
    return this.reduce((s, n) => s + sep + n, '')
  },
  flat() {
    return arr(this).flat()
  },
  unique() {
    return arr(new Set(this))
  },
  *uniqueBy(fn) {
    const set = new Set()
    for (const item of this) {
      const key = fn(item)
      if (!set.has(key)) {
        yield item
        set.add(key)
      }
    }
  },
  sort(fn) {
    if (fn === undefined)
      fn = compareFn()
    else if (fn.length == 1)
      fn = compareFn(fn)
    return arr(this).sort(fn)
  },
  equals(other) {
    if (!other)
      return false
    const clone = arr(this.clone())
    if (clone.length != other.length)
      return false
    for (let i = 0; i < other.length; i++) {
      if (clone[i] !== other[i])
        return false
    }
    return true
  },
  byMin(fn) {
    const clone = arr(this.clone())
    const value = min(...clone.map(fn))
    return clone.find(s => fn(s) == value)
  },
  byMax(fn) {
    const clone = arr(this.clone())
    const value = max(...clone.map(fn))
    return clone.find(s => fn(s) == value)
  },
  min(fn = s => s) {
    return min(...this.map(fn))
  },
  max(fn = s => s) {
    return max(...this.map(fn))
  },
  count(fn) {
    return this.reduce((s, n) => fn(n) ? s+1 : s, 0)
  },
  chunk(num) {
    const output = []
    for (let i = 0; i < this.length; i += num) {
      const temp = []
      for (let j = i; j < i + num && j < this.length; j++)
        temp.push(this[j])
      output.push(temp)
    }
    return output
  },
  groupBy(fn) {
    return Object.groupBy(this, fn)
  },
  toObject() {
    const data = arr(this.clone())
    if (data.length == 0)
      return {}
    if (isarr(data[0]))
      return obj(data)
    if (has(data[0], 'key'))
      return obj(data.map(s => [s.key, s]))
    if (has(data[0], 'name'))
      return obj(data.map(s => [s.name, s]))
    return null
  },
})
defineExt(Iterator, {
  clonable(it) {
    const vals = []
    return function make(n) {
      return assign(create(Iterator.prototype), {
        next(arg) {
          if (n >= vals.length)
            vals[vals.length] = it.next(arg)
          return vals[n++]
        },
        clone() {
          return make(n)
        },
      })
    }(0)
  },
})

//====== Console ======
const _log = console.log
defineExt(console, {
  _log,
  log(...rest) {
    function isarrfn(fn) {
      return isfn(fn) && str(fn)
        .without()
        .without(/{[^}]+}/g)
        .without(/\([^\)]+\)/g)
        .test(/=>/)
    }
    if (isarrfn(rest[0])) {
      const names = str(rest[0])
        .without()
        .replace(/^\(\)=>\[(.+)\]$/, '$1')
        .split(',')
      const entries = rest[0]()
        .flatMap((s, i) => [names[i], s])
      _log(...entries)
    }
    else {
      //_log(...rest.map(s => isgen(s) || isiter(s) ? arr2(s) : s))
      _log(...rest.map(s => {
        if (isiter(s))
          return safeIter(s)
        if (s instanceof Proxy)
          return { ...s }
        return s
      }))
    }
  },
})

//====== Math ======
defineExt(Math, {
  deg(rad) {
    return rem(rad * (180 / pi), 360)
  },
  rem(value, max) {
    return (value % max + max) % max
  },
  lerp(a, b, t) {
    return a + t * (b - a)
  },
  unlerp(a, b, value) {
    return (value - a) / (b - a)
  },
})
defineExt(globalThis, {
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  atan2: Math.atan2,
  hypot: Math.hypot,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  random: Math.random,
  pi: Math.PI,
  
  deg: Math.deg,
  rem: Math.rem,
  lerp: Math.lerp,
  unlerp: Math.unlerp,
})

//====== Storage ======
if (has(globalThis,  'Storage')) {
  defineExt(Storage.prototype, {
    list() {
      return range(this.length)
        .map(s => this.key(s))
        .map(s => [s, this.getItem(s)])
    },
    get(key) {
      const str = this.getItem(key)
      if (str)
        return JSON.parse(str)
    },
    set(key, value) {
      const str = JSON.stringify(value)
      this.setItem(key, str)
    },
  })
}

//====== Location ======
defineExt(Location.prototype, {
  get params() {
    const location = this
    const params = new URLSearchParams(this.search)
    
    return define(obj(params.entries()), {
      set(key, value) {
        this[key] = value
        params.set(key, value)
        location.search = params.toString()
      },
      get(key) {
        return params.get(key)
      },
    })
  }
})

//====== Global ======
function $(sel, root) {
  return (root ?? document).querySelector(sel)
}
function $$(sel, root) {
  return arr((root ?? document).querySelectorAll(sel))
}
function $$$(sel, root) {
  const arr = []
  
  const traverser = node => {
    if (node.nodeType !== Node.ELEMENT_NODE)
      return
    
    if (node.matches(sel))
      arr.push(node)
    
    for (const child of node.children)
      traverser(child)
    
    if (node.shadowRoot) {
      for (const child of node.shadowRoot.children)
        traverser(child)
    }
  }
  
  traverser(root ?? body)
  
  return arr
}
function selector(sel) {
  return sel.seqMatch(
      /^\[(?<name>[^=]+)="(?<value>[^"]+)"\]/,
      /^\[(?<name>[^=]+)='(?<value>[^']+)'\]/,
      /^\[(?<name>[^=]+)=(?<value>\S+)\]/,
      /^\[(?<name>[^=]+)(?<value>)\]/,
      /^\.(?<class>[^\.\#\[\]]+)/,
      /^\#(?<id>[^\.\#\[\]]+)/,
      /^(?<tag>[^\.\#\[\]]+)/,
    )
    .map(s => s.groups)
    .reduce((s, n, i) => {
      if (n.tag && i == 0)
        s.tag = n.tag
      if (n.id)
        s.id = n.id
      if (n['class'])
        s.classes.push(n['class'])
      if (n.name)
        s.attribs.push(n)
      return s
    },
    {
      tag: 'div',
      classes: [],
      attribs: [],
    })
}
function elem(sel, ...children) {
  const { tag, id, classes, attribs } = selector(sel ?? '')
  const el = document.createElement(tag)
  if (id)
    el.id = id
  if (classes.length > 0)
    el.classList.add(...classes)
    
  for (const attr of attribs) {
    if (attr.name.startsWith('on'))
      el[attr.name] = Function(`return ${attr.value}`)()
    else
      el.setAttribute(attr.name, attr.value)
  }
  //attribs.forEach(s => el.setAttribute(s.name, s.value))
  el.append(...children.filter(s => s))
  return el
}

defineExt(globalThis, {
  $,
  $$,
  _$: $,
  _$$: $$,
  _console: console,
  selector,
  elem,
})

//====== Window, Element, Node & EventTarget ======
if (has(globalThis,  'Window')) {
  defineExt(Window.prototype, {
    get doc() {
      return this.document
    },
    get docElem() {
      return this.document.documentElement
    },
    get head() {
      return this.document.head
    },
    get body() {
      return this.document.body
    },
    get html() {
      return new XMLSerializer().serializeToString(this.document)
    },
    get scrollableElements() {
      return $$('*')
        .filter(s => s.scrollable)
    },
    get isWebView() {
      return navigator.userAgentData.brands.some(s => s.brand == 'Android WebView')
    },
    getClassCounts() {
      return $$('[class]')
        .flatMap(s => arr(s.classList))
        .reduce((s, n) => {
          if (!has(s, n))
            s[n] = 0
          s[n] += 1
          return s
        }, {})
    },
    elemFrom(x, y) {
      return document.elementFromPoint(x, y)
    },
    textNodes() {
      return arr(document.createNodeIterator(body, NodeFilter.SHOW_TEXT))
    },
  })
  defineExt(NodeIterator.prototype, {
    *[Symbol.iterator]() {
      let n = this.nextNode()
      while (n) {
        yield n
        n = this.nextNode()
      }
    },
  })
  defineExt(Element.prototype, {
    get rect() {
      return this.getBoundingClientRect()
    },
    get mark() {
      return this.outerHTML.replace(this.innerHTML, '…')
    },
    get scrollable() {
      return this.scrollHeight > this.clientHeight
    },
    get scrollAmount() {
      return this.scrollTop / (this.scrollHeight - innerHeight)
    },
    get scrolledToEnd() {
      return this.scrollHeight - this.scrollTop <= this.rect.height
    },
    swap(other) {
      const temp = this.nextElementSibling
      this.parentElement.insertBefore(this, other.nextElementSibling)
      this.parentElement.insertBefore(other, temp)
    },
    closest(sel) {
      let fn = isfn(sel) ? sel : s => s.matches(sel)
      
      let n = this
      while (n) {
        if (fn(n))
          return n
        n = n.parentElement
      }
    },
  })
  defineExt(Node.prototype, {
    get parent() {
      return this.parentElement
    },
    get next() {
      let n = this.nextSibling
      while (n && !(n instanceof Element))
        n = n.nextSibling
      return n
    },
    get prev() {
      let n = this.previousSibling
      while (n && !(n instanceof Element))
        n = n.previousSibling
      return n
    },
    serialize() {
      return new XMLSerializer().serializeToString(this)
    },
    remove() {
      this.parentNode.removeChild(this)
    },
    *chain() {
      let node = this
      while (node) {
        yield node
        node = node.parentElement
      }
    },
    selectText() {
      const range = this.ownerDocument.createRange()
      range.selectNode(this)
      getSelection().removeAllRanges()
      getSelection().addRange(range)
    },
  })
  defineExt(EventTarget.prototype, {
    dispatch(type, props = {}) {
      this.dispatchEvent(new (class extends Event {
        constructor() {
          super(type, props)
          define(this, props)
        }
      })())
    },
  })
}