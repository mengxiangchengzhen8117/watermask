const m = {
  display: "block !important",
  width: "100% !important",
  height: "100% !important",
  "max-width": "unset !important",
  "max-height": "unset !important",
  position: "absolute !important",
  top: "0 !important",
  left: "0 !important",
  padding: "0 !important",
  margin: "0 !important",
  "pointer-events": "none !important",
  "z-index": "1 !important"
}, b = 3, f = 12;
class y {
  constructor() {
    this.cacheMap = [], this.timer = null;
  }
  init(t, n = {}) {
    var h, o, d;
    const a = !t || Object.prototype.toString.call(t) === "[object HTMLDivElement]" ? t : document.querySelector(t);
    if (!a)
      return;
    const e = { ...{
      texts: [],
      include: [],
      exclude: [],
      zIndex: 1,
      style: {}
    }, ...n };
    if (e.texts = (((h = e.texts) == null ? void 0 : h.filter((c) => typeof c == "string")) || []).slice(0, b), !e.texts.length) {
      this.clear(null, a);
      return;
    }
    if (e.texts.length == 1) {
      const c = e.texts[0];
      e.texts = [c.slice(0, f), c.slice(f, f * 2), c.slice(f * 2, f * 3)].filter((x) => !!x);
    } else
      e.texts = e.texts.map((c) => (c = c.slice(0, f), c));
    e.include = ((o = e.include) == null ? void 0 : o.filter((c) => Object.prototype.toString.call(c) === "[object RegExp]" || Object.prototype.toString.call(c) === "[object String]")) || [], e.exclude = ((d = e.exclude) == null ? void 0 : d.filter((c) => Object.prototype.toString.call(c) === "[object RegExp]" || Object.prototype.toString.call(c) === "[object String]")) || [], e.zIndex = parseInt(e.zIndex || 1), e.style = e.style || {};
    let i = { $el: a, options: e }, { item: r, index: s } = this.find(a);
    r ? (this.cacheMap[s].options = e, this.addWatermark(this.cacheMap[s], !0)) : (this.cacheMap.push(i), this.addWatermark(i, !0)), this.handleTimer();
  }
  addWatermark(t, n = !1) {
    var c, x;
    if (!(t != null && t.$el) || !t.options)
      return;
    const a = t.$el, l = t.options, e = a.childNodes, i = e.length;
    let r;
    for (let p = i - 1; p >= 0; p--)
      if ((c = e[p]) != null && c.getAttribute && ((x = e[p]) == null ? void 0 : x.getAttribute("name")) === "watermask") {
        r = e[p];
        break;
      }
    if (this.checkPathHide(l)) {
      r && (r.style.display = "none");
      return;
    }
    if (!n && this.checkStyle(r, l) && this.checkBotherNode(a, t))
      return;
    const h = this.handleImageData(l), o = { ...m, background: h, "z-index": `${l.zIndex} !important` };
    let d = "";
    for (let p in o)
      d += `${p}: ${o[p]};`;
    r ? (r.setAttribute("style", d), console.log("watermask updated.")) : (r = document.createElement("div"), r.setAttribute("name", "watermask"), r.setAttribute("style", d), a.appendChild(r), console.log("watermask added."));
  }
  handleImageData(t) {
    const n = t.texts, a = t.style || {};
    let l = document.createElement("canvas");
    l.width = t.style.width || 400, l.height = t.style.height || 350;
    let e = 10, i = l.height - 120, r = l.height / 10;
    const s = l.getContext("2d"), h = a.rotate && a.rotate <= 0 ? parseFloat(a.rotate) : -35;
    s.rotate(h * Math.PI / 180), s.font = a.font || "lighter 20px Vedana", s.fillStyle = a.fillStyle || "rgba(200, 200, 200, 0.35)", s.textAlign = a.textAlign || "center", s.textBaseline = a.textBaseline || "middle";
    for (let o = 0; o < n.length; o++)
      s.fillText(n[o], e, i), i += r;
    return "url(" + l.toDataURL("image/png") + ") left top repeat";
  }
  // 检查是不是把水印元素的style改变了导致不显示水印，这时要更新水印样式
  checkStyle(t, n) {
    var r, s;
    if (!t)
      return !1;
    const a = t.getAttribute("style");
    let l = {};
    a.split(";").forEach((h) => {
      var d;
      const o = h.split(":");
      l[o[0].trim()] = ((d = o[1]) == null ? void 0 : d.trim()) || "";
    });
    const e = !!((s = (r = t == null ? void 0 : t.style) == null ? void 0 : r.background) != null && s.match(/data:image\/png;base64/g));
    let i = !0;
    return e && Object.keys(m).forEach((h) => {
      let o = !0;
      if (h === "z-index") {
        const d = (l[h] || "").replace(" !important", "").trim();
        o = !!d && d - 0 >= n.zIndex;
      }
      if (!o || h != "z-index" && m[h] != l[h])
        return i = !1, !1;
    }), e && i;
  }
  // 检查是不是在兄弟节点中存在z-index>=, 导致不显示水印，这时要更新水印样式 调高水印的z-index
  checkBotherNode(t, n) {
    if (t) {
      const a = t.childNodes.length;
      let l = n.options.zIndex;
      for (let e = a - 1; e >= 0; e--) {
        const i = t.childNodes[e], r = i.style["z-index"] || "";
        r != "" && (r == l && i.getAttribute && i.getAttribute("name") != "watermask" || r > l) && (l = parseInt(r) + 1);
      }
      if (n.options.zIndex != l)
        return n.options.zIndex = l, !1;
    }
    return !0;
  }
  // 某些路由下想屏蔽水印和定时器，但切换路由后又想能够显示出来， exclude优先级比include高，都不传则不限制任何url，所有el子孙元素都添加水印
  checkPathHide(t) {
    var a, l, e;
    let n = !1;
    return (a = t.exclude) == null || a.forEach((i) => {
      if (location.pathname === i || Object.prototype.toString.call(i) === "[object RegExp]" && location.pathname.match(i))
        return n = !0, !1;
    }), !n && ((l = t.include) != null && l.length) && (n = !((e = t.include) != null && e.some((i) => location.pathname === i || Object.prototype.toString.call(i) === "[object RegExp]" && !!location.pathname.match(i)))), n;
  }
  handleTimer(t = !1) {
    t ? !this.cacheMap.length && this.timer && clearInterval(this.timer) : (this.timer && clearInterval(this.timer), this.cacheMap.length && (this.timer = setInterval(() => {
      this.cacheMap.forEach((n) => {
        this.addWatermark(n);
      });
    }, 3e3)));
  }
  find(t) {
    let n = { item: null, index: -1 };
    return Object.prototype.toString.call(t) !== "[object HTMLDivElement]" || this.cacheMap.forEach((a, l) => {
      if (t.isSameNode(a.$el))
        return n = { item: a, index: l }, !1;
    }), n;
  }
  clear(t, n) {
    var i, r;
    const a = t ? t.$el : !n || Object.prototype.toString.call(n) === "[object HTMLDivElement]" ? n : document.querySelector(n);
    if (!a)
      return;
    if (!t) {
      let { index: s } = this.find(a);
      s > -1 && this.cacheMap.splice(s);
    }
    this.handleTimer(!0);
    const l = a.childNodes, e = l.length;
    for (let s = e - 1; s >= 0; s--)
      (i = l[s]) != null && i.getAttribute && ((r = l[s]) == null ? void 0 : r.getAttribute("name")) === "watermask" && l[s].remove();
    console.log("watermask clear.");
  }
  clearAll() {
    this.cacheMap.forEach((t) => {
      this.clear(t);
    });
  }
}
const g = new y(), E = {
  install(u, t = {}) {
    u.directive("watermask", {
      bind(n, a) {
        g.init(n, { ...t, ...a.value || {} });
      },
      update(n, a) {
        g.init(n, { ...t, ...a.value || {} });
      },
      unbind(n) {
        g.clear(null, n);
      }
    });
  },
  init(u, t) {
    g.init(u, t);
  },
  clear(u) {
    g.clear(null, u);
  },
  clearAll() {
    g.clearAll();
  }
};
export {
  E as default
};
