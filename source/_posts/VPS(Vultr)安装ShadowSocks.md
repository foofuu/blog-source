---
title: VPS(Vultr)安装ShadowSocks.md
date: 2018-04-28 14:56:00
tags: [乱七八糟]
categories: 乱七八糟
---
### 1. 购买vps机器
Vultr东京节点ping值较好，所以买的5$/月的东京节点vp，记得勾选ipv6，有了ipv6可以访问北邮人等教育网的pt站点。

### 2. 安装bbr
bbr是谷歌开源的tcp拥塞控制算法，用了bbr后，ss代理的速度提升非常明显，bbr需要linux内核版本4.9以上，所以先升级内核。

#### 2.1 升级内核步骤
查看内核版本：
```
uname -r
```
初始版本：
3.10.0-514.2.2.el7.x86_64
安装ELRepo repo：
```
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
sudo rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm
```
elrepo是CentOS十分有用的稳定的软件源,与其他软件源不一样的是,这个第三方源主要是提供硬件驱动、内核更新方面的支持,如显卡、无线网卡、内核等等
安装最新内核：
```
sudo yum --enablerepo=elrepo-kernel install kernel-ml -y
```
确认结果：
```
rpm -qa | grep kernel
```
看到输出：
```
kernel-tools-libs-3.10.0-693.11.6.el7.x86_64
kernel-tools-3.10.0-693.11.6.el7.x86_64
kernel-3.10.0-693.el7.x86_64
kernel-3.10.0-693.11.6.el7.x86_64
kernel-ml-4.15.1-1.el7.elrepo.x86_64
```
最新版的kernel-ml-4.15.1-1.el7.elrepo.x86_64已经存在了。
将最新版内容设置为grub2启动项：
查看所有启动项条目：
```
sudo egrep ^menuentry /etc/grub2.cfg | cut -f 2 -d \'
```
输出：
```
CentOS Linux 7 Rescue 5c25e1a7d2514372b8dae0c5333e544e (4.15.1-1.el7.elrepo.x86_64)
CentOS Linux (4.15.1-1.el7.elrepo.x86_64) 7 (Core)
CentOS Linux (3.10.0-693.11.6.el7.x86_64) 7 (Core)
CentOS Linux (3.10.0-693.el7.x86_64) 7 (Core)
CentOS Linux (0-rescue-c73a5ccf3b8145c3a675b64c4c3ab1d4) 7 (Core)
```
每行编号是从0开始，所以4.15是编号为1的行，设置默认启动项为1：
```
sudo grub2-set-default 1
```
重启机器：
```
sudo shutdown -r now
```
查看新的内核版本：
```
uname -r
```
输出：
```
4.15.1-1.el7.elrepo.x86_64
```

##### 2.2 安装bbr
修改sysctl配置：
```
echo 'net.core.default_qdisc=fq' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_congestion_control=bbr' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```
确实配置是否生效：
```
sudo sysctl net.ipv4.tcp_available_congestion_control
```
输出：
```
net.ipv4.tcp_available_congestion_control = bbr cubic reno
```
查看确认：
```
sudo sysctl -n net.ipv4.tcp_congestion_control
```
输出：
```
bbr
```
查看是否加载：
```
lsmod | grep bbr
```
输出：
```
tcp_bbr                16384  0
```

### 3.安装shadowsocks

3.1 安装配置 shadowsocks
pip是 python 的包管理工具。在本文中将使用 python 版本的 shadowsocks，此版本的 shadowsocks 已发布到 pip 上，因此我们需要通过 pip 命令来安装。
```
curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
python get-pip.py
```

#### 3.2 安装配置 shadowsocks
```
pip install --upgrade pip
pip install shadowsocks
```

#### 3.3 创建配置文件/etc/shadowsocks.json
```
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "uzon57jd0v869t7w",
  "method": "aes-256-cfb"
}
```
说明：
method为加密方法，可选aes-128-cfb, aes-192-cfb, aes-256-cfb, bf-cfb, cast5-cfb, des-cfb, rc4-md5, chacha20, salsa20, rc4, table
server_port为服务监听端口
password为密码，可使用密码生成工具生成一个随机密码
以上三项信息在配置 shadowsocks 客户端时需要配置一致，具体说明可查看 shadowsocks 的帮助文档。

#### 3.4 配置自启动
新建启动脚本文件/etc/systemd/system/shadowsocks.service，
内容如下：
```
[Unit]
Description=Shadowsocks

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/ssserver -c /etc/shadowsocks.json

[Install]
WantedBy=multi-user.target
```

执行以下命令启动 shadowsocks 服务：
```
systemctl enable shadowsocks
systemctl start shadowsocks
```
为了检查 shadowsocks 服务是否已成功启动，可以执行以下命令查看服务的状态：
```
systemctl status shadowsocks -l
```

如果服务启动成功，则控制台显示的信息可能类似这样：
```
● shadowsocks.service - Shadowsocks
   Loaded: loaded (/etc/systemd/system/shadowsocks.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2015-12-21 23:51:48 CST; 11min ago
 Main PID: 19334 (ssserver)
   CGroup: /system.slice/shadowsocks.service
           └─19334 /usr/bin/python /usr/bin/ssserver -c /etc/shadowsocks.json

Dec 21 23:51:48 morning.work systemd[1]: Started Shadowsocks.
Dec 21 23:51:48 morning.work systemd[1]: Starting Shadowsocks...
Dec 21 23:51:48 morning.work ssserver[19334]: INFO: loading config from /etc/shadowsocks.json
Dec 21 23:51:48 morning.work ssserver[19334]: 2015-12-21 23:51:48 INFO     loading libcrypto from libcrypto.so.10
Dec 21 23:51:48 morning.work ssserver[19334]: 2015-12-21 23:51:48 INFO     starting server at 0.0.0.0:8388
```