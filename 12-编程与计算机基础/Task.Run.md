`Task.Run` 是 .NET 线程池里借一条工作线程跑一段代码。不是 Unity 主线程，也不是「协程线程」。

`// 主线程（按钮、Update）上调用`

`var result = await Task.Run(() =>`

`{`

`// 这里是线程池工作线程：只能算数、处理纯数据`

`// 不能 transform.position = ...，不能 Instantiate`

`return HeavyEncode(bytes);`

`});`

`// await 回来后，在 Unity 里通常又回到主线程`

`someTransform.position = result;`

要点：

1. 谁开： 主线程（或任意已有代码）调用 `Task.Run(...)`，运行时从线程池里派一条空闲工作线程。
2. 不是永久新线程： 用完还回池子，不必自己 `new Thread`。
3. 里面不能碰引擎对象。 算完用 `await` 回到主线程再改场景。
4. 你们项目登录用的是 `await client.Auth.SendPhoneVerificationCodeAsync`，那是等 HTTP，一般不会因此去 `Task.Run`。只有「这段纯 CPU 会卡主线程」才需要它。