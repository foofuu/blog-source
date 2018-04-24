---
title: Spring框架模块依赖关系
date: 2017-01-05 17:13:00
tags: [Spring]
categories: Web
---
很多人都在用spring开发java项目，但是配置maven依赖的时候并不能明确要配置哪些spring的jar，经常是胡乱添加一堆，编译或运行报错就继续配置jar依赖，导致spring依赖混乱，甚至下一次创建相同类型的工程时也不知道要配置哪些spring的依赖，只有拷贝，其实，当初我就是这么干的！
spring的jar包只有20个左右，每个都有相应的功能，一个jar还可能依赖了若干其他jar，所以，搞清楚它们之间的关系，配置maven依赖就可以简洁明了，下面举个例子，要在普通java工程使用spring框架，需要哪些jar呢？只要一个