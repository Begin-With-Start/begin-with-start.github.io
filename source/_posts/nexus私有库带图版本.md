---
title: nexus私有库使用部署，与配置相关
date: 2018-09-29 15:45:03
tags: [工程,ci相关]
categories: android技能
---
* 
* 
<!-- more -->
##  部署私有库目的  ## 
```
针对于在工程中依赖三方库的时候，报出的find in location ，链接实际可用的问题，也针对在三方库莫名的time out的问题；搭建一个私有库，出现问题及时处理及时重启及时管理离线包的方式更能从根本上杜绝这种事情的发生；
同时，Nexus在代理远程仓库并且缓存的同时维护本地仓库，节省外网带宽和时间，Nexus私服就可以满足这样的需要。
```
## 搭建步骤 ##
	搭建一个nexus的私有库，在流程是是比较简单的，麻烦的是调通依赖的代理；下面从自搭建私有库的步骤上来进行一步步引导：
	* a.安装nexus库服务，使用homebrew安装nexus少了很多繁琐的配置，默认安装的版本是：Nexus Repository Manager OSS 2.14.8-01
	* b.nexus服务的管理命令：
		服务启动与关闭：
			nexus start service
			nexus stop service
			nexus restart service
		({ console | start | stop | restart | status | dump })

![image](https://raw.githubusercontent.com/Begin-With-Start/begin-with-start.github.io/hexo/source/images/nexus_setup.jpg)

	* c.配置nexus代理到国内的镜像上：
		三种仓库： proxy repository , host repository , virtual repository , group repository;对应 代理仓库，本地仓库，虚拟仓库,仓库组
		添加proxy repositroy 仓库到nexus：
		![image](so-source-design/blue_blue.jpg)
		configration 添加 remote storage location 添加 阿里云的国内镜像，根据乐刻工程依赖的情况添加三个依赖仓库：
			https://maven.aliyun.com/repository/public/
			https://maven.aliyun.com/repository/google/
			https://maven.aliyun.com/repository/jcenter/


![image](https://raw.githubusercontent.com/Begin-With-Start/begin-with-start.github.io/hexo/source/images/add_proxy_repository.jpg)
		点击save
https://raw.githubusercontent.com/Begin-With-Start/begin-with-start.github.io/hexo/source/images/new_repository_configration.png)

	* d.关闭discovery选项，打开的时候，不在prefix文件配置中的包下载不到,不勾选可以下载该仓库任意的包；

![image](https://raw.githubusercontent.com/Begin-With-Start/begin-with-start.github.io/hexo/source/images/nexus_discovery.png)

	* e.本地部署成功之后移植到测试机之后出现 remote access not allowed from M2Repository问题：
		将 auto Blocking enabled 设置为false；
		原因：nexus私有库，会发送head 和 get 请求到目标代理库，来判断目标代理库是否可用是否健康，未响应或者是响应错误会导致nexus认为目标代理库不可用，会返回这个错误；

![image](https://raw.githubusercontent.com/Begin-With-Start/begin-with-start.github.io/hexo/source/images/nexus_error_m2repository.png)

	* f.将本地依赖配置为 respository path 
		//切换到私有库
	        maven { url 'http://maven.leoao.com/nexus/content/repositories/google/' }
	        maven { url 'http://maven.leoao.com/nexus/content/repositories/aliyun-public/' }
	        maven { url 'http://maven.leoao.com/nexus/content/repositories/jcenter/' }
	    私有库在遍历下载三方依赖的同时，会直接把依赖在本地缓存一份，下次的取用速度会直接先判断私有库是否已有这个版本，已有的三方库下载速度会非常快；

## 对于代理仓库没有依赖的情况 ##
	

## 对于三方自建仓库管理库的情况 ##
