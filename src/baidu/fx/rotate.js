///import baidu.browser;
///import baidu.fx.create;
///import baidu.fx.getCurrentStyle;

/**
 * @description 旋转效果
 * @author meizz
 * @create 2012-12-21
 * @function
 * @name baidu.fx.rotate
 * @grammer baidu.fx.rotate(dom, [options])
 * @grammer baidu.fx(dom).rotate([options])
 * 
 */
baidu.fx.extend({
    rotate: function(element, ang, options) {
        var matrix = function(){
            var originKey, transformKey;
            if(baidu.browser.chrome || baidu.browser.safari){
                originKey = "-webkit-transform-origin";
                transformKey = "-webkit-transform";
            }else if(baidu.browser.firefox){
                originKey = "MozTransformOrigin";
                transformKey = "MozTransform";
            }else if(baidu.browser.opera){
                originKey = "OTransformOrigin";
                transformKey = "OTransform";
            }
            return baidu.browser.ie
            ? function(dom, M11, M12, M21, M22, origin){
                // TODO: origin 未实现
                var key = "DXImageTransform.Microsoft.Matrix";
                var style = dom.style;
                var w = dom.offsetWidth;
                var h = dom.offsetHeight;
                var dx = -w/2*M11+h/2*M21+w/2;
                var dy = -w/2*M21-h/2*M11+h/2;
                if(~ style.filter.indexOf(key)){
                    var matrix = dom.filters.item(key);
                    matrix.Dx = dx;
                    matrix.Dy = dy;
                    matrix.M11 = M11, matrix.M12 = M12, matrix.M21 = M21, matrix.M22 = M22;
                }else{
                    style.filter += " progid:" + key + "(M11=" + M11 + ", M12=" + M12 +", M21=" + M21 + ", M22=" + M22 + ", Dx="+ dx +", Dy="+ dy +", FilterType='bilinear')"; //, SizingMethod='auto expand' 设置圆心就不能设置SizingMethod，旋转时会裁掉一点边角
                }
            }
            : function(dom, M11, M12, M21, M22, origin){
                dom.style[originKey] = origin || "left top";
                dom.style[transformKey] = "matrix(" + [M11, M21, M12, M22].join(",") + ",0,0)";
            }
        }();


        var rotate = function(dom, ang, origin){
            var r = ang * Math.PI / 180;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
            matrix(dom, cos, -sin, sin, cos, origin || "center center");
        };

        var fx = baidu.fx.create(element, baidu.extend({
            initialize: function(){
                this.protect("WebkitTransformOrigin");
                this.protect("WebkitTransform");

                this.protect("MozTransformOrigin");
                this.protect("MozTransform");

                this.protect("MsTransformOrigin");
                this.protect("MsTransform");

                this.protect("OTransformOrigin");
                this.protect("OTransform");

                this.protect("transformOrigin");
                this.protect("transform");

                this.transformOrigin = this.transformOrigin || "center center";
            }
            ,render: function(schedule) {
                rotate(element, schedule * ang, this.transformOrigin);
            }
        }, options), "baidu.fx.rotate");

        return fx.play();
    }
});
