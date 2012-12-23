///import baidu.type;
///import baidu.merge;
///import baidu.setBack;
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