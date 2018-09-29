---
title: so库全解析
date: 2017-09-18 11:05:25
tags: [工程,so库实战]
categories: android技能
---
```
1.google android系统so库比较多的原因
2.android cpu架构分类
3.android如何去寻找so库原理
4.几个需要明白的概念
5.大厂对于so架构的一些取舍
6.总结
```
<!-- more -->
![image](so-source-design/blue_blue.jpg)
# google android系统so库比较多的原因

为适配众多的cpu架构，实际就是指令集的区别，在开始从复杂指令集改动到简易指令集的微软架构之后，又分出若干阵营，那么这个地方就不展开了，展开我怕篇幅不太够啊，少年。

# android cpu架构分类

## android 当前支持的七种cpu架构
Android系统目前支持以下七种不同的CPU架构：ARMv5，ARMv7 (从2010年起)，x86 (从2011年起)，MIPS (从2012年起)，ARMv8，MIPS64和x86_64 (从2014年起)，每一种都关联着一个相应的ABI。
~ABI 应用程序二进制接口(Application binary interface)定义了二进制文件(so库)如何运行在相应的系统上。

## 每种cpu架构对应着一个ABI
armeabi，armeabi-v7a，x86，mips，arm64-v8a，mips64，x86_64

# android如何去寻找so库原理

## android如何去寻找so库原理图解
![image](http://7xjiyb.com1.z0.glb.clouddn.com/%E5%AF%BC%E5%9B%BE.png)

android系统寻找so库的顺序，先区分架构，再去寻找完美适配的架构文件夹，若果找不到继续向兼容的架构寻找，匹配架构成功后，加载这个架构下所有的so到data文件夹中，如果在data中找不到应用中使用到的so库，那么会报异常，so link错误等等，不会再到其他架构中去扫描。

## 几个需要明白的概念
### 主ABI库
主ABI库： 与系统影响本身机器对应的ABI库
辅助ABI库： 与系统也支持的ABI对应
而，为实现最佳性能，应该提供主abi库

### 各个架构库支持的ABI
X86 ： 可以运行在armeabi/armeabi-v7a 主要的ABI是X86,辅助ABI是armeabi-v7a
mips:  只定义了主ABI是mips(但是极少用于手机，可以忽略)
armeabi-v7a ： 主 armeabi-v7a ， 辅助armeabi

### 只提供一种架构优缺点
只提供一种架构优点：可以减小包的体积
缺点： 只提供一种架构，而忽视其他架构，那么会影响到性能和兼容，同时也将丢失掉专门为64位优化的性能。

##  android找so库对于软件开发影响
从根本上来说，系统只会把他区分架构的文件夹整个复制到data目录，那么造成一个问题就是，每个架构的文件夹下都应该是so库的全量，如果三方服务供应商，只给了一个armeabi-v7a 的架构，而工程中准备只放一个armeabi的文件夹来减小包大小，那么应该将v7a中的so库拷贝到armeabi中。

同时在运行在androidstudio工程中的build.gradle defaultConfig 中添加：
    ndk {
            abiFilters "armeabi"
        }
在打包中，只包含armeabi的架构。


# 大厂对于so架构的一些取舍
armeabi-v7a : facebook , twitter
armeabi:    淘宝 微信
armeabi :   淘票票

还是来一个图来说明这个东西吧，毕竟没图你说个啥啊：

![image](http://7xjiyb.com1.z0.glb.clouddn.com/demo3.gif.gif)

# 我可以大概算一个总结
那么实际中我们的取舍遵从的原则：
1.为减小体积，只保留armeabi与armeabi-v7a，一般只保留一个
2.若只有一个架构，那么其他架构中的so，保留的文件夹下有有全量。

