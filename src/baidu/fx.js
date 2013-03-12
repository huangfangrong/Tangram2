///import baidu.type;
///import baidu.merge;
///import baidu.setBack;
///import baidu.isElement;
///import baidu.createChain;
/**
 * @description 提供各种公共的动画功能
 * @author meizz
 * @create 2012-12-01
 * @function
 * @name baidu.fx
 * @grammer baidu.fx(dom|$dom)
 * @param   {Object}    $dom    被动画的DOM元素
 * @return  {Object}            $Fx 的实例
 */
baidu.fx = baidu.createChain("fx", function($dom){
    var type = baidu.type($dom),
        fx = new baidu.fx.$Fx();
    // 单个DOM元素
    if (type == "HTMLElement") $dom = [$dom];
    // DOM元素组
    else if (type == "$DOM" || (type == "object" && $dom.jquery)) baidu.setBack(this, $dom);
    // NodeList
    else if (type == "NodeList");
    // other
    else return null;

    return baidu.merge(fx, $dom);

}, function(){
    this.length = 0;
});
// [overwrite]
baidu.fx.extend = function(json) {
    var slice = Array.prototype.slice;

    for (var key in json) {
        var fx = baidu.fx[key] = json[key];

        var fn = function() {
            var arg = slice.call(arguments, 0);
            var array = slice.call(this, 0);

            for (var i=0, n=array.length; i<n; i++) {
                if ( baidu.isElement(array[i]) ) {
                    array[i] = fx.apply(null, [array[i]].concat(arg));
                } else {
                    array[i] = null;
                }
            }
            return array.length == 1 ? array[0] : array;
        }

        baidu.fx.fn[key] = fn;
        baidu.dom && baidu.dom.fn && (baidu.dom.fn[key] = fn);
    }
};