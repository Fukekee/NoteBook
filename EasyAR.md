对于需要SLAM进行空间构建（环境理解）的AR效果来说，easyAR需要有效的FrameSource
包含的有：
ARCore（谷歌服务）
ARKit（苹果）
AREngine(华为)
VisionOS(VisionPro)
MotionTracker(纯IMU模式)
重点是MotionTracker：
EasyAR 自带的 SLAM（Motion Tracker / Visual SLAM）
自研的，测试机中的vivoX200就是使用了这个Motion Tracker
问题：为什么可以实现AR空间放置效果的手机（oppo)打开本应用却无AR效果？(手机硬件有能力但不出AR效果)
MotionTracker: Unavailable，这行报错说明这台设备不被 EasyAR 的 SLAM 支持（或初始化失败）——EasyAR 的 SLAM 有设备适配限制
(最新的EasyAR插件版本没有声明增加了支持的设备)

出现报错：URP RenderPipelineAsset not properly setup
解决方法：
![[Pasted image 20260320142057.png]]![[Pasted image 20260320142114.png]]
![[Pasted image 20260320142858.png]]要记住修改的是这个mobile的render才有用