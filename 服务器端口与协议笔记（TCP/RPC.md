RPC = Remote Procedure Call（远程过程调用）。  
本地你写的是「调用一个函数」，实际是：

1. 把参数打包成字节
2. 经网络发给另一台机器（这是 IO）
3. 对面拆包，执行对应函数
4. 有的还会把结果发回来（再一次 IO）

和「在本机 `foo()`」的差别：中间隔着网线，有延迟、会丢包、要对齐两边的代码版本。

在你们工程里，这就是 NGO 的那套：

- `[ServerRpc]`：客户端调用 → 数据包到主机 → 主机上执行（例如校验谁被飞挝打中）
- `[ClientRpc]`：主机调用 → 数据包到指定客户端 → 客户端执行（例如 `RPC_ApplyBlackoutClientRpc`、`RPC_ShowHudToastClientRpc`）

`PropEffectSystem` 里给目标玩家弹 Toast、播黑屏，走的就是 ClientRpc：主机算完规则，把「你被黑屏 2 秒」这条指令送到对方机器。  
等的是 UDP/TCP 包到了没有，不是在算三角函数。所以它属于网络 IO。