/// support magic - Tangram 1.x Code Start
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @create: 2010-07-16
 * @namespace: baidu.fx.current
 */

///import baidu.fx;
///import baidu.id;
///import baidu.global;

/**
 * 获取DOM元素正在运行的效果实例列表
 * @function
 * @grammar baidu.fx.current(element)
 * @param     {string|HTMLElement}     element     被查询的DOM元素或元素id
 * @see baidu.fx.current
 * @returns {Array} 效果对象
 */
baidu.fx.current = function(element) {
    baidu.check("^HTMLElement", "baidu.fx.current");

    var id, guids = [];
    var maps = baidu.global("_maps_fx");


    // 可以向<html>追溯
    do {
        if ((id = baidu.id(element)) && maps[id]) {
            for (var i=0, n=maps[id].guids.length; i<n; i++) {
                guids.push(maps[id].guids[i]);
            }
        }
    }
    while ((element = element.parentNode) && element.nodeType == 1);

    // if (guids.length == 0) return null;

    for(var i=0, n=guids.length; i<n; i++) {
        guids[i] = baiduInstance(guids[i]);
    }

    return guids;
};

/// support magic - Tangram 1.x Code End