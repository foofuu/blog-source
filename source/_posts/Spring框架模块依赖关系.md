---
title: Spring框架模块依赖关系
date: 2018-04-24 17:13:00
tags: [Spring]
categories: Web
---
很多人都在用spring开发java项目，但是配置maven依赖的时候并不能明确要配置哪些spring的jar，经常是胡乱添加一堆，编译或运行报错就继续配置jar依赖，导致spring依赖混乱，甚至下一次创建相同类型的工程时也不知道要配置哪些spring的依赖，只有拷贝，其实，当初我就是这么干的！
spring的jar包只有20个左右，每个都有相应的功能，一个jar还可能依赖了若干其他jar，所以，搞清楚它们之间的关系，配置maven依赖就可以简洁明了，下面举个例子，要在普通java工程使用spring框架，需要哪些jar呢？只要一个：
```
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>3.2.17.RELEASE</version>
</dependency>
```
那要在web工程中引入spring mvc呢？也只要配置一个依赖：
```
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>3.2.17.RELEASE</version>
</dependency>
```
为什么可以这样配置？接下来我们以spring 3.2.17.RELEASE版本为例，介绍spring框架结构，spring 4稍有不同，将在最后介绍，spring官网给出了一张spring3的结构图：
{% qnimg 20180425-1.png %}
