---
title: ZooKeeper系列一：基本概念
date: 2018-06-04 17:13:00
tags: [ZooKeeper]
categories: Web
---
### 1.角色
一般的，在分布式系统中，构成集群的每一台机器都有自己的角色，最为典型的集群模式就是Master/Slave主备模式。在该模式中，我们把能够处理所有写操作的机器称为Master节点，并把所有通过异步复制方式获取最新数据、提供读服务的机器称为Slave节点。

而 Zookeeper 中，则是引入了领导者（Leader）、跟随者（Follower）、观察者（Observer）三种角色和领导（Leading）、跟随（Following）、观察（Observing）、寻找（Looking） 等相应的状态。在Zookeeper集群中的通过一种Leader选举的过程，来选定某个节点作为Leader节点，该节点为客户端提供读和写服务。而Follower和Observer节点，则都能提供读服务，唯一的区别在于，Observer机器不参与Leader选举过程和写操作的"过半写成功"策略，Observer只会被告知已经commit的proposal。因此Observer可以在不影响写性能的情况下提升集群的读性能。

{% qnimg 20180604-1.jpg %}


### 2.会话
Session指客户端会话。在Zookeeper中，一个客户端会话是指客户端和服务器之间的一个TCP长连接。客户端启动的时候，会与服务端建立一个TCP连接，客户端会话的生命周期，则是从第一次连接建立开始算起。通过这个连接，客户端能够通过心跳检测与服务器保持有效的会话，并向Zookeeper服务器发送请求并接收响应，以及接收来自服务端的 Watch 事件通知。

Session的sessionTimeout参数，用来控制一个客户端会话的超时时间。当服务器压力太大或者是网络故障等各种原因导致客户端连接断开时，Client会自动从Zookeeper 地址列表中逐一尝试重连（重试策略可使用 Curator 来实现）。只要在sessionTimeout规定的时间内能够重新连接上集群中任意一台服务器，那么之前创建的会话仍然有效。如果，在sessionTimeout时间外重连了，就会因为 Session 已经被清除了，而被告知SESSION_EXPIRED，此时需要程序去恢复临时数据。

{% qnimg 20180604-2.jpg %}

### 3.数据模型
在Zookeeper中，节点分为两类，第一类是指构成集群的机器，称之为机器节点；第二类则是指 数据模型中的数据单元，称之为数据节点ZNode。Zookeeper将所有数据存储在内存中，数据模型的结构类似于树ZNodeTree），由斜杠（/）进行分割的路径，就是一个 ZNode，例如 /foo/path1。每个 ZNode 上都会保存自己的数据内容 和 一系列属性信息。

ZNode可以分为持久节点（PERSISTENT）和临时节点（EPHEMERAL）两类。所谓持久节点是指一旦这个ZNode被创建了，除非主动进行移除操作，否则这个节点将一直保存在Zookeeper上。而临时节点的生命周期，是与客户端会话绑定的，一旦客户端会话失效，那么这个客户端创建的所有临时节点都会被移除。在HBase中，集群则是通过 /hbase/rs/* 和 /hbase/master 两个临时节点，来监控 HRegionServer 进程的加入和宕机 和 HMaster 进程的 Active 状态。

另外，Zookeeper还有一种顺序节点（SEQUENTIAL）。该节点被创建的时候，Zookeeper 会自动在其子节点名上，加一个由父节点维护的、自增整数的后缀（上限：Integer.MAX_VALUE）。该节点的特性，还可以应用到 持久 / 临时节点 上，组合成 持久顺序节点（PERSISTENT_SEQUENTIAL）和临时顺序节点（EPHEMERAL_SEQUENTIAL）。

{% qnimg 20180604-3.jpg %}

### 4.版本
Zookeeper的每个ZNode上都会存储数据，对应于每个ZNode，Zookeeper都会为其维护一个叫做Stat的数据结构，Stat中记录了这个ZNode的三个数据版本，分别是version（当前 ZNode数据内容的版本），cversion（当前ZNode子节点的版本）和aversion（当前 ZNode的ACL变更版本）。这里的版本起到了控制Zookeeper操作原子性的作用。

### 5.Watcher
Watcher（事件监听器）是Zookeeper 提供的一种发布/订阅的机制。Zookeeper允许用户在指定节点上注册一些Watcher，并且在一些特定事件触发的时候，Zookeeper服务端会将事件通知给订阅的客户端。该机制是Zookeeper实现分布式协调的重要特性。

{% qnimg 20180604-4.jpg %}

### 6.ACL
类似于Unix文件系统，Zookeeper采用ACL（Access Control Lists）策略来进行权限控制。

Command | Comment
---|---
CREATE (c) | 创建子节点的权限
READ (r) | 获取节点数据和子节点列表的权限
WRITE (w) | 更新节点数据的权限
DELETE (d) | 删除当前节点的权限
ADMIN (a) | 管理权限，可以设置当前节点的 permission


Scheme | ID| Comment
---|---|---
world | anyone | Zookeeper中对所有人有权限的结点就是属于world:anyone
auth |不需要id | 通过authentication的user都有权限
digest | username:BASE64 (SHA1(password)) | 需要先通过 username:password 形式的 authentication
ip | 	id 为客户机的 IP 地址（或者 IP 地址段） | ip:192.168.1.0/14，表示匹配前 14 个 bit 的 IP 段
super |  | 对应的 id 拥有超级权限（CRWDA）

#### IP
```
@Before
public void init() throws Exception {
  zoo = new ZooKeeper(HOST.concat(":" + CLIENT_PORT), TIME_OUT_MILLISECOND, null);
  acls = new ArrayList<>();
  acls.add(new ACL(ZooDefs.Perms.ALL, new Id(IP, "10.24.40.178")));
  acls.add(new ACL(ZooDefs.Perms.ALL, new Id(IP, "127.0.0.1")));
  aclsNoAuth = new ArrayList<>();
  aclsNoAuth.add(new ACL(ZooDefs.Perms.ALL, new Id(IP, "127.0.0.1")));
}

@Test
public void ipAcl() throws Exception {
  if (zoo.exists(IP_PATH, null) != null) zoo.delete(IP_PATH, -1);
  if (zoo.exists(IP_PATH_NO_AUTH, null) != null) zoo.delete(IP_PATH_NO_AUTH, -1);
  zoo.create(IP_PATH, IP.getBytes(), acls, CreateMode.PERSISTENT);
  assertEquals(IP, new String(zoo.getData(IP_PATH, false, null)));
  zoo.create(IP_PATH_NO_AUTH, IP.getBytes(), aclsNoAuth, CreateMode.PERSISTENT);
  try {
    zoo.getData(IP_PATH_NO_AUTH, false, null);
  } catch (KeeperException.NoAuthException e) {
    assertEquals("KeeperErrorCode = NoAuth for ".concat(IP_PATH_NO_AUTH), e.getMessage());
  }
}
```
简单易用，直接在物理层面，对用户进行权限隔离；但是，如果不将 127.0.0.1 放入到 IP Acl 列表里，会给服务端的运维带来麻烦

#### IP
```
@Before
public void init() throws Exception {
  zoo = new ZooKeeper(HOST.concat(":" + CLIENT_PORT), TIME_OUT_MILLISECOND, null);
  zoo.addAuthInfo("digest", "yuzhouwan:com".getBytes());
  zooNoAuth = new ZooKeeper(HOST.concat(":" + CLIENT_PORT), TIME_OUT_MILLISECOND, null);
}
@Test
public void digestAcl() throws Exception {
  if (zoo.exists(AUTH_PATH_CHILD, null) != null) zoo.delete(AUTH_PATH_CHILD, -1);
  if (zoo.exists(AUTH_PATH, null) != null) zoo.delete(AUTH_PATH, -1);
  zoo.create(AUTH_PATH, bytes, ZooDefs.Ids.CREATOR_ALL_ACL, CreateMode.PERSISTENT);
  try {
    zooNoAuth.create(AUTH_PATH_CHILD, bytes, ZooDefs.Ids.CREATOR_ALL_ACL, CreateMode.PERSISTENT);
  } catch (KeeperException.InvalidACLException e) {
    assertEquals("KeeperErrorCode = InvalidACL for /auth_test/child", e.getMessage());
  }
  zoo.create(AUTH_PATH_CHILD, bytes, ZooDefs.Ids.CREATOR_ALL_ACL, CreateMode.PERSISTENT);
  try {
    zooNoAuth.delete(AUTH_PATH_CHILD, -1);
  } catch (KeeperException.NoAuthException e) {
    assertEquals("KeeperErrorCode = NoAuth for /auth_test/child", e.getMessage());
  }
  assertEquals(AUTH_PATH, new String(zoo.getData(AUTH_PATH, false, null)));
}
```
可以建立角色，按照用户名、密码进行权限控制；但是，想要修改某个用户的密码，需要对所有的 ACLs 做更改

### 7. 参考文章
- [Zookeeper原理与优化](https://yuzhouwan.com/posts/31915/)
