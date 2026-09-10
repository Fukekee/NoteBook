配置该环境，如果下载了但是在hierachy里右键看不到对应的选项，先检查google AR core 有没有下载，其次，不要从asset store里下载，直接在package manager里add by name ——com.ptc.vuforia.engine（version 留空用最新兼容），然后点击install
——以上是我在unity6.2项目中配置出现的问题和解决方法

预留可能错误：
ArgumentException: Arial.ttf is no longer a valid built in font. Please use LegacyRuntime.ttf
…Vuforia/Scripts/DefaultInitializationErrorHandler.cs:211
![[Pasted image 20251010174103.png]]
![[Pasted image 20251010174134.png]]
当时只这么用方法二改好了。