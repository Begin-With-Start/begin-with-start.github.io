---
title: gradientdrawable相关问题
date: 2018-09-23 17:14:55
tags: [gradientdrawable,工程技能]
categories: android技能
---
* 这个技术解决了什么问题
* 适合在哪种场景使用
* 这个技术跟我已经掌握的哪个知识或技能类似，有什么差别、有什么特点、 有什么优点和缺点
* 解决方案
<!-- more -->
![image](gradientdrawable相关问题/wild_picture.jpg)
## 这个技术解决了什么问题 ## 
```
	一个项目中遇到的问题，在使用同drawable的实例，设置其中一个view的backgroundcolor为yellow时候，recycleveiw滚动的时候，造成了其他的item颜色发生问题。下面就讨论下这种情况发生的原因，和避免的方法；
```

## 适合在哪种场景使用 ## 
```
	当使用git上的statebutton或者是statetextview的时候，不会产生的这个问题，下文我们会探讨一下，为什么同样适用了gradientdrawable的对象，没有让该控件发生这个问题；
```

## 这个技术跟我已经掌握的哪个知识或技能类似，有什么差别、有什么特点、 有什么优点和缺点  ##
```
	用这种方式来实现动态改动背景颜色的方式，原因在于这个标签是不规则的形状，使用了shape的方式来进行设置样式，需要改动shape的背景颜色的时候，只有用gradientdrawable的方式来进行，---（不过引入了statebutton之后，这个问题就不会有了）
```
```
	从官方的说法上来说：
	/**
         * Changes this drawable to use a single color instead of a gradient.
         * <p>
         * <strong>Note</strong>: changing color will affect all instances of a
         * drawable loaded from a resource. It is recommended to invoke
         * {@link #mutate()} before changing the color.
         *
         * @param argb The color used to fill the shape
         *
         * @see #mutate()
         * @see #setColors(int[])
         * @see #getColor
         */
        public void setColor(@ColorInt int argb) {
            mGradientState.setSolidColors(ColorStateList.valueOf(argb));
            mFillPaint.setColor(argb);
            invalidateSelf();
        }
    当使用同一个resource的同一个实例来进行背景色管理的时候，改动其中一个颜色那么会影响到其他的背景色，在内存优化上，特别是在recycleview重用机制上来说，都会进行重用，产生随着内存的吃紧而来的问题；
    当使用：
    view获取
		GradientDrawable gradientDrawable = (GradientDrawable) viewHolder.mTxtType.getBackground();
        gradientDrawable.setColor(color);
        的时候，会造成重用；
    而在git上的statebutton组件上，也使用gradientdrawable，没有发生这个情况，是因为底层使用的时候，每次的gradientdrawable都重新创建了一次，执行到button的构造方式的时候，都会new一个实例出来。

```

## 解决方案 ##
```
那么我们避免这个问题的方案也大概可以出来了，就是避免掉重用同一个resource出来的drawable实例，而使用创建的实例来进行；可以使用引入组件的方式来简单解决也可以自己建立一个机制，来新建即可；
```
