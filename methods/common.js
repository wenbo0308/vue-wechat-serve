/**
 * Created by lee wenbo on 2018/9/7.
 */
var moment = require('moment');

exports.sleep=function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

// 只用于拷贝json对象  不适合构造出来的对象
exports.simpleDeepCopy = function (sourceObj) {
    return JSON.parse(JSON.stringify(sourceObj));
};

function leftpad(str,len,ch) {
    return (((ch+"")||" ").repeat(len) + str)
        .slice(-Math.max(len, (""+str).length));
}


var index = 0;
var incrIndex = function () {
    index ++;

    if (index === 1000) {
        index = 0;
    }

    var sIndex = leftpad(String(index),3,'0');

    return sIndex;
};

var createId = function () {
    var time = moment().format('YYDDMMHHmmssSSS');
    var pid = process.pid;
    pid = String(pid);
    pid = pid.substr(pid.length-2<=0?0:pid.length-2,pid.length);
    pid = leftpad(pid,2,'0');
    var id = time + pid + incrIndex();
    return id.toString();
};

exports.createId = createId;

exports.leftpad = leftpad;