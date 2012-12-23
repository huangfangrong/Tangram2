///import baidu.id;
///import baidu.regexp;
///import baidu.global;
///import baidu.fx.Timeline;
///import baidu.string.toCamelCase;
/**
 * @description 统一创建动画类
 * @ahthor meizz
 * @create 2012-12-01
 * @function
 * @name baidu.fx.create
 * @grammer baidu.fx($dom).create(options, fxName)
 */

/**
 * 效果基类。
 * @function
 * @grammar baidu.fx.collapse(element, options, fxName)
 * @param     {HTMLElement}           element            添加效果的DOM元素
 * @param     {JSON}                  options            时间线的配置参数对象
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 * @param     {String}                fxName             效果名（可选）
 * @return {baidu.fx.Timeline}  时间线类的一个实例
 */
baidu.fx.create = function(element, options, fxName) {
    var timeline = new baidu.fx.Timeline(options);
    var maps = baidu.global("_maps_fx");
    var id = baidu.id(element);
    timeline.data = maps[id] = maps[id] || {original: {}, guids:{}};
    timeline.element = element;
    timeline.attName = "att_"+ timeline._type_.replace(baidu.regexp("\\W", "g"), "_");

    /**
     * @description 保存原始的CSS属性值 20100708
     * @param   {String}    cssKey  CSS样式名
     */
    timeline.protect = function(cssKey) {
        cssKey = baidu.string(cssKey).toCamelCase();
        this.data.original[cssKey] = this.element.style[cssKey];
    }
    /**
     * @description 打扫dom元素上的痕迹，删除元素自定义属性
     */
    timeline._clean_ = function() {
        var me = this;

        if (me.data) {
            delete me.data[me.attName];
            delete me.data.guids[me.guid];
        }
    };
    /**
     * @description 时间线结束，恢复那些被改过的CSS属性值
     */
    timeline._restore_ = function() {
        var o = this.data.original,
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
            (guid = data[me.attName]) && baiduInstance(guid).cancel();
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


/**
 * fx 的所有 【属性、方法、接口、事件】 列表
 *
 * property【七个属性】                 默认值 
 *  element             {HTMLElement}           效果作用的DOM元素
 *  interval            {Number}        16      脉冲间隔时间（毫秒）
 *  duration            {Number}        500     时间线总时长（毫秒）
 *  percent             {Number}                时间线进度的百分比
 *  dynamic             {Boolean}       true    是否渐进式动画还是直接显示结果
 *  overlapping         {Boolean}       false   效果是否允许互相叠加
 *  restoreAfterFinish  {Boolean}       false   效果结束后是否打扫战场
 *
 * method【三个方法】
 *  end()       直接结束
 *  cancel()    取消操作
 *  protect()   保存元素原始的CSS属性值，以便自动 restore 操作
 *
 * event【四个事件】
 *  onbeforestart()
 *  onbeforeupdate()
 *  onafterupdate()
 *  onafterfinish()
 *
 * interface【五个接口】
 *  initialize()            用于类初始化时的操作
 *  transition(percent)     重新计算时间线进度曲线
 *  finish()                用于类结束时时的操作
 *  restore()               效果结束后的恢复操作
 *  render(schedule)        每个脉冲在DOM上的效果展现
 */

/// support magic - support magic - Tangram 1.x Code End