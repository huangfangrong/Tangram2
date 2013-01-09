///import baidu.fx;

/*
 * @description 取得当前元素的真实CSS值
 * @author meizz
 * @create 2012-12-21
 * @function
 * @name baidu.fx.getCurrentStyle
 * @grammer baidu.fx.getCurrentStyle(dom, key)
 * @param   {HTMLElement}   dom     DOM元素
 * @param   {String}        key     样式名
 * @return  {String}                样式值
 */
baidu.fx.getCurrentStyle = function(){
    var fn = document.documentElement.currentStyle
        ? function(dom, key){return dom.currentStyle ? dom.currentStyle[key] : dom.style[key];}
        : function(dom, key){
            var win = dom.ownerDocument.defaultView
                , style = win && win.getComputedStyle && win.getComputedStyle(dom, null)
                , value = style ? (style.getPropertyValue(key) || style[key]) : "";
            return value || dom.style[key];
        }
    return fn;
}();
