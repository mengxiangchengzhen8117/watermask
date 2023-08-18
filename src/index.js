/**
 * 在指定dom上添加水印
 * 使用方法
 *
 * 当指令用：
 * import Vue from 'vue';
 * import WaterMask from 'watermask';
 * Vue.use(WaterMask, options);
 * <div v-watermask="options"></div>
 *
 * 当插件用：
 * import WaterMask from 'watermask';
 * mounted() { WaterMask.init(el, options); // 添加、更新 水印，el:支持传入dom选择器字符串 或 HTMLDivElement }
 * beforeDestroy() { WaterMask.clear(el); // 销毁水印 }
 *
 * options参数说明：
 * texts: [], // 文字数组，最多显示出3个，必传

 * include: [], // 指定url显示水印, 接受url正则数组或url字符串数组, 可选
 * exclude: [], // 对指定url屏蔽，不显示水印, 接受url正则数组或url字符串数组，可选
 * zIndex: 1, // 通过这个参数调整水印遮盖层级，例如调小点就不会遮盖弹窗等, 可选
 * style: { // 水印样式，可选, 默认值如下
 *   rotate: -35, // 水印文字倾斜角度
 *   width: 400, // 单个水印文字区域的宽度，可控制横向水印密度
 *   height: 350, // 单个水印文字区域的高度，可控制纵向水印密度
 *   font: 'lighter 20px Vedana', // 水印字体大小粗细
 *   fillStyle: 'rgba(200, 200, 200, 0.35)', // 水印字体颜色
 *   textAlign: 'center', // 水印文本对齐
 *   textBaseline: 'middle' // 水印文本基线
 * }
 *
 * API：
 * import WaterMask from 'watermask';
 * WaterMask.init(el, options); // 在指定dom上添加水印, el:支持传入dom选择器字符串 或 HTMLDivElement
 * WaterMask.clear(el); // 销毁指定dom上添加的水印
 * WaterMask.clearAll(); // 销毁所有水印
 */

import WaterMask from './watermask';

const waterMask = new WaterMask();

export default {
  install(Vue, options = {}) {
    Vue.directive('watermask', {
      bind(el, binding) {
        waterMask.init(el, { ...options, ...(binding.value || {}) });
      },
      update(el, binding) {
        waterMask.init(el, { ...options, ...(binding.value || {}) });
      },
      unbind(el) {
        waterMask.clear(null, el);
      }
    });
  },
  init(el, options) {
    waterMask.init(el, options);
  },
  clear(el) {
    waterMask.clear(null, el);
  },
  clearAll() {
    waterMask.clearAll();
  }
};