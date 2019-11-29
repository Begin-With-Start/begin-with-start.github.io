---
title: android9.0适配的前世今生
date: 2018-10-29 20:43:20
tags: [适配]
categories: android技能
---
* andorid 9.0
* 渐进的改进方式
* sdk检查原理 
* 工程中已经发现需要注意的三方库

<!-- more -->
<!-- ![image](arouter-thinking/city.jpg) -->

## andorid 9.0 ##
```
	google终于开始解决悬在自己头上的达摩斯之剑了，安全+卡顿两个被诟病的地方；这次在nogout的p升级上，开始对sdk中被各大厂商和黑科技玩坏的反射和对底层的各种调用问题开始着手解决；这个版本对于非sdk暴露api方法做了限制，不论是调用，反射还是jni，提升自己的兼容性；
	对限制的接口进行调用的时候，会奔溃或者弹窗或者弹出toast警告的方式来一个版本一个版本的把非法的sdk调用消灭掉；
```
## 渐进的改进方式 ##
```
	对于sdk的限制，google出了几个列表，blacklist，dark-graylist， light-graylist；处理方式也有不同，对于黑名单这个版本必须改动，不然会带来奔溃；dark-graylist的接口，为p版本的时候不准调用，小于p的手机可调用，会警告；light-graylist的在》=p的版本的时候会进行警告，后续版本会移动到深灰列表中；

```
## sdk检查原理 ##
```
	start 准备阶段：
		在c层对androidsdk的api权限进行检测从编译期的几个api列表中开始：

		LOCAL_LIGHT_GREYLIST := $(INTERNAL_PLATFORM_HIDDENAPI_LIGHT_GREYLIST)
		LOCAL_DARK_GREYLIST := $(INTERNAL_PLATFORM_HIDDENAPI_DARK_GREYLIST)
		LOCAL_BLACKLIST := $(INTERNAL_PLATFORM_HIDDENAPI_BLACKLIST)

		# File names of source files we will use to generate the final API lists.
		LOCAL_SRC_GREYLIST := frameworks/base/config/hiddenapi-light-greylist.txt
		LOCAL_SRC_VENDOR_LIST := frameworks/base/config/hiddenapi-vendor-list.txt
		LOCAL_SRC_FORCE_BLACKLIST := frameworks/base/config/hiddenapi-force-blacklist.txt
		LOCAL_SRC_PUBLIC_API := frameworks/base/config/hiddenapi-public-dex.txt
		LOCAL_SRC_PRIVATE_API := frameworks/base/config/hiddenapi-private-dex.txt
		LOCAL_SRC_REMOVED_API := frameworks/base/config/hiddenapi-removed-dex.txt

		在定义light-greylist，black-list，dark-greylist中可以看出，系统开始就存储了两个列表hiddenapi-blacklist.txt，hiddenapi-dark-greylist.txt来源于Framework/base/config目录，而light-greylist来自于private-list减去dark-list和black-list表的并集之后的结果集；

	1.遍历class.dex中的函数或者字段列表
		按照：
		HiddenApiAccessFlags::kWhitelist => 0b00
		hiddenapi-light-greylist.txt=> HiddenApiAccessFlags::kLightGreylist => 0b01
		hiddenapi-dark-greylist.txt => HiddenApiAccessFlags::kDarkGreylist=> 0b10
		hiddenapi-blacklist.txt => HiddenApiAccessFlags::kBlacklist => 0b11
		的对应表将数值写入到ClassDataMethod/ClassDataField结构体中成员access_flags_原始值进行处理后重新写入
	2.最后一步，重新校验dex头部签名  Hiddenapi处理后，完成从3个文本文件数据与原始dex格式文件的合并，即生成新的dex。

	3.Art Runtime时期 将 access_flags_转换为需要的值；
		hiddenapi-light-greylist.txt (0b01)
		hiddenapi-dark-greylist.txt (0b10)
		hiddenapi-blacklist.txt (0b11)
		将转换之后的2进制值再存入进去，等待在运行期再使用；

	4.运行期：在app运行时，会校验artmethod结构体中access_flags_最高2位的值，校验的手段包括直接调用、反射、JNI获取
		0(0b00) kAllow直接放过
		1(0b01) kAllowButWarn放过，但日志警告
		2(0b10) kAllowButWarnAndToast放过，且日志警告和弹窗
		3(0b11) kDeny拒绝

	那么在用户和开发层面表现出来的现象就是：
```
![image](android-newplatform-adaptation-md/google_apisdk_permission.jpg)
## 工程中已经发现需要注意的三方库 ##
```
	作为一个已经运行了三年的工程在项目里面不可避免的引入了一些对于google不太友好的sdk进来，现在发现的是tinker和gson的低版本会造成引入比较多的非法sdkapi不过可以通过升级到最新的三方版本来进行规避；
```
## 其他很奇怪的开发版造成的适配问题 ## 
```
// Android 9.0 限制了开发者调用非官方公开API方法或接口, 关闭警告弹框
private void closeAndroidPDialog(){
    try {
        Class clazz = Class.forName("android.content.pm.PackageParser$Package");

        Constructor constructor = clazz.getDeclaredConstructor(String.class);
        constructor.setAccessible(true);
    } catch (Exception e) {
        e.printStackTrace();
    }

    try {
        Class clazz = Class.forName("android.app.ActivityThread");

        Method method = clazz.getDeclaredMethod("currentActivityThread");
        method.setAccessible(true);

        Object object = method.invoke(null);

        Field filed = clazz.getDeclaredField("mHiddenApiWarningShown");
        filed.setAccessible(true);
        filed.setBoolean(object, true);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
这种方式不推荐使用，只是在最终的适配也无法满足的 mix 2s 开发版 9.0 时候特定的适配问题添加下；
```

## 引出一个android p的 适配 ##
```
1.hidden api 限制

描述:

Android P（API 级别 28）引入了针对非 SDK 接口的使用限制，无论是直接使用还是通过反射或 JNI 间接使用，均会收到此限制。

google使用三个名单对私有api划分为3个级别: 

1.light grey  2.dark grey  3. black.

(1) light grey名单的api仍然可以使用, 但是会在debuggable的应用上弹窗警；

(2) dark grey名单的api限制了targetSdk等级28的应用抛出异常, 对于低于28的应用处理原则与light grey名单的api一致；

(3) black名单会限制所有应用使用, 使用会导致崩溃。

适配建议:

1.遵循google的规定使用sdk允许范围内的api。

可以使用google发布的veridex工具进行静态检查, 链接（VPN环境下打开）:https://android.googlesource.com/platform/prebuilts/runtime/+/master/appcompat

2.如果有一定理由一定要使用某个被限制的api, 可以反馈google申请将api限制降级。



2.加固类异常

描述: 
经测试本次升级某些加固方案在 Android P 上依然存在兼容性问题，会造成应用启动crash。 

适配建议: 

使用加固的应用厂商应该及时更新到最新的加固版本以确保对 Android P 的支持, 如果更新后仍有问题请反馈我们, 我们再尝试跟加固厂商沟通解决。



3.targetSdk限制

描述: 
在 Android P 的设备上运行的应用必须保证targetSdk版本>=17, 否则强制弹框提示。由于google明确要求, 此提示不可消除。 

适配建议: 

请尽快提升targetSdk级别到17以上。 



4.限制访问WiFi位置和连接信息

描述: 
在 Android P 上如果应用需要wifi获取位置信息以及获取wifi的SSID和BSSID, 除开必要的权限 

ACCESS_FINE_LOCATION 

ACCESS_COARSE_LOCATION 

CHANGE_WIFI_STATE 

还需要用户打开位置开关 

适配建议: 

获取上述信息时可以考虑通过以下接口判断位置开关是否打开, 从而引导用户操作。 

Settings.Secure.getInt(context.getContentResolver(),   

Settings.Secure.LOCATION_MODE,Settings.Secure.LOCATION_MODE_OFF)


5.Apache HTTP客户端弃用

描述: 
Google从android 6.0开始取消对于Apache Http客户端的支持, 在 Android P 将其从bootclasspath中移除,通过委托系统classLoader将不再能查找到org.apache.http.*(应用classLoader仍能查找) 

这个变更造成了两个影响: 

1.使用非标准classLoader会造成NoClassDefFoundError错误； 

2.仅针对targetSdk等级28以上的应用,继续使用Apache HTTP客户端，以 Android P及更高版本为目标的应用可以向其 AndroidManifest.xml 添加以下内容： 

<uses-library android:name="org.apache.http.legacy"android:required="false"/>。 
适配建议: 

1.遵循google建议使用HttpURLConnection类替代Apache HTTP客户端使用； 

2.如仍要使用使用，需要在build.gradle中申明 

android { 
useLibrary 'org.apache.http.legacy' 
}
对于targetSdk等于28的应用, 还需要再并在AndroidManifest.xml中申明 

<uses-library android:name="org.apache.http.legacy"android:required="false"/>。
或者自己打包Apache HTTP客户端使用。 



6.禁止处于idle状态应用访问相机、麦克风和传感器

描述: 
Google从安全隐私的角度, 限制了后台应用的使用相机、麦克风和传感器(会改善)。 

应用退到后台进入idle状态后, 应用将无法调用相机、麦克风和传感器, 可能会导致某些应用后台的功能异常。 

适配建议: 

1.尽量避免后台访问这些功能； 

2.必须后台使用的可以通过启动前台服务的方式实现。 



7.安全行为变更

描述: 
1.Crypto Java 加密架构 (JCA) 提供程序现已被移除, 调用 SecureRandom.getInstance("SHA1PRNG", "Crypto") 将会引发 NoSuchProviderException； 

2. Android P 弃用了几个来自 Bouncy Castle 提供程序中的加密技术，代之以由 Conscrypt 提供程序提供的加密技术； 

调用请求 Bouncy Castle 提供程序的 getInstance() 时，会生成 NoSuchAlgorithmException 错误； 

3.更严格的 SECCOMP 过滤器。 



8.强制执行FLAG_ACTIVITY_NEW_TASK要求 

描述: 

现在从非Activity启动, 必须要添加FLAG_ACTIVITY_NEW_TASK的flag, 否则这个intent将不被响应。 



9.应用不再能访问xt_qtaguid文件夹中的文件

描述: 
从 Android P 开始，不再允许应用直接读取 /proc/net/xt_qtaguid 文件夹中的文件。 这样做是为了确保与某些根本不提供这些文件的设备保持一致。 

依赖这些文件的公开 API TrafficStats 和 NetworkStatsManager 继续按照预期方式运行。 然而, 不受支持的 cutils 函数, 例如 qtaguid_tagSocket()执行结果可能异常。 

影响范围API级别28的应用(申明适配 Android P 的应用) 



10.前台服务

描述: 
现在应用必须为启动前台服务申请权限FOREGROUND_SERVICE， 这是一个普通权限，不需要。 



11.隐私权变更

描述: 
1.构建序列号弃用 

在 Android P 中，Build.SERIAL 始终设置为 "UNKNOWN" 以保护用户的隐私； 

如果您的应用需要访问设备的硬件序列号，您应改为请求 READ_PHONE_STATE 权限，然后调用 getSerial()； 

2.DNS 隐私 

以 Android P 为目标平台的应用应采用私有 DNS API。 具体而言，当系统解析程序正在执行 DNS-over-TLS 时，应用应确保任何内置 DNS 客户端均使用加密的 DNS 查找与系统相同的主机名，或停用它而改用系统解析程序。 



12.框架安全性变更

描述: 
1.默认情况下启用网络传输层安全协议 (TLS)； 

如果您的应用以 Android P 或更高版本为目标平台，则默认情况下 isCleartextTrafficPermitted() 函数返回 false； 

如果您的应用需要为特定域名启用明文，您必须在应用的网络安全性配置中针对这些域名将 cleartextTrafficPermitted 显式设置为 true。 

2.为改善 Android P 中的应用稳定性和数据完整性，应用无法再让多个进程共用同一 WebView 数据目录。 此类数据目录一般存储 Cookie、HTTP 缓存以及其他与网络浏览有关的持久性和临时性存储。 

在大多数情况下，您的应用只应在一个进程中使用 android.webkit 软件包中的类，例如 WebView 和 CookieManager。 例如，您应该将所有使用 WebView 的 Activity 对象移入同一进程。 

您可以通过在应用的其他进程中调用 disableWebView()，更严格地执行“仅限一个进程”规则。 该调用可防止 WebView 在这些其他进程中被错误地初始化，即使是从依赖内容库进行的调用也能防止。 

如果您的应用必须在多个进程中使用 WebView 的实例，则必须先利用 WebView.setDataDirectorySuffix() 函数为每个进程指定唯一的数据目录后缀，然后再在该进程中使用 WebView 的给定实例。 

该函数会将每个进程的网络数据放入其在应用数据目录内自己的目录中。



13.CSS颜色模块级别4

描述: 
Chrome 自版本52以来便一直支持 CSS 颜色模块级别 4，但webview目前停用此功能，因为现有Android应用被发现包含Android ordering (ARGB)中的32位十六进制颜色，这会导致渲染错误。 

例如，对于以API级别27或更低版本为目标平台的应用，颜色#80ff8080目前在WebView中被渲染为不透明浅红色(#ff8080)。 先导部分(Android会将其解读为Alpha部分)目前被忽略。 

如果某个应用以 API 级别 28 或更高版本为目标，则#80ff8080将被解读为 50% 透明浅绿 (#80ff80)。 



Tips：随着Google新版本发布，各应用应尽快跟进兼容。否则后面有多个版本的迭代，遗留的坑会比较多哦~

```

详细分析： http://kuaibao.qq.com/s/20180327G17Y3L00?refer=spider

扫描工具： 链接: https://pan.baidu.com/s/1J6ZvwWt16imoWoODY7dWXA 提取码: 29yy 






