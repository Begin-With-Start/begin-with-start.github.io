---
title: activity其中时，打印的totaltime是怎么来的包含哪些时间
date: 2019-04-12 15:51:36
tags: [源码]
categories: android技能,源码
---
* 源码跟进

<!-- more -->
<!-- ![image](arouter-thinking/city.jpg) -->

## 系统打印的totaltime是怎么来的 ##
通过activitymanager的displayed 时间来确定页面加载时间相关婆媳：
Displayed com.***/com.***.activity.CoachDetailActivity: +293ms
---从系统activitymanager接收到intent到显示目标页面的时间；( is basically the time spent between the Activity is about to be launched and the content view of the Activity is drawn (includes drawing time))针对的是页面绘制和布局层级的一些时间统计；
只会得到一个从intent到inflate - drawing之后的时间消耗，并不能得到用户对于app的感知时间；
参考： https://stackoverflow.com/questions/32844566/what-does-i-activitymanager-displayed-activity-850ms-comprised-of
从28系统版本的源代码来看：
com/android/server/am/ActivityStackSupervisor.java:1142
打印的系统加载时间是来自于：
void sendWaitingVisibleReportLocked(ActivityRecord r) {
    boolean changed = false;
    for (int i = mWaitingForActivityVisible.size() - 1; i >= 0; --i) {
        final WaitInfo w = mWaitingForActivityVisible.get(i);
        if (w.matches(r.realActivity)) {
            final WaitResult result = w.getResult();
            changed = true;
            result.timeout = false;
            result.who = w.getComponent();
            result.totalTime = SystemClock.uptimeMillis() - w.getStartTime();
            mWaitingForActivityVisible.remove(w);
        }
    }
    if (changed) {
        mService.notifyAll();
    }
}
在其中记录页面开始加载时间的一个mWaitingForActivityVisible是一个list，维护在：
com/android/server/am/ActivityStackSupervisor.java:352 
list中放的实体是：WaitInfo 
com/android/server/am/ActivityStackSupervisor.java:4906
关键的一个starttime --- mStartTimeMs来自于构造函数：  
WaitInfo(ComponentName targetComponent, WaitResult result, long startTimeMs) {
    this.mTargetComponent = targetComponent;
    this.mResult = result;
    this.mStartTimeMs = startTimeMs;
}
最终跟踪过去发现系统源码只有一个地方在用这个构造函数，在
void waitActivityVisible(ComponentName name, WaitResult result, long startTimeMs) {
    final WaitInfo waitInfo = new WaitInfo(name, result, startTimeMs);
    mWaitingForActivityVisible.add(waitInfo);
}
看到这里就已经比较熟悉了，一个actvityvisible；调用这个visible的地方：
com/android/server/am/ActivityStarter.java:1205
case START_TASK_TO_FRONT: 
在其中的startActivityMayWait方法中，而调用该方法的入口只来自了（在这里可以跟着看下，源代码中有个判断，if (mRequest.mayWait) {    return startActivityMayWait(...);} else { return startActivity(.....);} 这个判断中mayWait 初始化的值是false，最后看了下系统中的startActivityAsUser 其中setMayWait(userId) 竟然把maywait又给设置为true了，这操作。。所以当前看基本都到了startActivityMayWai中了）
com/android/server/am/ActivityStarter.java:487 int execute()
跟踪到比较熟悉的startActivityAsUser  ，再往上一层，最终看到的代码是：
@Override
public final int startActivity(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
        int startFlags, ProfilerInfo profilerInfo, Bundle bOptions) {
    return startActivityAsUser(caller, callingPackage, intent, resolvedType, resultTo,
            resultWho, requestCode, startFlags, profilerInfo, bOptions,
            UserHandle.getCallingUserId());
}

@Override
public final int startActivityAsUser(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
        int startFlags, ProfilerInfo profilerInfo, Bundle bOptions, int userId) {
    return startActivityAsUser(caller, callingPackage, intent, resolvedType, resultTo,
            resultWho, requestCode, startFlags, profilerInfo, bOptions, userId,
            true /*validateIncomingUser*/);
}

恭喜，最终我们得到这个totaltime的时间是来自于：
从startinent的START_TASK_TO_FRONT 任务开始记录开始时间，com/android/server/am/ActivityRecord.java:2023 onWindowsVisible 结束计时并且打印出来,也就是这段时间包括了从startactivity到用户能看见布局的时间；
