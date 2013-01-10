
// Copyright (c) 2009-2012, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


















var T, baidu = T = baidu || function(q, c) { return baidu.dom ? baidu.dom(q, c) : null; };

baidu.version = '2.0.1.2';
baidu.guid = "$BAIDU$";
baidu.key = "tangram_guid";

// Tangram 可能被放在闭包中
// 一些页面级别唯一的属性，需要挂载在 window[baidu.guid]上

var _ = window[ baidu.guid ] = window[ baidu.guid ] || {};
(_.versions || (_.versions = [])).push(baidu.version);

// 20120709 mz 添加参数类型检查器，对参数做类型检测保护
baidu.check = baidu.check || function(){};




 
baidu.lang = baidu.lang || {};




 
baidu.forEach = function( enumerable, iterator, context ) {
    var i, n, t;

    if ( typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if ( typeof n == "number" ) {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for ( i=0; i<n; i++ ) {

                t = enumerable[ i ] || (enumerable.charAt && enumerable.charAt( i ));

                // 被循环执行的函数，默认会传入三个参数(array[i], i, array)
                iterator.call( context || null, t, i, enumerable );
            }
        
        // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i=0; i<enumerable; i++) {
                iterator.call( context || null, i, i, i);
            }
        
        // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if ( enumerable.hasOwnProperty(i) ) {
                    iterator.call( context || null, enumerable[ i ], i, enumerable );
                }
            }
        }
    }

    return enumerable;
};



baidu.type = (function() {
    var objectType = {},
        nodeType = [, "HTMLElement", "Attribute", "Text", , , , , "Comment", "Document", , "DocumentFragment", ],
        str = "Array Boolean Date Error Function Number RegExp String",
        retryType = {'object': 1, 'function': '1'},//解决safari对于childNodes算为function的问题
        toString = objectType.toString;

    // 给 objectType 集合赋值，建立映射
    baidu.forEach(str.split(" "), function(name) {
        objectType[ "[object " + name + "]" ] = name.toLowerCase();

        baidu[ "is" + name ] = function ( unknow ) {
            return baidu.type(unknow) == name.toLowerCase();
        }
    });

    // 方法主体
    return function ( unknow ) {
        var s = typeof unknow;
        return !retryType[s] ? s
            : unknow == null ? "null"
            : unknow._type_
                || objectType[ toString.call( unknow ) ]
                || nodeType[ unknow.nodeType ]
                || ( unknow == unknow.window ? "Window" : "" )
                || "object";
    };
})();

// extend
baidu.isDate = function( unknow ) {
    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
};

baidu.isElement = function( unknow ) {
    return baidu.type(unknow) == "HTMLElement";
};

// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
baidu.isEnumerable = function( unknow ){
    return unknow != null
        && (typeof unknow == "object" || ~Object.prototype.toString.call( unknow ).indexOf( "NodeList" ))
    &&(typeof unknow.length == "number"
    || typeof unknow.byteLength == "number"     //ArrayBuffer
    || typeof unknow[0] != "undefined");
};
baidu.isNumber = function( unknow ) {
    return baidu.type(unknow) == "number" && isFinite( unknow );
};

// 20120903 mz 检查对象是否为一个简单对象 {}
baidu.isPlainObject = function(unknow) {
    var key,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    if ( baidu.type(unknow) != "object" ) {
        return false;
    }

    //判断new fn()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( unknow.constructor &&
        !hasOwnProperty.call(unknow, "constructor") &&
        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in unknow ) {}
    return key === undefined || hasOwnProperty.call( unknow, key );
};

baidu.isObject = function( unknow ) {
    return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null );
};







baidu.extend = function(depthClone, object) {
    var second, options, key, src, copy,
        i = 1,
        n = arguments.length,
        result = depthClone || {},
        copyIsArray, clone;
    
    baidu.isBoolean( depthClone ) && (i = 2) && (result = object || {});
    !baidu.isObject( result ) && (result = {});

    for (; i<n; i++) {
        options = arguments[i];
        if( baidu.isObject(options) ) {
            for( key in options ) {
                src = result[key];
                copy = options[key];
                // Prevent never-ending loop
                if ( src === copy ) {
                    continue;
                }
                
                if(baidu.isBoolean(depthClone) && depthClone && copy
                    && (baidu.isPlainObject(copy) || (copyIsArray = baidu.isArray(copy)))){
                        if(copyIsArray){
                            copyIsArray = false;
                            clone = src && baidu.isArray(src) ? src : [];
                        }else{
                            clone = src && baidu.isPlainObject(src) ? src : {};
                        }
                        result[key] = baidu.extend(depthClone, clone, copy);
                }else if(copy !== undefined){
                    result[key] = copy;
                }
            }
        }
    }
    return result;
};





baidu.global = baidu.global || (function() {
    var me = baidu._global_ = window[ baidu.guid ],
        // 20121116 mz 在多个tangram同时加载时有互相覆写的风险
        global = me._ = me._ || {};

    return function( key, value, overwrite ) {
        if ( typeof value != "undefined" ) {
            overwrite || ( value = typeof global[ key ] == "undefined" ? value : global[ key ] );
            global[ key ] =  value;

        } else if (key && typeof global[ key ] == "undefined" ) {
            global[ key ] = {};
        }

        return global[ key ];
    }
})();





baidu.browser = baidu.browser || function(){
    var ua = navigator.userAgent;
    
    var result = {
        isStrict : document.compatMode == "CSS1Compat"
        ,isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua)
        ,isWebkit: /webkit/i.test(ua)
    };

    try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua) :
            result.ie = document.documentMode || + RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua) :
            result.chrome = + RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
            result.safari = + (RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua) : 
            result.firefox = + RegExp['\x241'];
            break;
        
        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
            result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
            break;
    }
           
    baidu.extend(baidu, result);

    return result;
}();



baidu.id = function() {
    var maps = baidu.global("_maps_id")
        ,key = baidu.key;

    // 2012.12.21 与老版本同步
    window[ baidu.guid ]._counter = window[ baidu.guid ]._counter || 1;

    return function( object, command ) {
        var e
            ,str_1= baidu.isString( object )
            ,obj_1= baidu.isObject( object )
            ,id = obj_1 ? object[ key ] : str_1 ? object : "";

        // 第二个参数为 String
        if ( baidu.isString( command ) ) {
            switch ( command ) {
            case "get" :
                return obj_1 ? id : maps[id];
//            break;
            case "remove" :
            case "delete" :
                if ( e = maps[id] ) {
                    // 20120827 mz IE低版本(ie6,7)给 element[key] 赋值时会写入DOM树，因此在移除的时候需要使用remove
                    if (baidu.isElement(e) && baidu.browser.ie < 8) {
                        e.removeAttribute(key);
                    } else {
                        delete e[ key ];
                    }
                    delete maps[ id ];
                }
                return id;
//            break;
            default :
                if ( str_1 ) {
                    (e = maps[ id ]) && delete maps[ id ];
                    e && ( maps[ e[ key ] = command ] = e );
                } else if ( obj_1 ) {
                    id && delete maps[ id ];
                    maps[ object[ key ] = command ] = object;
                }
                return command;
            }
        }

        // 第一个参数不为空
        if ( obj_1 ) {
            !id && (maps[ object[ key ] = id = baidu.id() ] = object);
            return id;
        } else if ( str_1 ) {
            return maps[ object ];
        }

        return "TANGRAM__" + baidu._global_._counter ++;
    };
}();

baidu.id.key = "tangram_guid";

//TODO: mz 20120827 在低版本IE做delete操作时直接 delete e[key] 可能出错，这里需要重新评估，重写







baidu.regexp = baidu.regexp || function(maps){
    var modalReg = /[^mig]/;

    return function(reg, modal){
        var key, result;

        if ( baidu.isString(reg) ) {
        
            modalReg.test(modal) && (modal = "");
            key = reg + "$$" + (modal || "");
            (result = maps[ key ]) || (result = maps[ key ] = new RegExp( reg, modal ));
        
        } else if ( baidu.isRegExp(reg) ) {
        
            modal = (reg.global ? "g" : "") + (reg.ignoreCase ? "i" : "") + (reg.multiline ? "m" : "");
            key = reg.source + "$$" + modal;
            result = maps[key] || (maps[key] = reg);
        }

        // 注意：加了这句代码之后，会对 g 模式的 lastIndex 赋值的情况产生影响
        (result || (result = reg)) && reg.lastIndex > 0 && ( reg.lastIndex = 0 );
        return result;
    }
}( baidu.global("_maps_RegExp") );







baidu.merge = function(first, second) {
    var i = first.length,
        j = 0;

    if ( typeof second.length === "number" ) {
        for ( var l = second.length; j < l; j++ ) {
            first[ i++ ] = second[ j ];
        }

    } else {
        while ( second[j] !== undefined ) {
            first[ i++ ] = second[ j++ ];
        }
    }

    first.length = i;

    return first;
};



baidu.setBack = function(current, oldChain) {
    current._back_ = oldChain;
    current.getBack = function() {
        return this._back_;
    }
    return current;
};



baidu.isElement = function( unknow ) {
    return baidu.type(unknow) == "HTMLElement";
};






baidu.createChain = function(chainName, fn, constructor) {
    // 创建一个内部类名
    var className = chainName=="dom"?"$DOM":"$"+chainName.charAt(0).toUpperCase()+chainName.substr(1);
    var slice = Array.prototype.slice;

    // 构建链头执行方法
    var chain = baidu[chainName] = baidu[chainName] || fn || function(object) {
        return baidu.extend(object, baidu[chainName].fn);
    };

    // 扩展 .extend 静态方法，通过本方法给链头对象添加原型方法
    chain.extend = function(extended) {
        var method;

        // 直接构建静态接口方法，如 baidu.array.each() 指向到 baidu.array().each()
        for (method in extended) {
            // 20121128 这个if判断是防止console按鸭子判断规则将本方法识别成数组
            if (method != "splice") {
                chain[method] = function() {
                    var id = arguments[0];

                    // 在新版接口中，ID选择器必须用 # 开头
                    chainName=="dom" && baidu.type(id)=="string" && (id = "#"+ id);

                    var object = chain(id);
                    var result = object[method].apply(object, slice.call(arguments, 1));

                    // 老版接口返回实体对象 getFirst
                    return baidu.type(result) == "$DOM" ? result.get(0) : result;
                }
            }
        }
        return baidu.extend(baidu[chainName].fn, extended);
    };

    // 创建 链头对象 构造器
    baidu[chainName][className] = baidu[chainName][className] || constructor || function() {};

    // 给 链头对象 原型链做一个短名映射
    chain.fn = baidu[chainName][className].prototype;

    return chain;
};


baidu.overwrite = function(Class, list, fn) {
    for (var i = list.length - 1; i > -1; i--) {
        Class.prototype[list[i]] = fn(list[i]);
    }

    return Class;
};

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
            return array;
        }

        baidu.fx.fn[key] = fn;
        baidu.dom && baidu.dom.fn && (baidu.dom.fn[key] = fn);
    }
};




baidu.base = baidu.base || {blank: function(){}};



baidu.base.inherits = function (subClass, superClass, type) {
    var key, proto, 
        selfProps = subClass.prototype, 
        clazz = new Function();
        
    clazz.prototype = superClass.prototype;
    proto = subClass.prototype = new clazz();

    for (key in selfProps) {
        proto[key] = selfProps[key];
    }
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;

    // 类名标识，兼容Class的toString，基本没用
    typeof type == "string" && (proto._type_ = type);

    subClass.extend = function(json) {
        for (var i in json) proto[i] = json[i];
        return subClass;
    }
    
    return subClass;
};

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写






baidu.base.Class = (function() {
    var instances = (baidu._global_ = window[baidu.guid])._instances;
    instances || (instances = baidu._global_._instances = {});

    // constructor
    return function() {
        this.guid = baidu.id();
        this._decontrol_ || (instances[this.guid] = this);
    }
})();


baidu.extend(baidu.base.Class.prototype, {
    
    toString: baidu.base.Class.prototype.toString = function(){
        return "[object " + ( this._type_ || "Object" ) + "]";
    }

    
    ,dispose: function() {
        if (this.fire("ondispose")) {
            // decontrol
            delete baidu._global_._instances[this.guid];

            if (this._listeners_) {
                for (var item in this._listeners_) {
                    this._listeners_[item].length = 0;
                    delete this._listeners_[item];
                }
            }

            for (var pro in this) {
                if ( !baidu.isFunction(this[pro]) ) delete this[pro];
                else this[pro] = baidu.base.blank;
            }

            this.disposed = true;   //20100716
        }
    }

    
    ,fire: function(event, options) {
        baidu.isString(event) && (event = new baidu.base.Event(event));

        var i, n, list
            , t=this._listeners_
            , type=event.type
            // 20121023 mz 修正事件派发多参数时，参数的正确性验证
            , argu=[event].concat( Array.prototype.slice.call(arguments, 1) );
        !t && (t = this._listeners_ = {});

        // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
        baidu.extend(event, options || {});

        event.target = event.target || this;
        event.currentTarget = this;

        type.indexOf("on") && (type = "on" + type);

        baidu.isFunction(this[type]) && this[type].apply(this, argu);
        (i=this._options) && baidu.isFunction(i[type]) && i[type].apply(this, argu);

        if (baidu.isArray(list = t[type])) {
            for (i=0, n=list.length; i<n; i++) {
                list[i].apply(this, argu);
            }

            if (list.once) {
                for(i=list.once.length-1; i>-1; i--) list.splice(list.once[i], 1);
                delete list.once;
            }
        }

        return event.returnValue;
    }

    
    ,on: function(type, handler, once) {
        if (!baidu.isFunction(handler)) {
            return this;
        }

        var list, t = this._listeners_;
        !t && (t = this._listeners_ = {});

        type.indexOf("on") && (type = "on" + type);

        !baidu.isArray(list = t[type]) && (list = t[type] = []);
        if (once) {
            !list.once && (list.once = []);
            list.once.push(list.length);
        }
        t[type].push( handler );

        return this;
    }
    // 20120928 mz 取消on()的指定key

    ,once: function(type, handler) {
        return this.on(type, handler, true);
    }
    ,one: function(type, handler) {
        return this.on(type, handler, true);
    }

    
    ,off: function(type, handler) {
        var i, list,
            t = this._listeners_;
        if (!t) return this;

        // remove all event listener
        if (typeof type == "undefined") {
            for (i in t) {
                delete t[i];
            }
            return this;
        }

        type.indexOf("on") && (type = "on" + type);

        // 移除某类事件监听
        if (typeof handler == "undefined") {
            delete t[type];
        } else if (list = t[type]) {

            for (i = list.length - 1; i >= 0; i--) {
                list[i] === handler && list.splice(i, 1);
            }
        }

        return this;
    }
});



window["baiduInstance"] = function(guid) {
    return window[baidu.guid]._instances[ guid ];
}




baidu.base.Event = function(type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
    this.preventDefault = function() {this.returnValue = false;};
};


//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性


baidu.fx.Timeline = function(options) {
    baidu.base.Class.call(this);

    this.interval = 12;
    this.duration = 500;
    this.percent  = 0;  // 进度，0 到 1 (浮点小数)
    this.delay    = 0;  // 0立即执行 n延迟n毫秒 -1只实例化不执行(用于效果组合)
    this.delta    = 0;  // 每次脉冲的间隔步长
    this.from     = 0;
    this.to       = 1;
    this.fps      = 80; // max fps
    this.frames   = 0;  // min frames

    baidu.extend(this, options);
};

baidu.base.inherits(baidu.fx.Timeline, baidu.base.Class, "baidu.fx.Timeline").extend({

    launch: function(){return this.play();}

    ,_render_: function(percent){
        var me = this;

        me._frame_ ++;

        // 延时保帧
        if ( me.frames>0 && me._frame_/me.frames<percent ) {
            me.duration = Math.ceil(me.duration * percent * me.frames / me._frame_);
            me._endTime_= me._beginTime_ + me.duration;
        }

        me.delta = percent - me.percent;
        me.percent = percent;

        
        baidu.isFunction( me.render ) && me.render(me.transition(percent));
        me.fire("onupdate");
    }
    // 脉冲函数
    ,_pulsed_: function(first){
        var me = this
            , now = new Date().getTime();

        first && (me._endTime_ = (me._beginTime_ = now) + me.duration);

        // 时间线终点
        if (now >= me._endTime_) {
            me._render_(1);
            baidu.isFunction( me.finish ) && me.finish();

            me.fire("onfinish");
            me.fire("onafterfinish");
            me.dispose();
            return;
        }
        me._render_((now - me._beginTime_) / me.duration);

        me._timer_ = setTimeout(function(){me._pulsed_()}, me.interval);
    }
    ,transition: function(percent){return percent;}

    ,abort: function(){
        this._timer_ && clearTimeout(this._timer_);
        this.fire("onabort");
        this.dispose();
    }
    ,cancel: function(){
        this._timer_ && clearTimeout(this._timer_);
        this._endTime_ = this._beginTime_;

        baidu.isFunction( this.restore ) && this.restore();
        this.fire("oncancel");
        this.dispose();
    }
    ,end: function(){
        this._timer_ && clearTimeout(this._timer_);
        this._endTime_ = this._beginTime_;
        this._pulsed_();
    }
    ,pause: function(){
        this._timer_ && clearTimeout(this._timer_);
        this.fire("onpause");
    }
    ,play: function(){
        var me = this
            , first = !me._beginTime_
            , now = new Date().getTime();

        // first run
        if (first) {
            me.fire("onbeforestart");
            baidu.isFunction( me.initialize ) && me.initialize();
            me.fire("onstart");
            me._frame_ = 0;
            me.interval = Math.floor(1000 / me.fps);

            if (me.delay) {setTimeout(function(){me._pulsed_(first)}, me.delay)}
            else me._pulsed_(first);
        
        // pause replay
        } else {
            me._beginTime_ = now - parseInt(me.percent * me.duration);
            me._endTime_ = me._beginTime_ + me.duration;
            me._pulsed_();
        }

        return this;
    }
});






baidu.createChain('string',
    // 执行方法
    function(string){
        var type = baidu.type(string),
            str = new String(~'string|number'.indexOf(type) ? string : type),
            pro = String.prototype;
        baidu.forEach(baidu.string.$String.prototype, function(fn, key) {
            pro[key] || (str[key] = fn);
        });
        return str;
    }
);





 //支持单词以“-_”分隔
 //todo:考虑以后去掉下划线支持？
baidu.string.extend({
    toCamelCase : function () {
        var source = this.valueOf();
        //提前判断，提高getStyle等的效率 thanks xianwei
        if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
            return source;
        }
        return source.replace(/[-_][^-_]/g, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }
});



baidu.fx.create = function(element, options, fxName) {
    var timeline = new baidu.fx.Timeline(options);
    var maps = baidu.global("_maps_fx");
    var id = baidu.id(element);
    timeline.data = maps[id] = maps[id] || {guids:{}};
    timeline.original = {};
    timeline.element = element;
    timeline.attName = "att_"+ timeline._type_.replace(baidu.regexp("\\W", "g"), "_");

    
    timeline.protect = function(cssKey) {
        cssKey = baidu.string(cssKey).toCamelCase();
        this.original[cssKey] = this.element.style[cssKey];
    }
    
    timeline._clean_ = function() {
        var me = this;

        if (me.data) {
            delete me.data[me.attName];
            delete me.data.guids[me.guid];
        }
    };
    
    timeline._restore_ = function() {
        var o = this.original,
            s = this.element.style,
            value, i;

        for (i in o) {
            value = o[i];
            if (typeof value == "undefined") continue;

            s[i] = value;    // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!value && s.removeAttribute) s.removeAttribute(i);    // IE
            else if (!value && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    timeline.on("beforestart", function(){
        var me = this, guid, data = me.data;

        data.guids[me.guid] = true;

        if (!me.overlapping) {
            // old fx
            if (guid = data[me.attName]) {
                var old = baiduInstance(guid);
                old.cancel();
            }
            //[TODO]
    
            //记录当前效果的guid
            data[me.attName] = me.guid;
        }

    }).on("cancel", function(){
        this._clean_();
        this._restore_();

    }).on("afterfinish", function(){
        this._clean_();
        this.restoreAfterFinish && this._restore_();
    });

    return timeline;
};




/// support magic - support magic - Tangram 1.x Code End



baidu.fx.extend({
    collapse: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.collapse");

        var e = element, 
            value, 
            attr,
            attrHV = {
                "vertical": {
                    value: 'height',
                    offset: 'offsetHeight',
                    stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
                },
                "horizontal": {
                    value: 'width',
                    offset: 'offsetWidth',
                    stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
                }
            };

        var fx = baidu.fx.create(e, baidu.extend({
            orientation: 'vertical'
            
            //[Implement Interface] initialize
            ,initialize : function() {
                attr = attrHV[this.orientation];
                this.protect(attr.value);
                this.protect("overflow");
                this.restoreAfterFinish = true;
                value = e[attr.offset];
                e.style.overflow = "hidden";
            }

            //[Implement Interface] transition
            ,transition : function(percent) {return Math.pow(1 - percent, 2);}

            //[Implement Interface] render
            ,render : function(schedule) {
                e.style[attr.value] = Math.floor(schedule * value) +"px";
            }

            //[Implement Interface] finish
            ,finish : function(){e.style.display = "none";}
        }, options || {}), "baidu.fx.expand_collapse");

        return fx.play();
    }
});

// [TODO] 20100509 在元素绝对定位时，收缩到最后时会有一次闪烁












baidu.createChain("array", function(array){
    var pro = baidu.array.$Array.prototype
        ,ap = Array.prototype
        ,key;

    baidu.type( array ) != "array" && ( array = [] );

    for ( key in pro ) {
        ap[key] || (array[key] = pro[key]);
    }

    return array;
});

// 对系统方法新产生的 array 对象注入自定义方法，支持完美的链式语法
baidu.overwrite(baidu.array.$Array, "concat slice".split(" "), function(key) {
    return function() {
        return baidu.array( Array.prototype[key].apply(this, arguments) );
    }
});






baidu.array.extend({
    unique : function (fn) {
        var len = this.length,
            result = this.slice(0),
            i, datum;
            
        if ('function' != typeof fn) {
            fn = function (item1, item2) {
                return item1 === item2;
            };
        }
        
        // 从后往前双重循环比较
        // 如果两个元素相同，删除后一个
        while (--len > 0) {
            datum = result[len];
            i = len;
            while (i--) {
                if (fn(datum, result[i])) {
                    result.splice(len, 1);
                    break;
                }
            }
        }

        len = this.length = result.length;
        for ( i=0; i<len; i++ ) {
            this[ i ] = result[ i ];
        }

        return this;
    }
});



baidu.query = baidu.query || function(){
    var rId = /^(\w*)#([\w\-\$]+)$/
       ,rId0= /^#([\w\-\$]+)$/
       ,rTag = /^\w+$/
       ,rClass = /^(\w*)\.([\w\-\$]+)$/
       ,rComboClass = /^(\.[\w\-\$]+)+$/
       ,rDivider = /\s*,\s*/
       ,rSpace = /\s+/g
       ,slice = Array.prototype.slice;

    // selector: #id, .className, tagName, *
    function query(selector, context) {
        var t, x, id, dom, tagName, className, arr, list, array = [];

        // tag#id
        if (rId.test(selector)) {
            id = RegExp.$2;
            tagName = RegExp.$1 || "*";

            // 本段代码效率很差，不过极少流程会走到这段
            baidu.forEach(context.getElementsByTagName(tagName), function(dom) {
                dom.id == id && array.push(dom);
            });

        // tagName or *
        } else if (rTag.test(selector) || selector == "*") {
            baidu.merge(array, context.getElementsByTagName(selector));

        // .className
        } else if (rClass.test(selector)) {
            arr = [];
            tagName = RegExp.$1;
            className = RegExp.$2;
            t = " " + className + " ";
            // bug: className: .a.b

            if (context.getElementsByClassName) {
                arr = context.getElementsByClassName(className);
            } else {
                baidu.forEach(context.getElementsByTagName("*"), function(dom) {
                    dom.className && ~(" " + dom.className + " ").indexOf(t) && (arr.push(dom));
                });
            }

            if (tagName && (tagName = tagName.toUpperCase())) {
                baidu.forEach(arr, function(dom) {
                    dom.tagName.toUpperCase() === tagName && array.push(dom);
                });
            } else {
                baidu.merge(array, arr);
            }
        
        // IE 6 7 8 里组合样式名(.a.b)
        } else if (rComboClass.test(selector)) {
            list = selector.substr(1).split(".");

            baidu.forEach(context.getElementsByTagName("*"), function(dom) {
                if (dom.className) {
                    t = " " + dom.className + " ";
                    x = true;

                    baidu.forEach(list, function(item){
                        ~t.indexOf(" "+ item +" ") || (x = false);
                    });

                    x && array.push(dom);
                }
            });
        }

        return array;
    }

    // selector 还可以是上述四种情况的组合，以空格分隔
    // @return ArrayLike
    function queryCombo(selector, context) {
        var a, s = selector, id = "__tangram__", array = [];

        // 在 #id 且没有 context 时取 getSingle，其它时 getAll
        if (!context && rId0.test(s) && (a=document.getElementById(s.substr(1)))) {
            return [a];
        }

        context = context || document;

        // 用 querySelectorAll 时若取 #id 这种唯一值时会多选
        if (context.querySelectorAll) {
            // 在使用 querySelectorAll 时，若 context 无id将貌似 document 而出错
            if (context.nodeType == 1 && !context.id) {
                context.id = id;
                a = context.querySelectorAll("#" + id + " " + s);
                context.id = "";
            } else {
                a = context.querySelectorAll(s);
            }
            return a;
        } else {
            if (!~s.indexOf(" ")) {
                return query(s, context);
            }

            baidu.forEach(query(s.substr(0, s.indexOf(" ")), context), function(dom) { // 递归
                baidu.merge(array, queryCombo(s.substr(s.indexOf(" ") + 1), dom));
            });
        }

        return array;
    }

    return function(selector, context, results) {
        if (!selector || typeof selector != "string") {
            return results || [];
        }

        var arr = [];
        selector = selector.replace(rSpace, " ");
        results && baidu.merge(arr, results) && (results.length = 0);

        baidu.forEach(selector.indexOf(",") > 0 ? selector.split(rDivider) : [selector], function(item) {
            baidu.merge(arr, queryCombo(item, context));
        });

        return baidu.merge(results || [], baidu.array(arr).unique());
    };
}();













baidu.createChain("dom",

// method function


function(selector, context) {
    var e, me = new baidu.dom.$DOM(context);

    // Handle $(""), $(null), or $(undefined)
    if (!selector) {
        return me;
    }

    // Handle $($DOM)
    if (selector._type_ == "$DOM") {
        return selector;

    // Handle $(DOMElement)
    } else if (selector.nodeType || selector == selector.window) {
        me[0] = selector;
        me.length = 1;
        return me;

    // Handle $(Array) or $(Collection) or $(NodeList)
    } else if (selector.length && me.toString.call(selector) != "[object String]") {
        return baidu.merge(me, selector);

    } else if (typeof selector == "string") {
        // HTMLString
        if (selector.charAt(0) == "<" && selector.charAt(selector.length - 1) == ">" && selector.length > 2) {
            if ( baidu.dom.createElements ) {
                baidu.merge( me, baidu.dom.createElements( selector ) );
            }

        // baidu.query
        } else {
            baidu.query(selector, context, me);
        }
    
    // document.ready
    } else if (typeof selector == "function") {
        return me.ready ? me.ready(selector) : me;
    }

    return me;
},

// constructor
function(context) {
    this.length = 0;
    this._type_ = "$DOM";
    this.context = context || document;
}

).extend({


    
    size: function() {
        return this.length;
    }

    // 2012.11.27 mz 拥有 .length 和 .splice() 方法，console.log() 就认为该对象是 ArrayLike
    ,splice : function(){}

    
    ,get: function(index) {

        if ( typeof index == "number" ) {
            return index < 0 ? this[this.length + index] : this[index];
        }

        return Array.prototype.slice.call(this, 0);
    }

    // 将 $DOM 转换成 Array(dom, dom, ...) 返回
    ,toArray: function(){
        return this.get();
    }

});


baidu.dom.extend({
    getComputedStyle: function(key){
        var defaultView = this[0].ownerDocument.defaultView,
            computedStyle = defaultView && defaultView.getComputedStyle
                && defaultView.getComputedStyle(this[0], null),
            val = computedStyle ? (computedStyle.getPropertyValue(key) || computedStyle[key]) : '';
        return val || this[0].style[key];
    }
});


baidu.dom.extend({
    getCurrentStyle: function(){
        var css = document.documentElement.currentStyle ?
            function(key){return this[0].currentStyle ? this[0].currentStyle[key] : this[0].style[key];}
                : function(key){return this.getComputedStyle(key);}
        return function(key){
            return css.call(this, key);
        }
    }()
});



baidu.dom.extend({
    getDocument: function(){
        if(this.size()<=0){return undefined;}
        var ele = this[0];
        return ele.nodeType == 9 ? ele : ele.ownerDocument || ele.document;
    }
});





baidu._util_ = baidu._util_ || {};
baidu._util_.contains = document.compareDocumentPosition ?
    function(container, contained){
        return !!(container.compareDocumentPosition( contained ) & 16);
    } : function(container, contained){
        if(container === contained){return false;}
        if(container.contains && contained.contains){
            return container.contains(contained);
        }else{
            while(contained = contained.parentNode){
                if(contained === container){return true;}
            }
            return false;
        }
    };






baidu.dom.extend({
    each : function (iterator) {
        baidu.check("function", "baidu.dom.each");
        var i, result,
            n = this.length;

        for (i=0; i<n; i++) {
            result = iterator.call( this[i], i, this[i], this );

            if ( result === false || result == "break" ) { break;}
        }

        return this;
    }
});



baidu.dom.extend({
    show: function(){
        var valMap = {};
        function getDefaultDisplayValue(tagName){
            if(valMap[tagName]){return valMap[tagName];}
            var ele = document.createElement(tagName), val, frame, ownDoc;
            document.body.appendChild(ele);
            val = baidu.dom(ele).getCurrentStyle('display');
            document.body.removeChild(ele);
            if(val === '' || val === 'none'){
                frame = document.body.appendChild(document.createElement('iframe'));
                frame.frameBorder =
                frame.width =
                frame.height = 0;
                ownDoc = (frame.contentWindow || frame.contentDocument).document;
                ownDoc.writeln('<!DOCTYPE html><html><body>');
                ownDoc.close();
                ele = ownDoc.appendChild(ownDoc.createElement(tagName));
                val = baidu.dom(ele).getCurrentStyle('display');
                document.body.removeChild(frame);
                frame = null;
            }
            ele = null;
            return valMap[tagName] = val;
        }
        return function(){
            var tang;
            this.each(function(index, ele){
                if(!ele.style){return;}
                ele.style.display = '';
                tang = baidu.dom(ele);
                if(tang.getCurrentStyle('display') === 'none'
                    || !baidu._util_.contains(tang.getDocument(), ele)){
                    ele.style.display = valMap[ele.nodeName] || getDefaultDisplayValue(ele.nodeName);
                }
            });
            return this;
        }
    }()
});




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



/// Tangram 1.x Code Start


baidu.fx.extend({
    expand: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.expand");

        var e = element, 
            value, 
            attr,
            attrHV = {
                "vertical": {
                    value: 'height',
                    offset: 'offsetHeight',
                    stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
                },
                "horizontal": {
                    value: 'width',
                    offset: 'offsetWidth',
                    stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
                }
            };

        var fx = baidu.fx.create(e, baidu.extend({
            orientation: 'vertical'
            
            //[Implement Interface] initialize
            ,initialize : function() {
                attr = attrHV[this.orientation];
                baidu.dom.show(e);
                this.protect(attr.value);
                this.protect("overflow");
                this.restoreAfterFinish = true;
                value = e[attr.offset];
                
                function getStyleNum(d,style){
                    var result = parseInt(baidu.fx.getCurrentStyle(d,style));
                    result = isNaN(result) ? 0 : result;
                    result = baidu.isNumber(result) ? result : 0;
                    return result;
                }
                
                baidu.forEach(attr.stylesValue, function(item){
                    value -= getStyleNum(e,item);
                });
                e.style.overflow = "hidden";
                e.style[attr.value] = "1px";
            }

            //[Implement Interface] transition
            ,transition : function(percent) {return Math.sqrt(percent);}

            //[Implement Interface] render
            ,render : function(schedule) {
                e.style[attr.value] = Math.floor(schedule * value) +"px";
            }
        }, options || {}), "baidu.fx.expand_collapse");

        return fx.launch();
    }
});
/// Tangram 1.x Code End





/// Tangram 1.x Code Start



baidu.fx.opacity = function(element, options) {
    baidu.check("^HTMLElement", "baidu.fx.opacity");

    options = baidu.extend({from: 0,to: 1}, options||{});

    var e = element;

    var fx = baidu.fx.create(e, baidu.extend({
        //[Implement Interface] initialize
        initialize : function() {
            baidu.dom.show(element);

            if (baidu.browser.ie) {
                this.protect("filter");
            } else {
                this.protect("opacity");
                this.protect("KHTMLOpacity");
            }

            this.distance = this.to - this.from;
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            var n = this.distance * schedule + this.from;

            if(!baidu.browser.ie) {
                e.style.opacity = n;
                e.style.KHTMLOpacity = n;
            } else {
                e.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
                    Math.floor(n * 100) +")";
            }
        }
    }, options), "baidu.fx.opacity");

    return fx.play();
};

/// Tangram 1.x Code End

/// Tangram 1.x Code Start


baidu.fx.extend({
    fadeOut: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.fadeOut");

        var fx = baidu.fx.opacity(element,
            baidu.extend({from:1, to:0, restoreAfterFinish:true}, options||{})
        );
        fx.on("afterfinish", function(){this.element.style.display = "none";});
        fx._type_ = "baidu.fx.fadeOut";

        return fx;
    }
});

/// Tangram 1.x Code End


/// Tangram 1.x Code Start


baidu.fx.extend({
    fadeIn: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.fadeIn");

        var fx = baidu.fx.opacity(element,
            baidu.extend({from:0, to:1, restoreAfterFinish:true}, options||{})
        );
        fx._type_ = "baidu.fx.fadeIn";

        return fx;
    }
});

/// Tangram 1.x Code End



/// Tangram 1.x Code Start


baidu.fx.extend({
    mask: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.mask");
        // mask 效果只适用于绝对定位的DOM元素
        if (baidu.fx.getCurrentStyle(element, "position") != "absolute") {
            return null;
        }

        var e = element, original = {};
        options = options || {};

        // [startOrigin] "0px 0px" "50% 50%" "top left"
        var r = /^(\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
        !r.test(options.startOrigin) && (options.startOrigin = "0px 0px");

        var options = baidu.extend({restoreAfterFinish:true, from:0, to:1}, options || {});

        var fx = baidu.fx.create(e, baidu.extend({
            //[Implement Interface] initialize
            initialize : function() {
                e.style.display = "";
                this.protect("clip");
                original.width = e.offsetWidth;
                original.height = e.offsetHeight;

                // 计算效果起始点坐标
                r.test(this.startOrigin);
                var t1 = RegExp["\x241"].toLowerCase(),
                    t2 = RegExp["\x244"].toLowerCase(),
                    ew = this.element.offsetWidth,
                    eh = this.element.offsetHeight,
                    dx, dy;

                if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
                else if (/\d+px/.test(t1)) dx = parseInt(t1);
                else if (t1 == "left") dx = 0;
                else if (t1 == "center") dx = ew / 2;
                else if (t1 == "right") dx = ew;

                if (!t2) dy = eh / 2;
                else {
                    if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
                    else if (/\d+px/.test(t2)) dy = parseInt(t2);
                    else if (t2 == "top") dy = 0;
                    else if (t2 == "center") dy = eh / 2;
                    else if (t2 == "bottom") dy = eh;
                }
                original.x = dx;
                original.y = dy;
            }

            //[Implement Interface] render
            ,render : function(schedule) {
                var n = this.to * schedule + this.from * (1 - schedule),
                    top = original.y * (1 - n) +"px ",
                    left = original.x * (1 - n) +"px ",
                    right = original.x * (1 - n) + original.width * n +"px ",
                    bottom = original.y * (1 - n) + original.height * n +"px ";
                e.style.clip = "rect("+ top + right + bottom + left +")";
            }

            //[Implement Interface] finish
            ,finish : function(){
                if (this.to < this.from) e.style.display = "none";
            }
        }, options), "baidu.fx.mask");

        return fx.launch();
    }
});

/// Tangram 1.x Code End






/// Tangram 1.x Code Start


baidu.fx.scale = function(element, options) {
    baidu.check("^HTMLElement", "baidu.fx.scale");
    options = baidu.extend({from : 0.1,to : 1}, options || {});

    // "0px 0px" "50% 50%" "top left"
    var r = /^(-?\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(-?\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
    !r.test(options.transformOrigin) && (options.transformOrigin = "0px 0px");

    var original = {},
        fx = baidu.fx.create(element, baidu.extend({
        fade: true,
            
        //[Implement Interface] initialize
        initialize : function() {
            baidu.dom.show(element);
            var me = this,
                o = original,
                s = element.style,
                save    = function(k){me.protect(k)};

            // IE浏览器使用 zoom 样式放大
            if (baidu.browser.ie) {
                save("top");
                save("left");
                save("position");
                save("zoom");
                save("filter");

                this.offsetX = parseInt(baidu.fx.getCurrentStyle(element, "left")) || 0;
                this.offsetY = parseInt(baidu.fx.getCurrentStyle(element, "top"))  || 0;

                if (baidu.fx.getCurrentStyle(element, "position") == "static") {
                    s.position = "relative";
                }

                // IE 的ZOOM没有起始点，以下代码就是实现起始点
                r.test(this.transformOrigin);
                var t1 = RegExp["\x241"].toLowerCase(),
                    t2 = RegExp["\x244"].toLowerCase(),
                    ew = this.element.offsetWidth,
                    eh = this.element.offsetHeight,
                    dx, dy;

                if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
                else if (/\d+px/.test(t1)) dx = parseInt(t1);
                else if (t1 == "left") dx = 0;
                else if (t1 == "center") dx = ew / 2;
                else if (t1 == "right") dx = ew;

                if (!t2) dy = eh / 2;
                else {
                    if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
                    else if (/\d+px/.test(t2)) dy = parseInt(t2);
                    else if (t2 == "top") dy = 0;
                    else if (t2 == "center") dy = eh / 2;
                    else if (t2 == "bottom") dy = eh;
                }

                // 设置初始的比例
                s.zoom = this.from;
                o.cx = dx; o.cy = dy;   // 放大效果起始原点坐标
            } else {
                save("WebkitTransform");
                save("WebkitTransformOrigin");   // Chrome Safari
                save("MozTransform");
                save("MozTransformOrigin");         // Firefox Mozllia
                save("OTransform");
                save("OTransformOrigin");             // Opera 10.5 +
                save("transform");
                save("transformOrigin");               // CSS3
                save("opacity");
                save("KHTMLOpacity");

                // 设置初始的比例和效果起始点
                s.WebkitTransform =
                    s.MozTransform =
                    s.OTransform =
                    s.transform = "scale("+ this.from +")";

                s.WebkitTransformOrigin = 
                    s.MozTransformOrigin = 
                    s.OTransformOrigin =
                    s.transformOrigin = this.transformOrigin;
            }
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            var s = element.style,
                b = this.to == 1,
                b = typeof this.opacityTrend == "boolean" ? this.opacityTrend : b,
                p = b ? this.percent : 1 - this.percent,
                n = this.to * schedule + this.from * (1 - schedule);

            if (baidu.browser.ie) {
                s.zoom = n;
                if(this.fade){
                    s.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
                        Math.floor(p * 100) +")";
                }
                
                // IE 下得计算 transform-origin 变化
                s.top = this.offsetY + original.cy * (1 - n);
                s.left= this.offsetX + original.cx * (1 - n);
            } else {
                s.WebkitTransform =
                    s.MozTransform =
                    s.OTransform =
                    s.transform = "scale("+ n +")";
                if(this.fade){
                    s.KHTMLOpacity = s.opacity = p;
                }
            }
        }
    }, options), "baidu.fx.scale");

    return fx.play();
};

/// Tangram 1.x Code End

/// Tangram 1.x Code Start


baidu.fx.extend({
    zoomIn: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.zoomIn");

        options = baidu.extend({
            to:1
            ,from:0.1
            ,restoreAfterFinish:true
            ,transition:function(n){return Math.pow(n, 2)}
        },  options||{});

        return baidu.fx.scale(element, options);
    }
});

/// Tangram 1.x Code End




baidu.fx.extend({
    zoomOut: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.zoomOut");

        options = baidu.extend({
            to:0.1
            ,from:1
            ,opacityTrend:false
            ,restoreAfterFinish:true
            ,transition:function(n){return 1 - Math.pow(1 - n, 2);}
        },  options||{});

        var effect = baidu.fx.scale(element, options);
        effect.on("afterfinish", function(){this.element.style.display = "none";});

        return effect;
    }
});/// support magic - Tangram 1.x Code Start







 

baidu.fx.move = function(element, options) {
    baidu.check("^HTMLElement", "baidu.fx.move");

    if (baidu.fx.getCurrentStyle(element, "position") == "static") return null;
    
    options = baidu.extend({x:0, y:0}, options || {});
    if (options.x == 0 && options.y == 0) return null;

    var fx = baidu.fx.create(element, baidu.extend({
        //[Implement Interface] initialize
        initialize : function() {
            this.protect("top");
            this.protect("left");

            this.originX = parseInt(baidu.fx.getCurrentStyle(element, "left"))|| 0;
            this.originY = parseInt(baidu.fx.getCurrentStyle(element, "top")) || 0;
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.style.top  = (this.y * schedule + this.originY) +"px";
            element.style.left = (this.x * schedule + this.originX) +"px";
        }
    }, options), "baidu.fx.move");

    return fx.launch();
};

/// support magic - Tangram 1.x Code End



/// Tangram 1.x Code Start


baidu.fx.extend({
    moveBy: function(element, distance, options) {
        baidu.check("^HTMLElement", "baidu.fx.moveBy");
        if (baidu.fx.getCurrentStyle(element, "position") == "static") return null;

        var d = {};
        d.x = distance[0] || distance.x || 0;
        d.y = distance[1] || distance.y || 0;

        var fx = baidu.fx.move(element, baidu.extend(d, options||{}));

        return fx;
    }
});

/// Tangram 1.x Code End



 

baidu.fx.extend({
    moveTo: function(element, point, options) {
        baidu.check("^HTMLElement", "baidu.fx.moveTo");
        if (baidu.fx.getCurrentStyle(element, "position") == "static") return null;

        var p = [point[0] || point.x || 0,point[1] || point.y || 0];
        var x = parseInt(baidu.fx.getCurrentStyle(element, "left")) || 0;
        var y = parseInt(baidu.fx.getCurrentStyle(element, "top"))  || 0;

        var fx = baidu.fx.move(element, baidu.extend({x: p[0]-x, y: p[1]-y}, options||{}));

        return fx;
    }
});


/// Tangram 1.x Code Start


baidu.fx.extend({
    puff: function(element, options) {
        return baidu.fx.zoomOut(element,
            baidu.extend({
                to:1.8
                ,duration:800
                ,transformOrigin:"50% 50%"
            }, options||{})
        );
    }
});

/// Tangram 1.x Code End


/// Tangram 1.x Code Start


baidu.fx.extend({
    pulsate: function(element, loop, options) {
        baidu.check("^HTMLElement", "baidu.fx.pulsate");
        if (isNaN(loop) || loop == 0) return null;

        var e = element;

        var fx = baidu.fx.create(e, baidu.extend({
            //[Implement Interface] initialize
            initialize : function() {this.protect("visibility");}

            //[Implement Interface] transition
            ,transition : function(percent) {return Math.cos(2*Math.PI*percent);}

            //[Implement Interface] render
            ,render : function(schedule) {
                e.style.visibility = schedule > 0 ? "visible" : "hidden";
            }

            //[Implement Interface] finish
            ,finish : function(){
                setTimeout(function(){
                    baidu.fx.pulsate(element, --loop, options);
                }, 10);
            }
        }, options), "baidu.fx.pulsate");

        return fx.launch();
    }
});

/// Tangram 1.x Code End



/// Tangram 1.x Code Start


baidu.fx.extend({
    shake: function(element, offset, options) {
        baidu.check("^HTMLElement", "baidu.fx.shake");

        var e = element;
        offset = offset || [];
        function tt() {
            for (var i=0; i<arguments.length; i++) {
                if (!isNaN(arguments[i])) return arguments[i];
            }
        }

        var fx = baidu.fx.create(e, baidu.extend({
            //[Implement Interface] initialize
            initialize : function() {
                this.protect("top");
                this.protect("left");
                this.protect("position");
                this.restoreAfterFinish = true;

                if (baidu.fx.getCurrentStyle(e, "position") == "static") {
                    e.style.position = "relative";
                }
                var original = this.original;
                this.originX = parseInt(original.left|| 0);
                this.originY = parseInt(original.top || 0);
                this.offsetX = tt(offset[0], offset.x, 16);
                this.offsetY = tt(offset[1], offset.y, 5);
            }

            //[Implement Interface] transition
            ,transition : function(percent) {
                var line = 1 - percent;
                return Math.floor(line * 16) % 2 == 1 ? line : percent - 1;
            }

            //[Implement Interface] render
            ,render : function(schedule) {
                e.style.top  = (this.offsetY * schedule + this.originY) +"px";
                e.style.left = (this.offsetX * schedule + this.originX) +"px";
            }
        }, options || {}), "baidu.fx.shake");

        return fx.launch();
    }
});

/// Tangram 1.x Code End




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
/// support magic - Tangram 1.x Code Start






baidu.dom.g = function(id) {
    if (!id) return null; //修改IE下baidu.dom.g(baidu.dom.g('dose_not_exist_id'))报错的bug，by Meizz, dengping
    if ('string' == typeof id || id instanceof String) {
        return document.getElementById(id);
    } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
    }
    return null;
};

/// support magic - Tangram 1.x Code End










baidu.string.extend({
    formatColor: function(){
        // 将正则表达式预创建，可提高效率
        var reg1 = /^\#[\da-f]{6}$/i,
            reg2 = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i,
            keyword = {
                black: '#000000',
                silver: '#c0c0c0',
                gray: '#808080',
                white: '#ffffff',
                maroon: '#800000',
                red: '#ff0000',
                purple: '#800080',
                fuchsia: '#ff00ff',
                green: '#008000',
                lime: '#00ff00',
                olive: '#808000',
                yellow: '#ffff0',
                navy: '#000080',
                blue: '#0000ff',
                teal: '#008080',
                aqua: '#00ffff'
            };
            
        return function(){
            var color = this.valueOf();
            if(reg1.test(color)) {
                // #RRGGBB 直接返回
                return color;
            } else if(reg2.test(color)) {
                // 非IE中的 rgb(0, 0, 0)
                for (var s, i=1, color="#"; i<4; i++) {
                    s = parseInt(RegExp["\x24"+ i]).toString(16);
                    color += ("00"+ s).substr(s.length);
                }
                return color;
            } else if(/^\#[\da-f]{3}$/.test(color)) {
                // 简写的颜色值: #F00
                var s1 = color.charAt(1),
                    s2 = color.charAt(2),
                    s3 = color.charAt(3);
                return "#"+ s1 + s1 + s2 + s2 + s3 + s3;
            }else if(keyword[color])
                return keyword[color];
            
            return '';
        }
    }()
});

/// Tangram 1.x Code Start


baidu.fx.extend({
    highlight: function(element, options) {
        baidu.check("^HTMLElement", "baidu.fx.highlight");

        var e = element;

        var fx = baidu.fx.create(e, baidu.extend({
            //[Implement Interface] initialize
            initialize : function() {
                var me = this,
                    CS = baidu.fx.getCurrentStyle,
                    FC = baidu.string.formatColor,
                    color = FC(CS(e, "color")) || "#000000",
                    bgc   = FC(CS(e, "backgroundColor"));

                // 给用户指定的四个配置参数做一个保护值
                me.beginColor = me.beginColor || bgc || "#FFFF00";
                me.endColor   = me.endColor   || bgc || "#FFFFFF";
                me.finalColor = me.finalColor || me.endColor || me.element.style.backgroundColor;
                me.textColor == color && (me.textColor = "");

                this.protect("color");
                this.protect("backgroundColor");

                me.c_b = []; me.c_d = []; me.t_b = []; me.t_d = [];
                for (var n, i=0; i<3; i++) {
                    n = 2 * i + 1;
                    me.c_b[i]=parseInt(me.beginColor.substr(n, 2), 16);
                    me.c_d[i]=parseInt(me.endColor.substr(n, 2), 16) - me.c_b[i];

                    // 如果指定了文字的颜色，则文字颜色也渐变
                    if (me.textColor) {
                        me.t_b[i]=parseInt(color.substr(n, 2), 16);
                        me.t_d[i]=parseInt(me.textColor.substr(n,2),16)-me.t_b[i];
                    }
                }
            }

            //[Implement Interface] render
            ,render : function(schedule) {
                for (var me=this, a="#", b="#", n, i=0; i<3; i++) {
                    n = Math.round(me.c_b[i] + me.c_d[i] * schedule).toString(16);
                    a += ("00"+ n).substr(n.length);

                    // 如果指定了文字的颜色，则文字颜色也渐变
                    if (me.textColor) {
                        n = Math.round(me.t_b[i]+me.t_d[i]*schedule).toString(16);
                        b += ("00"+ n).substr(n.length);
                    }
                }
                e.style.backgroundColor = a;
                me.textColor && (e.style.color = b);
            }

            //[Implement Interface] finish
            ,finish : function(){
                this.textColor && (e.style.color = this.textColor);
                e.style.backgroundColor = this.finalColor;
            }
        }, options || {}), "baidu.fx.highlight");

        return fx.play();
    }
});