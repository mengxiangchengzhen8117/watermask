const DEFAULT_ZINDEX = 1;
const DEFAULT_STYLE = {
  'display': 'block !important',
  'width': '100% !important',
  'height': '100% !important',
  'max-width': 'unset !important',
  'max-height': 'unset !important',
  'position': 'absolute !important',
  'top': '0 !important',
  'left': '0 !important',
  'padding': '0 !important',
  'margin': '0 !important',
  'pointer-events': 'none !important',
  'z-index': `${DEFAULT_ZINDEX} !important`
};
const MAX_LINE = 3;
const ONE_LINE_MAX_LEN = 12;

export default class WaterMask {
  constructor() {
    this.cacheMap = [];
    this.timer = null;
  }

  init(el, optionsData = {}) {
    const $el = !el || Object.prototype.toString.call(el) === '[object HTMLDivElement]' ? el : document.querySelector(el);
    if (!$el) return;

    const DefaultOptions = {
      texts: [],
      include: [],
      exclude: [],
      zIndex: DEFAULT_ZINDEX,
      style: {}
    };
    const options = { ...DefaultOptions, ...optionsData };
    options.texts = (options.texts?.filter(item => typeof item === 'string') || []).slice(0, MAX_LINE);
    if (!options.texts.length) {
      this.clear(null, $el);
      return;
    };

    if (options.texts.length == 1) {
      const item = options.texts[0];
      options.texts = [item.slice(0, ONE_LINE_MAX_LEN), item.slice(ONE_LINE_MAX_LEN, ONE_LINE_MAX_LEN * 2), item.slice(ONE_LINE_MAX_LEN * 2, ONE_LINE_MAX_LEN * 3)].filter(i => !!i);
    } else {
      options.texts = options.texts.map(item => {
        item = item.slice(0, ONE_LINE_MAX_LEN);
        return item;
      });
    }
    options.include = options.include?.filter(item => Object.prototype.toString.call(item) === '[object RegExp]' || Object.prototype.toString.call(item) === '[object String]') || [];
    options.exclude = options.exclude?.filter(item => Object.prototype.toString.call(item) === '[object RegExp]' || Object.prototype.toString.call(item) === '[object String]') || [];
    options.zIndex = parseInt(options.zIndex || DEFAULT_ZINDEX);
    options.style = options.style || {};

    let newItem = { $el, options };
    let { item, index } = this.find($el);
    if (item) {
      this.cacheMap[index].options = options;
      this.addWatermark(this.cacheMap[index], true);
    } else {
      this.cacheMap.push(newItem);
      this.addWatermark(newItem, true);
    }
    this.handleTimer();

    // 在窗口大小改变之后,自动触发加水印事件
    // window.onresize = () => {
    // }
  }

  addWatermark(item, isForceUpdate = false) {
    if (!item?.$el || !item.options) return;
    const $el = item.$el;
    const options = item.options;
    const children = $el.childNodes;
    const len = children.length;
    let dom;
    for (let i = len - 1; i >= 0; i--) {
      if (children[i]?.getAttribute && children[i]?.getAttribute('name') === 'watermask') {
        dom = children[i];
        break;
      }
    }

    // 先检查当前路由是否应该屏蔽水印，如果屏蔽且之前就创建过水印则直接隐藏
    const isHide = this.checkPathHide(options);
    if (isHide) {
      dom && (dom.style.display = 'none');
      return;
    } // else 交给checkStyle处理，里面有去检查display样式是否被改了

    // 再去检查是否有必要重新生成水印背景图：水印必要的styles被改了、兄弟节点z-index比水印高遮盖水印了、强制更新
    if (!isForceUpdate && this.checkStyle(dom, options) && this.checkBotherNode($el, item)) {
      return;
    }

    const base64Data = this.handleImageData(options);
    const styleObj = { ...DEFAULT_STYLE, background: base64Data, 'z-index': `${options.zIndex} !important` };
    let style = '';
    for (let k in styleObj) {
      style += `${k}: ${styleObj[k]};`;
    }
    // 没添加过则添加水印
    if (!dom) {
      dom = document.createElement('div');
      dom.setAttribute('name', 'watermask');
      dom.setAttribute('style', style);
      $el.appendChild(dom);
      console.log('watermask added.');
    } else { // 添加过则重新显示出来
      dom.setAttribute('style', style);
      console.log('watermask updated.');
    }
  }

  handleImageData(options) {
    const texts = options.texts;
    const style = options.style || {};
    // 利用canvas绘制水印信息
    let canvas = document.createElement('canvas');
    canvas.width = options.style.width || 400;
    canvas.height = options.style.height || 350;
    let xIndex = 10; // 绘制文本的 x 坐标
    let yIndex = canvas.height - 120; // 绘制文本的 y 坐标
    let xInterval = canvas.height / 10; // 数组中每个文案行间间隔
    const context = canvas.getContext('2d');

    const rotate = style.rotate && style.rotate <= 0 ? parseFloat(style.rotate) : -35;
    context.rotate(rotate * Math.PI / 180);
    context.font = style.font || 'lighter 20px Vedana'; // 'bold 10px Vedana';
    context.fillStyle = style.fillStyle || 'rgba(200, 200, 200, 0.35)'; // 'rgba(232,236,239, 0.60)';
    context.textAlign = style.textAlign || 'center';
    context.textBaseline = style.textBaseline || 'middle';
    for (let i = 0; i < texts.length; i++) {
      context.fillText(texts[i], xIndex, yIndex);
      yIndex += xInterval;
    }

    return 'url(' + canvas.toDataURL('image/png') + ') left top repeat';
  }

  // 检查是不是把水印元素的style改变了导致不显示水印，这时要更新水印样式
  checkStyle(dom, options) {
    if (!dom) return false;

    const styleStr = dom.getAttribute('style');
    let style = {};
    styleStr.split(';').forEach(p => {
      const arr = p.split(':');
      style[arr[0].trim()] = arr[1]?.trim() || '';
    });
    // 检查水印是否有背景图
    const hasBackgroud = !!dom?.style?.background?.match(/data:image\/png;base64/g);
    let isDefaultStyleValid = true;
    // 检查水印必要的样式属性及属性值是否被改了
    hasBackgroud && Object.keys(DEFAULT_STYLE).forEach(k => {
      let zIndexValid = true;
      if (k === 'z-index') {
        const s = (style[k] || '').replace(' !important', '').trim();
        zIndexValid = !!s && (s - 0 >= options.zIndex);
      }
      if (!zIndexValid || k != 'z-index' && DEFAULT_STYLE[k] != style[k]) {
        isDefaultStyleValid = false;
        return false;
      }
    });
    return hasBackgroud && isDefaultStyleValid;
  }

  // 检查是不是在兄弟节点中存在z-index>=, 导致不显示水印，这时要更新水印样式 调高水印的z-index
  checkBotherNode($el, item) {
    if ($el) {
      const len = $el.childNodes.length;
      let zIndex = item.options.zIndex;
      for (let i = len - 1; i >= 0; i--) {
        const dom = $el.childNodes[i];
        const zIndexValue = dom.style['z-index'] || '';
        if (zIndexValue != '' && (zIndexValue == zIndex && dom.getAttribute && dom.getAttribute('name') != 'watermask' || zIndexValue > zIndex)) {
          zIndex = parseInt(zIndexValue) + 1;
        }
      }
      if (item.options.zIndex != zIndex) {
        item.options.zIndex = zIndex;
        return false;
      }
    }
    return true;
  }

  // 某些路由下想屏蔽水印和定时器，但切换路由后又想能够显示出来， exclude优先级比include高，都不传则不限制任何url，所有el子孙元素都添加水印
  checkPathHide(options) {
    let isHide = false;
    options.exclude?.forEach(item => {
      if (location.pathname === item || Object.prototype.toString.call(item) === '[object RegExp]' && !!location.pathname.match(item)) {
        isHide = true;
        return false;
      }
    });
    if (!isHide && options.include?.length) {
      isHide = !options.include?.some(item => location.pathname === item || Object.prototype.toString.call(item) === '[object RegExp]' && !!location.pathname.match(item));
    }
    return isHide;
  }

  handleTimer(isCheckClear = false) {
    if (isCheckClear) {
      !this.cacheMap.length && this.timer && clearInterval(this.timer);
    } else {
      this.timer && clearInterval(this.timer);
      if (this.cacheMap.length) {
        this.timer = setInterval(() => {
          this.cacheMap.forEach(item => {
            this.addWatermark(item);
          });
        }, 3000);
      }
    }
  }

  find($el) {
    let result = { item: null, index: -1 };
    if (Object.prototype.toString.call($el) !== '[object HTMLDivElement]') return result;
    this.cacheMap.forEach((item, index) => {
      if ($el.isSameNode(item.$el)) {
        result = { item, index };
        return false;
      }
    });
    return result;
  }

  clear(item, el) {
    const $el = item ? item.$el : !el || Object.prototype.toString.call(el) === '[object HTMLDivElement]' ? el : document.querySelector(el);
    if (!$el) {
      return;
    }

    if (!item) {
      let { index } = this.find($el);
      if (index > -1) {
        this.cacheMap.splice(index);
      }
    }
    this.handleTimer(true);

    const children = $el.childNodes;
    const len = children.length;
    for (let i = len - 1; i >= 0; i--) {
      if (children[i]?.getAttribute && children[i]?.getAttribute('name') === 'watermask') {
        children[i].remove();
      }
    }
    console.log('watermask clear.');
  }

  clearAll() {
    this.cacheMap.forEach(item => {
      this.clear(item);
    });
  }
}