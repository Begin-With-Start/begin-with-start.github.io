---
title: 自动化测试简介
date: 2018-09-17 14:24:26
tags: [理论知识,自动化测试技能]
categories: 测试技能
---
* 软件开发生命周期各个阶段的自动化测试技术
<!-- more -->
![image](test-case-auto-testcase-summary/tree_xiaozhu.jpeg)

## 软件开发生命周期各个阶段的自动化测试技术
#### 1、单元测试的自动化技术
1. 用例框架代码生成的自动化
2. 部分测试输入数据的自动化生成
- 自动生成边界值
3. 自动桩代码的生成
<!-- more -->
- 桩代码（stub code）是用来替代真正代买的临时代码
- 单元测试开发者只需要关注桩代码内的具体逻辑实现，以及桩代码的返回值
- 最好还能实现‘抽桩’或拔桩
4. 被测代码的自动化静态分析
- 常用工具：Sonar、Coverity
5. 测试覆盖率的自动统计与分析
#### 2、代码级集成测试的自动化技术
- 代码级集成测试与单元测试的最大区别：代码级集成测试调用的其他函数都为真实的，不允许使用桩代码代替；单元测试可以；
#### Web Service 测试的自动化技术
- Web Service 测试主要指 SOUP API 和 REST API这两类API测试，最典型的是采用SoupUI和Postman等类似的工具，但这种工具一般都是界面手动发起Request并验证Response，难以CI/CD集成，所以出现了API自动化测试框架
- 代码级API测试用例，一般包括三个步骤：
1. 准备API测试数据
1. 准备调用参数，并调用
1. 验证返回结果
- 目前JAVA最流行的API测试框架是REST Assured
- Web Service 还包括：
1. 测试脚手架代码的自动化生成
2. 部分测试输入数据的自动生成
- 生成遵循边界值原则
3. Response验证的自动化
- 关注：返回状态码（state code）、Scheme结构（数据结构）以及具体的字段值
- 核心思想：自动识别出有差异的字段值，比较过程可以通过规则配置去掉类似：时间戳、会话ID（Session ID）等动态值
4. 基于SoupUI或Postman的自动化脚本生成
- 开发自动化代码转换生成工具，工具的输入为SoupUI或Postman的测试用例元数据（即JSON元文件），输出为符合API测试框架规范的基于代码实现的测试用例
#### GUI 测试的自动化技术
- GUI 自动化测试的两大方向：传统Web浏览器和移动端原生应用（Native App）的GUI自动化
- Web浏览器：主流开源方案：Selenium，商业方案：Micro Focus的UFT（前身是HP的QTP）
- 移动端：主流Appium，IOS集成了XCUITest，Android集成了UIAutomator和Espresso
- 评论：已有案例：Postman+服务器部署Newman+jenkins
- 小众全英文（不支持英文）：Katalon Studio
- jmeter做接口测试
- 我们现有的API:Python + Selenium + unittest
- GUI：Python + Appium
#### 总结：