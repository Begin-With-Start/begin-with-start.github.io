---
title: 工程定制输入框是否可输入保留光标定制
date: 2017-12-10 12:09
tags: [工程,定制]
categories: android技能
---
![image](inputbox-forbiddeninput/montain_high.jpg)
<!-- more -->
## 技术解决了什么问题 ##
这是一个典型的项目倒逼输入的例子。公司有蓝牙组件的需求，那么衍生出的定制需求也是很正常的。需求需要，输入框在保留光标的时候，同时有禁用键盘和启用键盘的操作。这个功能点的技术开始的诞生就是解决在edittext的控件使用时候，保留光标的时候还要禁用掉键盘的自动弹出(如果自定义键盘是同样这个套路的话，可能会有些问题，需要特殊处理)  
同时功能需求在有多个edittext时候依旧能够统一控制输入框的弹出软键盘功能。
## 比较适合在哪些场景应用 ## 
该技术适用于产品的具体场景，也可以稍微摘出来作为一个共用控件使用。
    
## 源码研究过程 ## 
这个需求开始肯定要先看看edittext对于软件盘唤起的操作的源码。在edittext父类textview中找到了  
```
/**
* Sets whether the soft input method will be made visible when this  
 * TextView gets focused. The default is true.  
 */  
@android.view.RemotableViewMethod  
public final void setShowSoftInputOnFocus(boolean show) {  
    createEditorIfNeeded();  
    mEditor.mShowSoftInputOnFocus = show;  
} 
```

方法代码段。  
但是直接使用调用方法来进行的时候会提示：
Call requires API level 21 (current min is 18): android.widget.TextView#setShowSoftInputOnFocus less... 
android 18版本以上的才能够调用这个方法，为了兼容低版本，同时保证方法可用，想到了用反射来进行调用，处理掉反射的异常。  
### 最后的方案如下：  ### 
```
/**
     * 禁止Edittext弹出软件盘，光标依然正常显示。
     */
    public void disableShowSoftInput() {
        softinputSet(false);
    }

    /**
     * 打开Edittext弹出软件盘，光标依然正常显示。
     */
    public void openShowSoftInput() {
        softinputSet(true);
    }

    public void softinputSet(boolean isShow){
        if (android.os.Build.VERSION.SDK_INT <= 10) {
            this.setInputType(InputType.TYPE_NULL);
        } else {
            Class<EditText> cls = EditText.class;
            Method method;
            try {
                method = cls.getMethod("setShowSoftInputOnFocus", boolean.class);
                method.setAccessible(true);
                method.invoke(this, isShow);
            } catch (Exception e) {
            }

            try {
                method = cls.getMethod("setSoftInputShownOnFocus", boolean.class);
                method.setAccessible(true);
                method.invoke(this, isShow);
            } catch (Exception e) {
            }
        }
    }
```
来控制整个的输入框的弹出与否  

### 布局中的多个输入框的禁用效果实现 ###
实现了单个的效果，那么需要实现多个输入框的效果禁用时候，应该就可以大概看下layout对于这个的支持。  
因为edittext的软键盘弹出很多时候跟是否有焦点相关联。那么在layout中选取了一个布局进行支持的时候，可以看看这个布局viewgroup对于focus的实现方法和控制方法。直接选取了linearlayout的布局来进行研究。  
往父级进行浏览，最后跟到了view中去：  
```
/**
     * Use with {@link #focusSearch(int)}. Move focus to the previous selectable
     * item.
     */
    public static final int FOCUS_BACKWARD = 0x00000001;

    /**
     * Use with {@link #focusSearch(int)}. Move focus to the next selectable
     * item.
     */
    public static final int FOCUS_FORWARD = 0x00000002;

    /**
     * Use with {@link #focusSearch(int)}. Move focus to the left.
     */
    public static final int FOCUS_LEFT = 0x00000011;

    /**
     * Use with {@link #focusSearch(int)}. Move focus up.
     */
    public static final int FOCUS_UP = 0x00000021;

    /**
     * Use with {@link #focusSearch(int)}. Move focus to the right.
     */
    public static final int FOCUS_RIGHT = 0x00000042;

    /**
     * Use with {@link #focusSearch(int)}. Move focus down.
     */
    public static final int FOCUS_DOWN = 0x00000082;
```
view 对于子view的focus的标志有以上几种，标志着在子view的焦点的变化。这时候大概可以关注一下focus_down了，见名知意。查阅了官方文档，描述也是如此，是在子view中找到下一个可以获取焦点的位置。那么方案就可以定下来了。
### 布局中多输入框禁用效果方案 ###
在布局中找到当前的获取到焦点的view，同时往上找一个子view或者是往下找一个子viwe即可。  
实现代码：  
```
/**
     * 光标往下去一个输入组件
     */
    public void next(){
        boolean isThis = false;
        View current = this.findFocus();
        ArrayList<View> views =  this.getFocusables(View.FOCUS_DOWN);
        for(View view : views ){
            if(isThis){
                isThis = false;
                view.requestFocus();
                return ;
            }
            if(current == view){
                isThis = true;
            }
        }

    }

    /**
     * 光标往上去一个输入组件
     */
    public void previous(){
        View current = this.findFocus();
        ArrayList<View> views =  this.getFocusables(View.FOCUS_DOWN);
        for(int i = 0 ; i < views.size(); i++){
            if(current == views.get(i)){
                if(i >= 1){
                    views.get(i-1).requestFocus();
                }
            }
        }
    }

    /**
     * 禁用子view的软键盘自动弹出
     */
    public void forbidenAllChildSoftinput(){
        KeyBoardDisableEditText editText;
        ArrayList<View> views =  this.getFocusables(View.FOCUS_DOWN);
        for(View view : views){
            if(view instanceof KeyBoardDisableEditText){
                editText = (KeyBoardDisableEditText) view;
                editText.disableShowSoftInput();
            }
        }
    }

    /**
     * 启用子view的软键盘自动弹出
     */
    public void startAllChildSoftinput(){
        KeyBoardDisableEditText editText;
        ArrayList<View> views =  this.getFocusables(View.FOCUS_DOWN);
        for(View view : views){
            if(view instanceof KeyBoardDisableEditText){
                editText = (KeyBoardDisableEditText) view;
                editText.openShowSoftInput();
            }
        }
    }

```
同时在layout中还开放了一个可以控制布局中所有sorftinput弹出事件的方法。那么定制到这里是可以完全解决问题了的。原理就是通过源码来进行一个hack操作而已。  
demo可能有用先挂出来：  

[传送门之大传送之术](https://github.com/Begin-With-Start/Demoall/blob/master/app/src/main/java/demo/minifly/com/map/KeyBoardEditText.java)

[传送门之布局控制传送之术](https://github.com/Begin-With-Start/Demoall/blob/master/app/src/main/java/demo/minifly/com/map/TextInputLayout.java)