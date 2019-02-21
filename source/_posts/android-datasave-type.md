---
title: 安卓存储方式完全讲解
date: 2019-01-23 19:45:39
tags: [存储]
categories: android技能,存储
---
* 文件存储方式

<!-- more -->
<!-- ![image](arouter-thinking/city.jpg) -->

## android 中的存储 ##
名称|速度|安全性|多线程支持|
--|:--:|--:|--:
文件|慢|(私有文件外)否|读写现成不安全
数据库|快|安全|由sqlite database保证线程安全
ContentProvider|视底层数据存储而定|安全|过程线程安全
shareprefrence|慢(转存到xml中为止)|private安全|不安全
mmkv|快|可控|安全
```
各种存储方式根据特性，1.可以在需要的时候进行选择；
2.没有一种存储方式适用于所有的情况；
3.只能根据业务和功能的需求，选择合适的存储方式；
```
## 文件存储方式  ##
```
文件的存储，指在安卓系统中，以文件方式放在内部存储或者外部存储的方式；文件存储可以存放比较大的数据，图片，视频，同时对于大量的android运行日志，dump日志，apk，临时碎片推荐使用文件的方式，根据所存储文件的安全性要求和文件存储位置要求来选择合适的存储位置
文件存储位置分为两种：内部存储，外部存储两种；
```
（内部存储）路径|存储内容|api
--|:--|:--
data/data/包名/shared_prefs|存储sp文件|..
data/data/包名/databases|数据库文件|..
data/data/包名/files|文件存储|context.getFilesDir()
data/data/包名/cache|缓存|context.getCacheDir()

（外部存储 mnt/storage ）路径|存储内容|api
--|:--|:--
九大公用存储+sd卡目录|存储sp文件|..
私有目录 storage/sdcard/android/data/包名/file|文件|context.getExternalFilesDir(Environment.DIRECTORY_MUSIC)
私有目录 storage/sdcard/android/data/包名/file|缓存|context.getExternalFilesDir()


方法|路径
--|:--|
/storage/sdcard0/Alarms|Environment.getExternalStoragePublicDirectory(DIRECTORY_ALARMS)
/storage/sdcard0/DCIM	|Environment.getExternalStoragePublicDirectory(DIRECTORY_DCIM)
/storage/sdcard0/Download|Environment.getExternalStoragePublicDirectory(DIRECTORY_DOWNLOADS)
/storage/sdcard0/Movies	|Environment.getExternalStoragePublicDirectory(DIRECTORY_MOVIES)
/storage/sdcard0/Music	|Environment.getExternalStoragePublicDirectory(DIRECTORY_MUSIC)
/storage/sdcard0/Notifications|	Environment.getExternalStoragePublicDirectory(DIRECTORY_NOTIFICATIONS)
/storage/sdcard0/Pictures|Environment.getExternalStoragePublicDirectory(DIRECTORY_PICTURES)	
/storage/sdcard0/Podcasts	|Environment.getExternalStoragePublicDirectory(DIRECTORY_PODCASTS)
/storage/sdcard0/Ringtones	|Environment.getExternalStoragePublicDirectory(DIRECTORY_RINGTONES)
```
在路径中带了包名的代码访问需要使用context需要使用上下文，没有带包名的，可以直接使用enviroment的方法进行访问；
```
## 数据库 ##
```
```
![image](android-newplatform-adaptation-md/google_apisdk_permission.jpg)
## 工程中已经发现需要注意的三方库 ##
```

详细分析： http://kuaibao.qq.com/s/20180327G17Y3L00?refer=spider

扫描工具： 链接: https://pan.baidu.com/s/1J6ZvwWt16imoWoODY7dWXA 提取码: 29yy 







