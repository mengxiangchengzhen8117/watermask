# watermask
Add watermark to the web page.

# Installation
## npm
```bash
$ npm i watermask -S
```
## yarn
```bash
$ yarn add watermask
```
# Usage
利用指令添加水印
```
main.js:
```javascript

import Vue from 'vue'
import WaterMask from 'watermask'

Vue.use(WaterMask)

```

use `v-watermask` work with raw HTML
```html
<div v-watermask="options"></div>
```

利用API添加水印
```
use API work with Component
```javascript
import WaterMask from 'watermask'
export default {
  data() {
    return {
      options: {
        texts: ['水印'],
        exclude: ['/login', /^\/common$/g]
      }
    }
  },
  mounted() {
    WaterMask.init(el, options); // 添加、更新 水印，el:支持传入dom选择器字符串 或 HTMLDivElement
  },
  beforeDestroy() {
    WaterMask.clear(el); // 销毁水印
  }
}
```
## Options
|key|description|default|options|
|:---|---|---|---|
| `texts`|文字数组，最多显示出3个|`[]`|`Array`|
|`include`|对指定url显示水印, 接受正则数组或字符串数组|`[]`|`Array`|
|`exclude`|对指定url屏蔽水印, 接受正则数组或字符串数组|`[]`|`Array`|
|`zIndex`|通过这个参数调整水印遮盖层级，例如调小点就不会遮盖弹窗等|`1`|`Number`|
|`style`|水印样式|`{}`|`Object`|
|`style.rotate`|水印文字倾斜角度|`-35`|`Number`|
|`style.width`|单个水印文字区域的宽度，可控制横向水印密度|`400`|`Number`|
|`style.height`|单个水印文字区域的高度，可控制纵向水印密度|`350`|`Number`|
|`style.font`|水印字体大小粗细|`lighter 20px Vedana`|`String`|
|`style.fillStyle`|水印字体颜色|`rgba(200, 200, 200, 0.35)`|`String`|
|`style.textAlign`|水印文本对齐|`center`|`String`|
|`style.textBaseline`|水印文本基线|`middle`|`String`|

## Methods
### 添加/更新水印
WaterMask.init(el, options); // el:支持传入dom选择器字符串 或 HTMLDivElement
### 销毁指定dom上的水印
WaterMask.clear(el);
### 销毁所有水印
WaterMask.clearAll();