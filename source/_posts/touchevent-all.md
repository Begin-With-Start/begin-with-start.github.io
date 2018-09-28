---
title: android event 事件分发的一些实用解析与源码分析汇总
date: 2017-10-09 15:12:27
tags: [工程,event事件解析]
categories: android技能
---
![image](touchevent-all/grey.jpeg)
<!-- more -->
# 前言 #
工程中的一些需求需要定制很多的view，而定制的view如何进行这里不进行展开，但是其中遇到的一个问题足以引起重视，那就是view需要处理action事件(如 down , up , move ,cancle )，而总是出现处理了view的touch事件之后，在对view的onclicklistener监听的时候，监听不到点击事件，开始的处理是在网上查(zhan)找(tie)了下。现在好整以暇，可以看看究竟是什么样的机制让ontouch的事件监听了之后，没有onclicklistener的。或者是自己的使用姿势不对。
# 事件分发的一些概念 #
	事件：用户触摸屏幕产生的点击事件
	系统将用户的操作事件包装成了一个motionevent的对象。(包含发生触摸的位置，时间，历史记录，手势动作等)
	从源码的区分上来说：
	MOtionEvent.ACTION_DOWN: 用户按下事件
	MotionEvent.ACTION_MOVE: 用户移动手指事件
	MotionEvent.ACTION_CANCLE: 非用户操作取消事件
	MotionEvent.ACTION_UP:  用户手指抬起事件
## 用户的一次操作的事件列 ##
	用户的一次手指从按下到抬起的产生的一系列事件。
![image](http://7xjiyb.com1.z0.glb.clouddn.com/944365-79b1e86793514e99.png)

# 事件分发的几个分类 #
## window/activity , viewgroup 与 view ##
讨论的事件分发除了是由docview分发的onclicklistener之外的诸如：dispatchevent,onintercepttouchevent,ontouchevent的一些事件，其中：

	widow/activity:dispatchevent,ontouchevent(没有onintercepttouchevent)
	viewgroup :  dispatchevent,ontouchevent(没有onintercepttouchevent)
	view : dispatchevent,ontouchevent,onintercepttouchevent
	
基本的传递顺序是：
	activity----> viewgroup  ----> view
	e.g 在有多个viewgroup嵌套的时候，遵循一层一层往下传递的规律。

## 事件分发相关的方法 ##
事件分发在activity,viewgroup,view中传递的基本原则
![image](http://7xjiyb.com1.z0.glb.clouddn.com/944365-37be4474ef7a1741.png)


## 事件分发QA ## 
1.view的事件分发的时候，ontouch拦截返回true/false时候，view的onclicklistener都不响应的问题。
首先明白view的onclicklistener事件是docview或者说是acitivity的rootview分发给每个view的，那么首先我们要保证在顶层的activity要能获得事件。上图的分类是有问题的，当我们在view中拦截了ontouchevent的时候，传递的是false的时候，表示我们不处理给到父级来处理，但是在activity中没有接到相应的事件，没有给到onclicklistener点击事件。现象如下：
![image](http://7xjiyb.com1.z0.glb.clouddn.com/%E6%97%A0%E6%A0%87%E9%A2%98.png)
	而当我们放开view的ontouchevent让而调用super的事件，那么会得到相应的结果。会响应view的onclick事件，所以，返回false和返回super是不一样的，对于onclick事件绑定来说，必须要把view的ontouchevent给到super，才能够让docview把事件给到view。

2.在上个实验中我们看到了acitivty中调用了两次的ontouchevent。
用户的一次点击实际上是一个action_down和一次action_up组成的，所以，是传递了两个motionevent出来，那么activity-->viewgroup--->view是需要走两次的。
	
	

[传送门之大传送之术](https://github.com/Begin-With-Start/TouchEventDemo)